export default interface ImageReference {
  registry: string | undefined | null;
  organization: string | undefined | null;
  name: string;
  tag: string | undefined | null;
  digest: string | undefined | null;
}