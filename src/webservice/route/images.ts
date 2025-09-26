import express from "express";
import type { Request, Response, NextFunction } from "express";
import type OidcAuth from "../service/OidcAuth.js";
import commonRequest from "./common.js";
import type Artifact from "../../common/model/Artifact.js";
import type Page from "../../common/model/Page.js";
import type HarborManager from "../service/HarborManager.js";

const imagesRouter = function(oidcAuth: OidcAuth, hm: HarborManager) {
    let routerObj = express.Router();
    
    /**
    * @openapi
    *  /images/:
    *    get:
    *      security:
    *        - bearerAuth: []
    *        - apiToken: []
    *      tags:
    *        - images
    *      summary: Get a list of available images to be used by your job
    *      operationId: getImages
    *      responses:
    *        '200':
    *          description: Successful operation
    *          content:
    *            application/json:
    *              schema:
    *                $ref: '#/components/schemas/Page-ImageDetails'
    *        '401':
    *          description: Unauthorized
    *          content:
    *            application/json:
    *              schema:
    *                $ref: '#/components/schemas/ErrorResponse'
     */
    routerObj.get('/', async (req: Request, res: Response, next: NextFunction) => {
      commonRequest<Page<Artifact> | null>(req, res, next, oidcAuth, hm.images.bind(hm));
    });
  
    /**
    * @openapi
    *  /images/{imageName}/description/:
    *    get:
    *      tags:
    *        - images
    *      summary: Get the description of an image by its name
    *      operationId: getImageByName
    *      parameters:
    *        - name: imageName
    *          in: path
    *          description: 'The name of the image'
    *          required: true
    *          schema:
    *            type: string
    *      responses:
    *        '200':
    *          description: Successful operation
    *          content:
    *            text/plain:
    *              schema:
    *                type: string
    *        '401':
    *          description: Unauthorized
    *          content:
    *            application/json:
    *              schema:
    *                $ref: '#/components/schemas/ErrorResponse'
     */
    routerObj.get('/:imageName/description', async (req: Request, res: Response, next: NextFunction) => {
      commonRequest<string | null>(req, res, next, oidcAuth, hm.imageDetails.bind(hm, { image: req.params["imageName"] ?? ""}));
    });

    return routerObj;
  
  }
  
  export default imagesRouter;