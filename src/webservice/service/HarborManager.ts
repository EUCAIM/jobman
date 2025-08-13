
import https from "https";
import fetch from "node-fetch";
import type { RequestInit, Response } from "node-fetch";

import type ImageDetailsProps from "../../common/model/args/ImageDetailsProps.js";
import { KubeOpReturnStatus, KubeOpReturn } from "../../common/model/KubeOpReturn.js";
import type { SettingsWebService } from "../model/SettingsWebService.js";
import type HarborRepository from "../model/HarborRepository.js";
import type HarborProject from "../model/SettingsWebService.js";
import type ImageInfo from "../../common/model/ImageInfo.js";
import type Page from "../../common/model/Page.js";
import type { HarborRespositoryArtifact } from "../model/HarborRespositoryArtifact.js";

export default class HarborManager {

    protected settings: SettingsWebService;

    public constructor(settings: SettingsWebService) {
        this.settings = settings;
    }

    public async imageDetails(props: ImageDetailsProps, userId: string): Promise<KubeOpReturn<string | null>> {
        if (!props.image) {
            return new KubeOpReturn(KubeOpReturnStatus.Error, "Please specify an image name", null);
        }
        for (const hp of this.settings.harborProjects) {        
            const reposUrl = `${hp.baseUrl}/api/v2.0/projects/${hp.name}/repositories`;
            //console.log(`Getting repos from ${reposUrl}`);
            const agent = new https.Agent({
                rejectUnauthorized: false,
            });
            const response: Response = await this.fetchCustom(reposUrl, {
                agent,
                ...hp.token && {headers: [["authorization", `Basic ${hp.token}`]]}
            });
            if (response.ok) {
                const prjRepos: HarborRepository[] = await response.json() as HarborRepository[];
                for (const repo of prjRepos) {
                    // Get repo name, remove project name 
                    const name: string = repo.name.substring(repo.name.indexOf("/") + 1, repo.name.length);
                    if (name === props.image) {
                        return new KubeOpReturn(KubeOpReturnStatus.Success, undefined, repo.description);
                    }
                }
            } else {
                console.error(`Unable to load repositories from '${reposUrl}'`);
            }
        }
        return new KubeOpReturn(KubeOpReturnStatus.Error, `No image with name '${props.image}' found.`, null);
    }

    public async images(userId: string): Promise<KubeOpReturn<Page<ImageInfo> | null>> {
        const imageDetails: ImageInfo[] = [];
        for (const hp of this.settings.harborProjects) {
            const projImgs: KubeOpReturn<ImageInfo[]>  = await this.getHarborImages(hp);
            if (projImgs.isOk() && projImgs.payload) {
                imageDetails.push(...projImgs.payload);
            } else {
                console.error(projImgs.message);
            }    
        }
        return new KubeOpReturn(KubeOpReturnStatus.Success, undefined, { data: imageDetails, size: imageDetails.length, 
            total: imageDetails.length, skip: 0} );
    }

    public async getHarborImages(hp: HarborProject): Promise<KubeOpReturn<ImageInfo[]>> {
        const projsUrl = `${hp.baseUrl}/api/v2.0/projects`
        const reposUrl = `${projsUrl}/${hp.name}/repositories`;
        console.log(`Getting repos from ${reposUrl}`);
        const agent = new https.Agent({
            rejectUnauthorized: false,
            });
        
        let pageNum = 1;
        let reposCnt = 0;
        const pageSize = 100;
        const result: ImageInfo[] = [];
        let error = false;
        do {
            const response: Response = await this.fetchCustom(`${reposUrl}?page=${pageNum}&page_size=${pageSize}`, 
                {
                    agent,
                    ...hp.token && {headers: [["authorization", `Basic ${hp.token}`]]}
                });
            if (response.ok) {
                const prjRepos: HarborRepository[] = await response.json() as HarborRepository[];
                reposCnt = prjRepos.length;
                for (const repo of prjRepos) {
                    // Get repo name, remove project name 
                    const name: string = repo.name.substring(repo.name.indexOf("/") + 1, repo.name.length);
                    const desc: string = repo.description;
                    const tags: string[] = [];
                    result.push({name, tags, desc})
                    
                    const artsUrl = `${reposUrl}/${name}/artifacts`;
                    const rArtifacts: Response = await this.fetchCustom(`${artsUrl}?page_size=${repo.artifact_count}`, 
                        {
                            agent,
                            ...hp.token && {headers: [["Autorization", `Bearer ${hp.token}`]]}
                        });
                    if (rArtifacts.ok) {
                        const arts: HarborRespositoryArtifact[] = await rArtifacts.json() as HarborRespositoryArtifact[];
                        for (const art of arts ) {
                            if (art.tags !== null)
                                tags.push(...art.tags.map(t => t.name));
                        }
                    } else {
                        console.warn(`Unable to load artifacts from ${artsUrl}`);
                    }
                } 
                ++pageNum;      
            } else {
                error = true;
                console.error(`Unable to load repositories from '${reposUrl}?page=${pageNum}&page_size=${pageSize}', API responded with code '${response.statusText}' and message: ${JSON.stringify(await response.json())}`);
                // If the first page fails, don't try again
                break;
            }
        } while (reposCnt === pageSize);
        if (error)
            return new KubeOpReturn(KubeOpReturnStatus.Error, `Unable to load repositories from '${reposUrl}`, result);
        else
            return new KubeOpReturn(KubeOpReturnStatus.Success, undefined, result);

    }

    protected fetchCustom(url: string, init?: RequestInit): Promise<Response> {
        return fetch(url, init);
    }
    
}