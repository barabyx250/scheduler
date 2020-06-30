import { RequestType } from "./types/requests";
import { UserModel } from './model/user.model';

export class RequestManager {
  public static on(socket: any, io: SocketIO.Server) {

    socket.on(RequestType.LOGIN, async (m: any) => {
      console.log("[server](message): %s", JSON.stringify(m));
      
      const response = await UserModel.userLogin(m.username, m.password);

      socket.emit(RequestType.LOGIN, response);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  }
}
