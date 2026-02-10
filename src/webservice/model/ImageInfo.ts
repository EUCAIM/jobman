import type { ImagePullSecret } from "./SettingsWebService.js";

export default interface ImageInfo {

    fullUrl: string;
    imagePullSecrets?: ImagePullSecret[] | null | undefined;
}