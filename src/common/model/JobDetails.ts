import type EJobStatus from "./EJobStatus.js";

export interface JobDetailsEnv {
    name: string;
    value: string | null;
}

export interface JobDetailsMount {
    source: string;
    mountPath: string | null;
    readOnly: boolean | null;
}


export interface JobDetailsHost {
    serverName: string | null;
    // Can't be obtained from k8s
    user: string | null;
    uid: number | null;
    gid: number | null;
}

export interface JobDetailsResourcesUsage {
    cpu: string | null;
    memory: string |  null; 
    //io: string[] | null;

}

export interface JobDetailsResources {

    usage: JobDetailsResourcesUsage | null;
}

export default interface JobDetails {

    name: string;
    uid?: string | null;
    status: EJobStatus;
    createdAt: string | null;
    position: number;
    flavor: string;
    exitCode: number | null;
    startedAt: string | null;
    finishedAt: string | null;
    executionDuration: number | null;
    errors: string[];
    user: string | null;
    image: string | null;
    privileged: boolean | null;
    mounts: JobDetailsMount[];
    env: JobDetailsEnv[] | null;
    command: string[] | null;
    args: string[] | null;
    // Needed by the FEM client - purpose not yet defined
    host: JobDetailsHost;
    resources: JobDetailsResources;
}