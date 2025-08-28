import type Artifact from "./Artifact.js";

export default interface ImageRepo {

    name: string;
    description?: string;
    artifacts: Artifact[];
}