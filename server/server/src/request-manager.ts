import {
	RequestType,
	RequestMessage,
	ResponseMessage,
	ResponseCode,
} from "./types/requests";
import { UserModel } from "./model/user.model";
import { TaskModel } from "./model/task.model";
import { Task } from "./types/task";

export class RequestManager {
	public static on(socket: any, io: SocketIO.Server) {
		socket.on(RequestType.LOGIN, async (m: any) => {
			console.log("[server](message): %s", JSON.stringify(m));

			const request = m as RequestMessage<any>;
			const response = await UserModel.userLogin(
				request.data.username,
				request.data.password
			);

			socket.emit(RequestType.LOGIN, response);
		});

		socket.on(RequestType.CREATE_TASK, async (m: any) => {
			console.log("[server](message): %s", JSON.stringify(m));

			const response = await TaskModel.createTask(m);

			socket.emit(RequestType.CREATE_TASK, response);
		});

		socket.on(RequestType.GET_MY_TASKS, async (m: any) => {
			console.log("[server](message): %s", JSON.stringify(m));

			if ((m as RequestMessage<any>).session === "") {
				socket.emit(RequestType.GET_MY_TASKS, {
					data: [],
					messageInfo: "Session is invalid",
					requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
				} as ResponseMessage<Task[]>);
				return;
			}

			const response = await TaskModel.getTasksByExecuter(m);
			socket.emit(RequestType.GET_MY_TASKS, response);
		});

		socket.on("disconnect", () => {
			console.log("Client disconnected");
		});
	}
}
