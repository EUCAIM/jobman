
/**
 * @openapi
 * components:
 *   schemas:
 *     ErrorResponse:
 *       additionalProperties: false
 *       properties:
 *         message:
 *           type: string
 *         status:
 *           type: number
 *       required:
 *         - message
 *         - status
 *       type: object
 */
export default interface ErrorResponse {

    message: string;
    status: number;
}