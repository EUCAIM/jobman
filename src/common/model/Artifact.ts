/**
* @openapi
* components:
*   schemas:
*     Artifact:
*       type: object
*       required:
*           - entrypoint
*           - cmd
*           - digest
*           - tags
*       properties:
*         entrypoint:
*           type: array
*           items:
*               type: string
*         cmd:
*           type: array
*           items:
*               type: string
*         digest:
*           type: string
*         tags:
*           type: array
*           items:
*               type: string
 */
export default interface Artifact{

    entrypoint: string[];
    cmd: string[];
    digest: string;
    tags: string[]; 
}