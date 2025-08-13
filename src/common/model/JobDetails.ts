import type EJobStatus from "./EJobStatus.js";

export interface PodDetails {
    name: string | null;
    containers: ContainerDetails[];
}

export interface ContainerDetails {
    name: string | null;
    exitCode: number | null | undefined;
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
    pods: PodDetails[];
}