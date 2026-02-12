import { parseArgs } from 'node:util';
import { exit } from "node:process";
import { readFileSync, writeFileSync } from 'fs';
import { CoreV1Api, KubeConfig, V1Pod } from '@kubernetes/client-node';

const NAMESPACE_PATH = '/var/run/secrets/kubernetes.io/serviceaccount/namespace';
// IN SECONDS
const DEFAULT_SLEEP = 10;

const sleepF = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function isContainerTerminated(k8sCoreApi: CoreV1Api, pod: string, namespace: string, container: string): Promise<boolean> {
    const statusOnly: V1Pod = await k8sCoreApi.readNamespacedPodStatus({ name: pod, namespace });
    if (!statusOnly) return false;
    const containerStatuses = statusOnly.status?.containerStatuses || [];
    const entry = containerStatuses.find((c) => c.name === container);
    return Boolean(entry?.state?.terminated);
}

async function getLogs(k8sCoreApi: CoreV1Api, pod: string, namespace: string, container: string): Promise<string> {
     const res = await k8sCoreApi.readNamespacedPodLog({ name: pod, namespace, container });
     return res;
}

async function main(args: string[]): Promise<number> {
    console.log(args);
    const { values } = parseArgs({ args: args.slice(2), options: {
            container: { type: "string", short: "c", multiple: false },
            logs: { type: "string", short: "l", multiple: false },
            sleep: {default: String(DEFAULT_SLEEP), type: "string", short: "s", multiple: false },
        }
    });


            
    const clusterConfig: KubeConfig = new KubeConfig();
    clusterConfig.loadFromCluster();
    const logsFile = values.logs;
    const container = values.container;
    const sleep =  Number(values.sleep) * 1000;
    const k8sCoreApi = clusterConfig.makeApiClient(CoreV1Api);
    const podName = process.env["POD_NAME"];
    const namespace = process.env["POD_NAMESPACE"] 
        || readFileSync(NAMESPACE_PATH,'utf8').trim();

    if (!podName) {throw new Error("Env var 'POD_NAME' not set. In k8s, use 'fieldRef: fieldPath: metadata.name'");}
    if (!namespace) {throw new Error(`Neither env var 'POD_NAMESPACE' set nor file '${NAMESPACE_PATH}' is available. In k8s, use 'fieldRef: fieldPath: metadata.namespace'`);}
    if (!container) {throw new Error(`Param 'container' has an empty value. Please set the name of the container that you want to monitor.`);}
    if (!logsFile) {throw new Error(`Param 'logs' has an empty value. Please specify the file where the logs from the monitored container are going to be stored.`);}

    console.log(`pod name: ${podName}`);
    console.log(`namespace: ${namespace}`);
    
    do {
        console.log("Getting logs...");
        try {
            const logsTxt = await getLogs(k8sCoreApi, podName, namespace, container);
            writeFileSync(logsFile, logsTxt);
            const run = !(await isContainerTerminated(k8sCoreApi, podName, namespace, container));
            if (run) {
                await sleepF(sleep);
            } else {
                console.log(`Monitored container '${container}' from pod '${podName}' has finished its execution.`)
                break;
            }
        } catch (e) {
            console.error(e);
        }
    } while (true);
    console.log("Getting logs one last time...");
    const logsTxt = await getLogs(k8sCoreApi, podName, namespace, container);
    writeFileSync(logsFile, logsTxt);
    return 0;
}


const code = await main(process.argv);
if (code !== 0) {
    exit(code);
}

