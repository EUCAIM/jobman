/**
 * @openapi
* components:
*   schemas:
*     Tag:
*       type: object
*       required:
*           - name
*           - entrypoint
*           - cmd
*       properties:
*         name:
*           type: string
*         entrypoint:
*           type: array
*           items:
*             type: string 
*         cmd:
*           type: array
*           items:
*             type: string 
 */
export interface Tag {
    name: string;
    entrypoint: string[];
    cmd: string[];
}

/**
 * @openapi
* components:
*   schemas:
*     ImageDetails:
*       type: object
*       required:
*           - name
*           - tags
*           -  desc
*       properties:
*         name:
*           type: string
*         tags:
*           type: array
*           items:
*             $ref: '#/components/schemas/Tag' 
*         desc:
*           type: [string, 'null']
 */
export default interface ImageDetails {

    name: string;
    tags: Tag[];
    desc: string | null;

}