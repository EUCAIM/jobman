import type EJobStatus from "./EJobStatus.js";

/**
 * @openapi
* components:
*   schemas:
*     JobInfo:
*       type: object
*       required:
*           - name
*           - status
*           - createdAt
*           - position
*           - flavor
*       properties:
*         name: 
*           type: string
*         uid:
*           type: string
*         status: 
*           $ref: '#/components/schemas/EJobStatus'
*         createdAt: 
*           type: string
*         position: 
*           type: number
*         flavor:
*           type: string
 */
export default class JobInfo {
    
    name: string;
    uid?: string | undefined;
    status: EJobStatus;
    createdAt: string | null;
    position: number;
    flavor: string;
    
}