export enum RequestType {
	MESSAGE = "message",
	LOGIN = "login",
	CREATE_TASK = "create_task",
	GET_MY_TASKS = "get_my_tasks",
	GET_USERS_INFO = "get_users_info",
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
	constructor(session: string, requestCode: ResponseCode, data: T) {
		this.data = data;
		this.session = session;
		this.requestCode = requestCode;
	}
	session: string;
	requestCode: ResponseCode;
	data: T;
}
