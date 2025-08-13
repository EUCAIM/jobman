import type EAuthorizationType from "./EAuthorizationType.js";

export default interface UserAuthorization {

    type: EAuthorizationType;
    token: string;
}