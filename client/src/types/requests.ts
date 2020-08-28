export enum RequestType {
	MESSAGE = "message",
	LOGIN = "login",
	CREATE_TASK = "create_task",
	GET_MY_TASKS = "get_my_tasks",
	GET_USERS_INFO = "get_users_info",
	GET_USER_POSITIONS = "get_user_positions",
	CREATE_USER = "create_user",
	GET_MY_SUBORDINATE = "get_my_subordinate",
	GET_TASKS_SUBORDINATES = "get_tasks_subordinates",
	UPDATE_TASK = "update_task",
	GET_TASKS_BY_ME = "get_tasks_by_me",
	GET_MY_NOTIFICATIONS = "get_my_notifications",
	NOTIFICATION = "notification",
	READ_NOTIFICATIONS = "read_notification",
	GET_TASKS_INFO = "get_task_info",
	UPDATE_USER_POSITIONS = "update_user_positions",
	GET_MY_PARENT_TASK = "get_my_parent_task",
	FINISH_TASK = "finish_task",
	GET_COMPLITED_TASKS_BY_ME = "get_complited_tasks_by_me",
	GET_COMPLITED_TASKS_BY_SUBORDINATES = "get_complited_tasks_by_subordinates",
	UPDATE_USER_INFO = "update_user_info",
	SELECT_MY_TASKS_BY_FILTER = "select_my_task_by_filter",
	GET_MY_CHIEF_INFO = "get_my_chief_info",
	GET_MY_EDITABLE_TASKS = "get_my_editable_tasks",
	REMOVE_TASK = "remove_task",
	REMOVE_POSITIONS = "remove_positions",
	GET_ALL_USERS = "get_all_users",
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
