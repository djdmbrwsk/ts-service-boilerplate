/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export default interface ErrorResponse<T = any> {
  code: number;
  data?: T;
  message: string;
}
