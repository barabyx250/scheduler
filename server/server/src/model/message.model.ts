import {
	ResponseCode,
	ResponseMessage,
	RequestMessage,
} from "../types/requests";
import { DBTextMessageManager } from "../managers/db_text_message_manager";
import { AdminChat, AdminMessage } from "../types/adminMessage";
import { DBAdminChatManager } from "../managers/db_admin_chat_manager";
import { NotificationModel } from "./notification.model";

export class MessageModel {
	public static async GetMessageCountFromMessage(
		request: RequestMessage<{ id: number; count: number; userId: number }>
	): Promise<ResponseMessage<AdminChat>> {
		const userMessages = await DBTextMessageManager.GetMessages(
			request.data.id,
			request.data.count,
			request.data.userId
		);

		const chat = await DBAdminChatManager.GetChatByUserId(request.data.userId);

		if (chat !== undefined) {
			return {
				data: new AdminChat(
					chat.id,
					chat.withUser.id,
					userMessages.map((v) => v.ToRequestObject())
				),
				messageInfo: "SUCCESS",
				requestCode: ResponseCode.RES_CODE_SUCCESS,
			} as ResponseMessage<AdminChat>;
		}

		return {
			data: {
				id: 0,
				messages: [],
				withUser: 0,
			},
			messageInfo: "FAILURE",
			requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
		} as ResponseMessage<AdminChat>;
	}

	public static async GetLastMessages(
		request: RequestMessage<{ count: number; userId: number }>
	): Promise<ResponseMessage<AdminChat>> {
		const userMessages = await DBTextMessageManager.GetLastMessages(
			request.data.count,
			request.data.userId
		);

		const chat = await DBAdminChatManager.GetChatByUserId(request.data.userId);

		if (chat !== undefined) {
			return {
				data: new AdminChat(
					chat.id,
					chat.withUser.id,
					userMessages.map((v) => v.ToRequestObject())
				),
				messageInfo: "SUCCESS",
				requestCode: ResponseCode.RES_CODE_SUCCESS,
			} as ResponseMessage<AdminChat>;
		}

		return {
			data: {
				id: 0,
				messages: [],
				withUser: 0,
			},
			messageInfo: "FAILURE",
			requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
		} as ResponseMessage<AdminChat>;
	}

	public static async CreateChatMessage(request: RequestMessage<AdminChat>) {
		let chat = await DBAdminChatManager.GetChatByUserId(request.data.withUser);
		chat =
			chat === undefined
				? await DBAdminChatManager.CreateChat(request.data.withUser)
				: chat;
		chat.messages = [];

		for (const m of request.data.messages) {
			const message = await DBTextMessageManager.CreateMessage(
				m.content,
				chat.id,
				m.fromUser
			);
			chat.messages.push(message);
		}
		return {
			data: chat.ToRequestObject(),
			messageInfo: "SUCCESS",
			requestCode: ResponseCode.RES_CODE_SUCCESS,
		} as ResponseMessage<AdminChat>;
	}

	public static async GetAdminChats(request: RequestMessage<any>) {
		let chats = await DBAdminChatManager.GetAllChats();
		let chatsOutput: AdminChat[] = [];
		for (const chat of chats) {
			const chatOut = await this.GetLastMessages({
				data: {
					count: 1,
					userId: chat.withUser.id,
				},
				id: request.id,
				requestCode: request.requestCode,
				session: request.session,
			});
			chatsOutput.push(chatOut.data);
		}

		return {
			data: chatsOutput,
			messageInfo: "SUCCESS",
			requestCode: ResponseCode.RES_CODE_SUCCESS,
		} as ResponseMessage<any>;
	}
}
