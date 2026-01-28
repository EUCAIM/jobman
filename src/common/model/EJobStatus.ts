
/**
 * @openapi
* components:
*   schemas:
*     EJobStatus:
*       type: string
*       enum:
*             - PENDING
*             - PENDING_ERROR
*             - RUNNING
*             - SUCCESS
*             - ERROR
*             - UNKNOWN
 * 
 */

enum EJobStatus {
    Pending = "PENDING", 
    PendingError = "PENDING_ERROR", 
    Running = "RUNNING", 
    Succeeded = "SUCCESS", 
    Failed = "ERROR", 
    Unknown = "UNKNOWN"
}

export default EJobStatus;