
/**
 * @openapi
* components:
*   schemas:
*     JobSubmitSuccess:
*       type: object
*       required:
*           - jobName
*       properties:
*           jobName: 
*             type: string
 */
export default interface JobSubmiSuccess {
    jobName: string;
}