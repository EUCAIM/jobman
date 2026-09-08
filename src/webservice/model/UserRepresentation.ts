import type KeycloakApiToken from "./KeycloakApiToken.js";

export default interface UserRepresentation {

    id: string;
    username: string;
    enabled: boolean;
    apiToken: KeycloakApiToken;

}