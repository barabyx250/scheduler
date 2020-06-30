import { RequestCode } from "../types/requests";


export class RequestMessage<T> {
    messageInfo: string;
    requestCode: RequestCode;
    data: T;
}
