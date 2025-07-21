import AbstractDto from "./AbstractDto.js";

export default class ImageInfo extends AbstractDto {

    name: string;
    tags: string[]; 
    desc?: string;

    public static override from(obj: any) {
        return Object.assign(new ImageInfo(), obj);
    }
}