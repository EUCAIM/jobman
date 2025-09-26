
/**
 * @openapi
* components:
*   schemas:
*     KubeResourcesFlavor: 
*       type: object
*       properties:
*         name:
*           type: string
*         description:
*           type: string
*         resources:
*           type: object
*           properties:
*             requests:
*               type: object
*               additionalProperties:
*                 type: string
*             limits:
*               type: object
*               additionalProperties:
*                 type: string
*         maxRunTime:
*           type: integer
 */
export default interface KubeResourcesFlavor {
    name: string;
    description?: string | null;
    resources: {
        requests?: {
            [key: string]: string
        },
        limits?: {
            [key: string]: string
        }
    };
    maxRunTime: number;

}