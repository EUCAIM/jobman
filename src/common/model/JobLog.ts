/**
 * @openapi
* components:
*   schemas:
*     JobLog:
*       type: object
*       required:
*           - stdOut
*       properties:
*         stdOut: 
*           type: string
 */
export default interface JobLog {

    stdOut: string;
}