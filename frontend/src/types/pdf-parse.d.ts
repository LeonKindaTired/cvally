declare module "pdf-parse" {
  function pdf(
    data: Uint8Array | Buffer | ArrayBuffer,
    options?: any
  ): Promise<{
    text: string;
    info: any;
    metadata: any;
    version: string;
  }>;

  export default pdf;
}
