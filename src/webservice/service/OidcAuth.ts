import type { Request } from 'express';
import { Headers, Response } from 'node-fetch';
import * as jose from 'jose';
import type UserRepresentation from "../model/UserRepresentation.js";
import type KeycloakApiToken from "../model/KeycloakApiToken.js";
import AuthenticationError from "../error/AuthenticationError.js";
import type { SettingsWebService } from '../model/SettingsWebService.js';
import type UserAuthorization from '../model/UserAuthorization.js';
import EAuthorizationType from '../model/EAuthorizationType.js';
import Util from '../../common/Util.js';
import UserRoles from '../model/UserRoles.js';

interface KeycloakTokenPayload extends jose.JWTPayload {
  preferred_username?: string;
  name?: string;

  realm_access?: {
    roles: string[];
  };

  resource_access?: {
    [clientId: string]: {
      roles: string[];
    };
  };

  scope?: string;
}

export default class OidcAuth {

  static RETRY_COUNT = 3;
  static RETRY_DELAY = 2000;

  protected appConf: SettingsWebService;
  protected realmUrl: string;

  constructor(appConf: SettingsWebService) {
    this.appConf = appConf;
    this.realmUrl = `${this.appConf.oidc.url}/realms/${this.appConf.oidc.realm}`
  }

  public async authenticateAndAuthorize(req: Request): Promise<string | null> {
    const userAuth: UserAuthorization = this.getUserAuthorization(req);
    if (userAuth.type === EAuthorizationType.APITOKEN) {
      const ur: UserRepresentation = await this.auth(userAuth.token);
      const kapReq: KeycloakApiToken | null = this.validateApiToken(userAuth.token, ur);
      if (kapReq) {
        return ur.username;//ur.id;
      } else {
        return null;
      }

    } else if (userAuth.type === EAuthorizationType.BEARER) {
      let jwks = null;
      try {
        jwks = jose.createRemoteJWKSet(
          new URL(`${this.realmUrl}/protocol/openid-connect/certs`)
        );
      } catch (e: any) {
        console.error(`Error getting Keycloak keys: ${e.message}`);
        throw new Error("Internal server error");
      }
      
      try {
        const { payload } = await jose.jwtVerify(userAuth.token, jwks, {
          issuer: this.realmUrl,
          audience: this.appConf.oidc.audience,
        });
        
        const kcPayload = payload as KeycloakTokenPayload;
        const clientRoles = kcPayload.resource_access?.[this.appConf.oidc.clientId]?.roles ?? [];

        if (!clientRoles.includes(UserRoles.MANAGE_OWN_JOBS))
          throw new AuthenticationError("Invalid token", "missing roles", 401);

        const username = typeof kcPayload?.preferred_username === 'string'
          ? kcPayload?.preferred_username
          : null;//(kcPayload.sub ?? null);

        return username;
      } catch (e: any) {
        console.error(`Error validating token: ${e.message}`);
        throw new AuthenticationError("Token validation error", "Invalid token", 401);
      }
    } else {
      console.error(`Unsupported authorization with type '${userAuth.type}'`);
      throw new AuthenticationError("Authorization error", "Unsupported authorization", 401);
    }

  }

