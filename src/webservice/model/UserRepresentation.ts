import type KeycloakApiToken from "./KeycloakApiToken.js";

export default interface UserRepresentation {

    id: string;
    username: string;
    enabled: boolean;
    firstName?: string | null;
    lastName?: string | null;
    email: string;
    apiToken: KeycloakApiToken;

}