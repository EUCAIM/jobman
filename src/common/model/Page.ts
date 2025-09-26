
/**
 * @openapi
* components:
*   schemas:
*     Page:
*       type: object
*       properties:
*         data: {}
*         size: 
*           type: number
*         total:
*           type: number
*         skip:
*           type: number
*       required:
*         - data
*         - size
*         - total
*         - skip
*     Page-ImageDetails:
*       allOf: 
*         - $ref: '#/components/schemas/Page'
*         - type: object
*           properties:
*             data: 
*               type: array
*               items:
*                 $ref: '#/components/schemas/ImageDetails'
*           required:
*               - data
*               - size
*               - total
*               - skip
*     Page-KubeResourcesFlavor:
*       allOf: 
*         - $ref: '#/components/schemas/Page'
*         - type: object
*           properties:
*             data: 
*               type: array
*               items:
*                 $ref: '#/components/schemas/KubeResourcesFlavor'
*           required:
*               - data
*               - size
*               - total
*               - skip
*     Page-JobInfo:
*       allOf: 
*         - $ref: '#/components/schemas/Page'
*         - type: object
*           properties:
*             data:
*               type: array
*               items:
*                 $ref: '#/components/schemas/JobInfo'
*           required:
*               - data
*               - size
*               - total
*               - skip
 */

export default interface Page<T> {

    data: T[];
    size: number;
    total: number;
    skip: number;
}