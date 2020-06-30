import { ServerManager } from './chat-server';
import "reflect-metadata";

let app = new ServerManager().getApp();
export { app };