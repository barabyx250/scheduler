import {
	Category,
	CategoryLogger,
	CategoryServiceFactory,
	CategoryConfiguration,
	LogLevel,
} from "typescript-logging";

import { Logger, transports, createLogger, format, addColors } from "winston";

// Optionally change default settings, in this example set default logging to Info.
// Without changing configuration, categories will log to Error.
CategoryServiceFactory.setDefaultConfiguration(
	new CategoryConfiguration(LogLevel.Info)
);

// Create categories, they will autoregister themselves, one category without parent (root) and a child category.
export const logDev = new Category("DEV");

export class ServerLogger {
	private fileLogger: Logger;
	private consoleLogger: Logger;

	constructor() {
		this.consoleLogger = createLogger({
			format: format.combine(
				format.timestamp(),
				format.simple(),
				format.colorize({ all: true })
			),
			transports: [new transports.Console()],
		});
		this.fileLogger = createLogger({
			format: format.json(), //format.json(),
			transports: [
				new transports.File({
					filename: process.cwd() + "/logs/project.logs",
					maxsize: 10485760,
					// zippedArchive: true,
				}),
			],
		});
	}

	public lerror(msg: string) {
		this.fileLogger.error({
			timeStamp: new Date().toLocaleString(),
			message: msg,
		});
		this.consoleLogger.error({
			timeStamp: new Date().toLocaleString(),
			message: msg,
		});
	}
	public linfo(msg: string, params?: Object) {
		this.fileLogger.info({
			timeStamp: new Date().toLocaleString(),
			message: msg,
			...params,
		});
		this.consoleLogger.info({
			timeStamp: new Date().toLocaleString(),
			message: msg,
			...params,
		});
	}
}

export const LoggerInstanse: ServerLogger = new ServerLogger();
