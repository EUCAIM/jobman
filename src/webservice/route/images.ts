import express from "express";
import type { Request, Response, NextFunction } from "express";
import type OidcAuth from "../service/OidcAuth.js";
import commonRequest from "./common.js";
import type ImageInfo from "../../common/model/ImageInfo.js";
import type Page from "../../common/model/Page.js";
import type HarborManager from "../service/HarborManager.js";

const imagesRouter = function(oidcAuth: OidcAuth, hm: HarborManager) {
    let routerObj = express.Router();
    
    routerObj.get('/', async (req: Request, res: Response, next: NextFunction) => {
      commonRequest<Page<ImageInfo> | null>(req, res, next, oidcAuth, hm.images.bind(hm));
    });
  
    routerObj.get('/:imageName/description', async (req: Request, res: Response, next: NextFunction) => {
      commonRequest<string | null>(req, res, next, oidcAuth, hm.imageDetails.bind(hm, { image: req.params["imageName"] ?? ""}));
    });

    return routerObj;
  
  }
  
  export default imagesRouter;