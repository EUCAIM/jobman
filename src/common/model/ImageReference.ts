export default interface ImageReference {
  registry: string | undefined | null;
  namespace: string | undefined | null;
  name: string;
  tag: string | undefined | null;
  digest: string | undefined | null;
}