/**
 * @openapi
* components:
*   schemas:
*     EnvEntry:
*       type: object
*       properties:
*         name:
*           type: string
*         value:
*           type: string
 */
export default interface EnvEntry {

    name: string;
    value?: string;
}