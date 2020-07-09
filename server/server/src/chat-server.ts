import express from "express";
import cors from "cors";
import * as http from "http";
import { RequestManager } from "./request-manager";
import { DBManager } from "./managers/db_manager";
import { DBUserManager } from "./managers/db_user_manager";
import { TreeUserPosition } from "./types/userPosition";

export class ServerManager {
	public static readonly PORT: number = 8080;
	private app: express.Application;
	private server: http.Server;
	private io: SocketIO.Server;
	private port: string | number;

	constructor() {
		this.createApp();
		this.config();
		this.createServer();
		this.sockets();
		this.listen();
		DBManager.get();
	}

	private createApp(): void {
		this.app = express();
		this.app.use(cors());
	}

	private createServer(): void {
		this.server = http.createServer(this.app);
	}

	private config(): void {
		this.port = process.env.PORT || ServerManager.PORT;
	}

	private sockets(): void {
		this.io = require("socket.io").listen(this.server, { origins: "*:*" });
	}

	private listen(): void {
		this.server.listen(this.port, () => {
			console.log("Running server on port %s", this.port);
		});
		this.io.on("connect", (socket: any) => {
			console.log("Connected client on port %s.", this.port);
			RequestManager.on(socket, this.io);
		});
	}

	public getApp(): express.Application {
		return this.app;
	}
}
