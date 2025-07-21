import express from "express";
import type { Request, Response, NextFunction } from "express";
import type KubeManager from "../service/KubeManager.js";
import type OidcAuth from "../service/OidcAuth.js";
import commonRequest from "./common.js";
import type ImageInfo from "../../common/model/ImageInfo.js";
import type Page from "../../common/model/Page.js";

const imagesRouter = function(oidcAuth: OidcAuth, km: KubeManager) {
    let routerObj = express.Router();
    
    routerObj.get('/', async (req: Request, res: Response, next: NextFunction) => {
      commonRequest<Page<ImageInfo> | null>(req, res, next, oidcAuth, km.images.bind(km));
    });
  
    routerObj.get('/:imageName/description', async (req: Request, res: Response, next: NextFunction) => {
      commonRequest<string | null>(req, res, next, oidcAuth, km.imageDetails.bind(km, { image: req.params["imageName"] ?? ""}));
    });

    return routerObj;
  
  }
  
  export default imagesRouter;