import type EJobStatus from "./EJobStatus.js";
/**
 * @openapi
* components:
*   schemas:
*     JobDetailsEnv:
*       type: object
*       required:
*           - name
*           - value
*       properties:
*         name: 
*           type: string
*         value: 
*           type: [string, 'null']
*/
export interface JobDetailsEnv {
    name: string;
    value: string | null;
}

/**
 * @openapi
* components:
*   schemas:
*     JobDetailsMount:
*       type: object
*       required:
*           - source
*           - mountPath
*           - readOnly
*       
*       properties:
*         source: 
*           type: string
*         mountPath: 
*           type: [string, 'null']
*         readOnly: 
*           type: [boolean, 'null']
*/
export interface JobDetailsMount {
    source: string;
    mountPath: string | null;
    readOnly: boolean | null;
}

/**
 * @openapi
* components:
*   schemas:
*     JobDetailsHost:
*       type: object
*       required:
*           - serverName
*           - user
*           - uid
*           - gid       
*       properties:
*         serverName: 
*           type: [string, 'null']
*         user: 
*           type: [string, 'null']
*         uid: 
*           type: [number, 'null']
*         gid: 
*           type: [number, 'null']
*/
export interface JobDetailsHost {
    serverName: string | null;
    // Can't be obtained from k8s
    user: string | null;
    uid: number | null;
    gid: number | null;
}

/**
 * @openapi
* components:
*   schemas:
*     JobDetailsResourcesUsage:
*       type: object
*       required:
*           - cpu
*           - memory
*       properties:
*         cpu: 
*           type: [string, 'null']
*         memory: 
*           type: [string, 'null']
*/
export interface JobDetailsResourcesUsage {
    cpu: string | null;
    memory: string |  null; 
    //io: string[] | null;

}

/**
 * @openapi
* components:
*   schemas:
*     JobDetailsResources:
*       type: object
*       required:
*           - usage
*       properties:
*         usage: 
*           type: [array, 'null']
*           items:
*             $ref: '#/components/schemas/JobDetailsResourcesUsage'
*/
export interface JobDetailsResources {

    usage: JobDetailsResourcesUsage | null;
}

/**
 * @openapi
* components:
*   schemas:
*     JobDetails:
*       type: object
*       required:
*           - name
*           - status
*           - createdAt
*           - position
*           - flavor
*           - exitCode
*           - startedAt
*           - finishedAt
*           - executionDuration
*           - errors
*           - user
*           - image
*           - privileged
*           - command
*           - args
*           - host
*           - resources
*       properties:
*         name: 
*           type: string
*         uid:
*           type: [string, 'null']
*         status: 
*           $ref: '#/components/schemas/EJobStatus'
*         createdAt: 
*           type: [string, 'null']
*         position: 
*           type: number
*         flavor:
*           type: string
*         exitCode:
*           type: [number, 'null']
*         startedAt:
*           type: [string, 'null']
*         finishedAt:
*           type: [string, 'null']
*         executionDuration:
*           type: [number, 'null']
*         errors:
*           type: array
*           items: 
*             type: string
*         user:
*           type: [number, 'null']
*         image:
*           type: [number, 'null']
*         privileged:
*           type: [boolean, 'null']
*         mounts: 
*           type: array
*           items: 
*               $ref: '#/components/schemas/JobDetailsMount'
*         env: 
*           type: [array, 'null']
*           items: 
*               $ref: '#/components/schemas/JobDetailsEnv'
*         command:
*           type: [array, 'null']
*           items: 
*               type: string
*         args:
*           type: [array, 'null']
*           items: 
*               type: string
*         host: 
*           $ref: '#/components/schemas/JobDetailsHost'
*         resources: 
*           $ref: '#/components/schemas/JobDetailsResources'
* 
 */
export default interface JobDetails {

    name: string;
    uid?: string | null;
    status: EJobStatus;
    createdAt: string | null;
    position: number;
    flavor: string;
    exitCode: number | null;
    startedAt: string | null;
    finishedAt: string | null;
    executionDuration: number | null;
    errors: string[];
    user: string | null;
    image: string | null;
    privileged: boolean | null;
    mounts: JobDetailsMount[];
    env: JobDetailsEnv[] | null;
    command: string[] | null;
    args: string[] | null;
    // Needed by the FEM client - purpose not yet defined
    host: JobDetailsHost;
    resources: JobDetailsResources;
}