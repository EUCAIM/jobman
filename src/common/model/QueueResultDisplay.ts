import QueueResult from "./QueueResult.js";

/**
 * @openapi
* components:
*   schemas:
*     QueueResultDisplayRef:
*       type: object
*       additionalProperties: 
*           $ref: '#/components/schemas/QueueResult'
*     QueueResultDisplay:
*       type: object
*       required:
*           - result
*           - updated
*       properties:
*         result:
*           $ref: '#/components/schemas/QueueResultDisplayRef'
*         updated:
*           type: string
*       
 */
export default class QueueResultDisplay {

    result: {[key: string]: QueueResult};
    updated: Date;


}