
export default interface Artifact{

    entrypoint: string[];
    cmd: string[];
    digest: string;
    tags: string[]; 
}