export enum RequestType {
	MESSAGE = "message",
	LOGIN = "login",
	CREATE_TASK = "create_task",
	GET_MY_TASKS = "get_my_tasks",
}

export enum ResponseCode {
	RES_CODE_SUCCESS = 200,
	RES_CODE_INTERNAL_ERROR = 1,
}

export class ResponseMessage<T> {
	constructor(messageInfo: string, requestCode: ResponseCode, data: T) {
		this.data = data;
		this.messageInfo = messageInfo;
		this.requestCode = requestCode;
	}
	messageInfo: string;
	requestCode: ResponseCode;
	data: T;
}

export class RequestMessage<T> {
	constructor(session: string, requestType: RequestType, data: T) {
		this.data = data;
		this.session = session;
		this.requestType = requestType;
	}
	session: string;
	requestType: RequestType;
	data: T;
}
