export enum RequestType {
  MESSAGE = "message",
  LOGIN = "login",
}

export enum RequestCode {
  RES_CODE_SUCCESS = 200,
  RES_CODE_INTERNAL_ERROR = 1,
}

export class RequestMessage<T> {
  constructor(messageInfo: string, requestCode: RequestCode, data: T) {
    this.data = data;
    this.messageInfo = messageInfo;
    this.requestCode = requestCode;
  }
  messageInfo: string;
  requestCode: RequestCode;
  data: T;
}