  public async auth(token: string): Promise<UserRepresentation> {
    const reqKap: KeycloakApiToken | null = this.parseReqUserRepresentation(token);
    if (reqKap) {
      const headers: Headers = new Headers();
      headers.set("Content-Type", "application/x-www-form-urlencoded");
      console.log("Obtain application token");
      const body = new URLSearchParams({
        'client_id': this.appConf.oidc.clientId,
        'client_secret': this.appConf.oidc.clientSecret,
        'grant_type': "client_credentials"
      });

      const authR: Response | null = await Util.fetchRetry(
        this.appConf.oidc.url + "/realms/" + this.appConf.oidc.realm + "/protocol/openid-connect/token",
        {
          method: "POST",
          headers,
          body
        }
      );
      if (authR && authR.status === 200) {
        const authRJson: { [k: string]: any } = await authR.json() as { [k: string]: any };
        if (authRJson["access_token"]) {
          console.log("Obtain user information for " + reqKap.userId);
          const headers: Headers = new Headers();
          headers.set("Authorization", `Bearer ${authRJson["access_token"]}`);
          const getUserCredentialsR: Response | null = await Util.fetchRetry(
            this.appConf.oidc.url + "/admin/realms/" + this.appConf.oidc.realm + "/users/" + reqKap.userId,
            {
              method: "GET",
              headers
            }
          );
          if (getUserCredentialsR && getUserCredentialsR.status === 200) {
            const ur: UserRepresentation = this.userRepresentationKeycloak(await getUserCredentialsR.json());
            return ur;
          } else {
            console.error(`Unable to retrieve user information (status ${getUserCredentialsR?.status}): ${(await getUserCredentialsR?.text()) ?? ""}`);
            throw new AuthenticationError("User info error", "User info error",
              getUserCredentialsR?.status ?? 401);
          }
        } else {
          throw new AuthenticationError("Token error", "The system was unable to obtain a user token", 500);
        }
      } else {
        console.error(authR);
        throw new AuthenticationError(authR?.statusText ?? "Authentication Error",
          (await authR?.text()) ?? "Authentication Error", authR?.status ?? 401);
      }
    } else {
      throw new AuthenticationError("Token error", "Token format invalid", 401);
    }
  }

  public userRepresentationKeycloak(resp: any): UserRepresentation {
    const result: { [k: string]: any } = Object.create(null);
    //const resp: any = JSON.parse(json);
    if (resp["id"]) { result["id"] = resp["id"]; }
    else throw new AuthenticationError("Missing field", "Missing field 'id' from Keycloak authentication response", 500);
    if (resp["username"]) { result["username"] = resp["username"]; }
    else throw new AuthenticationError("Missing field", "Missing field 'username' from Keycloak authentication response", 500);
    if (resp["enabled"]) { result["enabled"] = Boolean(resp["enabled"]); }
    else throw new AuthenticationError("Missing field", "Missing field 'enabled' from Keycloak authentication response", 500);
    if (resp["attributes"]?.[this.appConf.oidc.apiTokenAttributeName]) {
      result["apiToken"] = JSON.parse(atob(resp["attributes"]?.[this.appConf.oidc.apiTokenAttributeName])) as KeycloakApiToken;
    } else {
      console.error(`Missing attribute '${this.appConf.oidc.apiTokenAttributeName}' from Keycloak authentication response`);
      throw new AuthenticationError("Missing field", "Missing attribute", 500);
    }
    return result as UserRepresentation;
  }

  public validateApiToken(token: string, ur: UserRepresentation): KeycloakApiToken | null {
    const kapReq: KeycloakApiToken | null = this.parseReqUserRepresentation(token);
    if (kapReq && kapReq.secret === ur.apiToken.secret) {
      return kapReq;
    } else {
      return null;
    }
  }

  public getUserAuthorization(req: Request): UserAuthorization {
    const token: string | null | undefined = req.headers["authorization"];
    if (token) {
      const parts: string[] = token.split(" ");
      if (parts.length === 2 && parts[0] && parts[1] && parts[1].length > 0) {
        const type: string = parts[0].toLowerCase();
        switch (type) {
          case EAuthorizationType.BEARER: return { type: EAuthorizationType.BEARER, token: parts[1] };
          case EAuthorizationType.APITOKEN: return { type: EAuthorizationType.APITOKEN, token: parts[1] };
          default: throw new Error(`Unsupported authorization type '${type}'`);
        }
      } else {
        throw new AuthenticationError("Invalid authorization header", "Invalid authorization header.", 400);
      }
    } else {
      throw new AuthenticationError("Missing authorization header", "Missing authorization header.", 400);
    }

  }

  public parseReqUserRepresentation(token: string): KeycloakApiToken | null {
    return JSON.parse(Buffer.from(token, 'base64').toString('utf-8')) as KeycloakApiToken;
  }
}