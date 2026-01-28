import type Artifact from "./Artifact.js";
/**
* @openapi
* components:
*   schemas:
*     ImageRepo:
*       type: object
*       required:
*           - name
*           - repository
*           - artifacts
*       properties:
*         name:
*           type: string
*         repository:
*           type: string
*         description:
*           type: [string, null]
*         artifacts:
*           type: array
*           items:
*             $ref: '#/components/schemas/Artifact' 
 */
export default interface ImageRepo {

    name: string;
    repository: string;
    description?: string;
    artifacts: Artifact[];
}