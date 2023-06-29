declare module "java-deserialization" {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export function parse(buf: Buffer): any;
}