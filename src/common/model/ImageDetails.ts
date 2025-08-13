
export interface Tag {
    name: string;
    entrypoint: string[];
    cmd: string[];
}

export default interface ImageDetails {

    name: string;
    tags: Tag[];
    desc: string | null | undefined;

}