export type IPCResponse<D> = {
  success: true;
  data: D;
} | {
  success: false;
  error: string;
}