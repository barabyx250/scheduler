import io from "socket.io-client";
import {
	RequestType,
	ResponseMessage,
	RequestMessage,
} from "../../types/requests";
import { BUILD_MODE, BuildMode } from "../../types/constants";

export class ConnectionManager {
	private static instance: ConnectionManager;
	private m_socket: SocketIOClient.Socket;
	private m_registeredResponseHandler: Array<RequestType>;

	private constructor(socket: SocketIOClient.Socket) {
		this.m_socket = socket;
		this.m_registeredResponseHandler = new Array<RequestType>();
	}

	public static getInstance(): ConnectionManager {
		if (!ConnectionManager.instance) {
			ConnectionManager.instance = new ConnectionManager(
				io(
					BUILD_MODE === BuildMode.RELEASE
						? "http://10.19.20.252:8081"
						: "http://localhost:8081"
				)
			);
		}

		return ConnectionManager.instance;
	}

	public emit(
		requestType: RequestType,
		data: any,
		session: string,
		stackToQueue: boolean = false
	) {
		// if (this.m_socket.connected || stackToQueue) {
		const request = new RequestMessage<typeof data>(session, requestType, data);
		this.m_socket.emit(requestType, request);
		// }
	}

	public registerResponseOnceHandler(
		requestType: RequestType,
		functionHandler: (data: any) => void
	) {
		this.m_socket.once(requestType, functionHandler);
	}
	public registerResponseHandler(
		requestType: RequestType,
		functionHandler: (data: any) => void,
		checkOnUsed: boolean = true
	) {
		if (
			this.m_registeredResponseHandler.indexOf(requestType) < 0 ||
			!checkOnUsed
		) {
			this.m_socket.on(requestType, functionHandler);
			this.m_registeredResponseHandler.push(requestType);
		}
	}
}
