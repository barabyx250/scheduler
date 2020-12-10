import express from "express";
import cors from "cors";
import * as http from "http";
import { DBManager } from "./managers/db_manager";
import { RequestManager } from "./request-manager";
import { NotificationModel } from "./model/notification.model";
import { UserModel } from "./model/user.model";
import { AlarmManager } from "./types/alarm";
import { Moment } from "moment";
import moment from "moment";

export class ServerManager {
	public static readonly PORT: number = 8081;
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
		DBManager.get().then(() => {
			NotificationModel.StartTaskProgressNotification(this.io);
			NotificationModel.StartTomorrowTaskNotification(this.io);
			NotificationModel.StartOverdudeTaskNotifications(this.io);
			UserModel.checkInstallEmptyPosition();
		});
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
		this.io.on("connect", (socket: SocketIO.Socket) => {
			console.log("Connected client on port %s.", this.port);
			RequestManager.on(socket, this.io);
		});
	}

	public getApp(): express.Application {
		return this.app;
	}
}
