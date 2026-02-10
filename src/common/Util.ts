
import path from 'path';
import { fileURLToPath } from 'url';
import EAnnotationType from './model/EAnnotationType.js';
import UnhandledValueException from './model/exception/UnhandledValueException.js';
import type Annotation from './model/Annotation.js';

export default class Util {

    public static getDirName(): string {
        return path.dirname(fileURLToPath(import.meta.url));
    }

    public static getExecDir(): string {
        const r = process.env['JOBMAN_EXEC_DIR'];
        if (!r) {
            throw new Error("Unable to determine the process exec dir. Please set eaan env var 'JOBMAN_EXEC_DIR' with the path.")
        }
        return r;
    }

    public static getKubeResourcesGPUsName(): string[] {
        return [
            "nvidia.com/gpu",
            "amd.com/gpu",
            "intel.com/gpu"
        ];
    }

    public static getAnnotationsFromSettings(annotations: Annotation[] | null | undefined) {
        const r = Object.create(null);
        if (annotations) {
            for (const a of annotations) {
                switch (a.valueType) {
                    case EAnnotationType.env: {
                        if (process.env[a.value])
                            r[a.key] = process.env[a.value]; 
                        break;
                    }
                    case EAnnotationType.string: r[a.key] = a.value; break;
                    default: throw new UnhandledValueException(`Annotation type '${a.valueType}' not handled for key '${a.key}' and value '${a.value}`);
                }
            }
        }
        return r;
    }

    // public static async getEntrypointAndCmd(registry: string, repo: string, tag: string) {
    //     const manifestRes = await fetch(`https://${registry}/v2/${repo}/manifests/${tag}`, {
    //         headers: { Accept: 'application/vnd.docker.distribution.manifest.v2+json' }
    //     });
    //     const manifest = await manifestRes.json();
    //     const configDigest = manifest.config.digest;

    //     const configRes = await fetch(`https://${registry}/v2/${repo}/blobs/${configDigest}`);
    //     const config = await configRes.json();

    //     console.log('Entrypoint:', config.config.Entrypoint);
    //     console.log('Cmd:', config.config.Cmd);
    //     }
}