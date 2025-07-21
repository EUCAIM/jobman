import type EJobStatus from "./EJobStatus";

export interface PodDetails {

}

export interface ContainerDetails {

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
}