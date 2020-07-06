import * as socketIo from "socket.io-client";
import {
	RequestType,
	ResponseMessage,
	RequestMessage,
} from "../../types/requests";

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
				socketIo.connect("http://localhost:8080")
			);
		}

		return ConnectionManager.instance;
	}

	public emit(requestType: RequestType, data: any, session: string) {
		const request = new RequestMessage<typeof data>(session, requestType, data);
		this.m_socket.emit(requestType, request);
	}

	public registerResponseOnceHandler(
		requestType: RequestType,
		functionHandler: (data: any) => void
	) {
		this.m_socket.once(requestType, functionHandler);
	}
	public registerResponseHandler(
		requestType: RequestType,
		functionHandler: (data: any) => void
	) {
		if (this.m_registeredResponseHandler.indexOf(requestType) < 0) {
			this.m_socket.on(requestType, functionHandler);
			this.m_registeredResponseHandler.push(requestType);
		}
	}
}
