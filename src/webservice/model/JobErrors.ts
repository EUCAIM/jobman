
export interface ClusterWarning {
    reason: string | undefined,
    message: string | undefined,
    lastTimestamp: Date | undefined;

}

export interface ContainerError {
    exitCode: number | undefined,
    reason: string | undefined,
    message: string | undefined

}


export default interface JobErrors {
    containerError?: ContainerError | null;
    clusterWarnings: ClusterWarning[];
}