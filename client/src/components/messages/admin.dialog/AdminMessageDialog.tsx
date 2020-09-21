import { List, Button, Input, Row, Col, Typography } from "antd";

import React, { useState, useEffect, CSSProperties } from "react";
import { ConnectionManager } from "../../../managers/connetion/connectionManager";
import {
	RequestType,
	ResponseCode,
	ResponseMessage,
} from "../../../types/requests";
import { useSelector } from "react-redux";
import { selectAccount } from "../../../redux/slicers/accountSlice";
import { AdminChat, AdminMessage } from "../../../types/adminMessage";
import { User } from "../../../types/user";
import {
	NotificationItem,
	NotificationType,
} from "../../../types/notification";

interface AdminMessageDialogProps {
	chatWith: number;
	style?: CSSProperties;
	onMessageSend?: (msg: AdminMessage, chat: AdminChat) => void;
}

export const AdminMessageDialog: React.FC<AdminMessageDialogProps> = (
	props: AdminMessageDialogProps
) => {
	const [listAdminMessage, setListAdminMessage] = useState<AdminMessage[]>([]);
	const [inputMessage, setInputMessage] = useState<string>("");
	const [chatUsers, setChatUsers] = useState<User[]>([]);
	const [newMessages, setNewMessages] = useState<AdminChat>();
	const accState = useSelector(selectAccount);

	useEffect(() => {
		getNewMessages((chat) => {
			setListAdminMessage(
				chat.messages.sort(
					(a, b) =>
						new Date(b.dateCreate).getTime() - new Date(a.dateCreate).getTime()
				)
			);
		});
	}, [props.chatWith]);

	useEffect(() => {
		ConnectionManager.getInstance().registerResponseHandler(
			RequestType.NOTIFICATION,
			(data: NotificationItem) => {
				console.log("notification", data);
				if (data.type === NotificationType.ADMIN_SMS) {
					const chat: AdminChat = JSON.parse(
						data.customData as string
					) as AdminChat;
					setNewMessages(chat);
				}
			},
			false
		);
	}, []);

	useEffect(() => {
		if (newMessages !== undefined && props.chatWith === newMessages.withUser) {
			getNewMessages((chat) => {
				setListAdminMessage(
					chat.messages.sort(
						(a, b) =>
							new Date(b.dateCreate).getTime() -
							new Date(a.dateCreate).getTime()
					)
				);
			});
		}
	}, [newMessages]);

	const updateChatUserInfo = (chat: AdminChat) => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_USERS_INFO,
			(data) => {
				console.log(RequestType.GET_USERS_INFO, data);
				const dataMessage = data as ResponseMessage<User[]>;
				if (dataMessage.requestCode === ResponseCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				chatUsers.forEach((u) => {
					if (dataMessage.data.findIndex((user) => user.id === u.id) < 0) {
						dataMessage.data.push(u);
					}
				});
				setChatUsers(dataMessage.data);
			}
		);

		ConnectionManager.getInstance().emit(
			RequestType.GET_USERS_INFO,
			chat.messages.map((msg) => msg.fromUser),
			accState.session
		);
	};

	const getOldMessages = (callback: (chat: AdminChat) => void) => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_COUNT_MESSAGES,
			(data) => {
				console.log(RequestType.GET_COUNT_MESSAGES, data);
				const dataMessage = data as ResponseMessage<AdminChat>;
				if (dataMessage.requestCode === ResponseCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}

				callback(dataMessage.data);
				updateChatUserInfo(dataMessage.data);
			}
		);

		let olderMessageId: number = 0;

		if (listAdminMessage.length > 0) {
			const olderMessage = listAdminMessage.reduce((prev, curr) => {
				return prev.dateCreate < curr.dateCreate ? prev : curr;
			});
			olderMessageId = olderMessage.id;
		}

		ConnectionManager.getInstance().emit(
			RequestType.GET_COUNT_MESSAGES,
			{ id: olderMessageId, count: 10, userId: props.chatWith },
			accState.session
		);
	};

	const getNewMessages = (
		callback: (chat: AdminChat) => void,
		count: number = 10
	) => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_LAST_MESSAGES,
			(data) => {
				console.log(RequestType.GET_LAST_MESSAGES, data);
				const dataMessage = data as ResponseMessage<AdminChat>;
				if (dataMessage.requestCode === ResponseCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}

				callback(dataMessage.data);
				updateChatUserInfo(dataMessage.data);
			}
		);

		ConnectionManager.getInstance().emit(
			RequestType.GET_LAST_MESSAGES,
			{ count: count, userId: props.chatWith },
			accState.session
		);
	};

	const onLoadMore = () => {
		getOldMessages((chat: AdminChat) => {
			listAdminMessage.forEach((m) => {
				if (chat.messages.findIndex((cm) => cm.id === m.id) < 0) {
					chat.messages.push(m);
				}
			});

			setListAdminMessage(
				chat.messages.sort(
					(a, b) =>
						new Date(b.dateCreate).getTime() - new Date(a.dateCreate).getTime()
				)
			);
		});
	};

	const onInputTextChange: (
		event: React.ChangeEvent<HTMLInputElement>
	) => void = ({ target: { value } }) => {
		setInputMessage(value);
	};

	const onSendMessage = () => {
		if (inputMessage === "") return;

		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.SEND_MESSAGE_TO_ADMIN,
			(data) => {
				console.log(RequestType.SEND_MESSAGE_TO_ADMIN, data);
				const dataMessage = data as ResponseMessage<any>;
				if (dataMessage.requestCode === ResponseCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				getNewMessages((chat) => {
					listAdminMessage.forEach((m) => {
						if (chat.messages.findIndex((cm) => cm.id === m.id) < 0) {
							chat.messages.push(m);
						}
					});

					setListAdminMessage(
						chat.messages.sort(
							(a, b) =>
								new Date(b.dateCreate).getTime() -
								new Date(a.dateCreate).getTime()
						)
					);
				}, 4);
				setInputMessage("");
			}
		);
		const message = new AdminMessage(0, inputMessage, new Date(), accState.id);
		const chat = new AdminChat(0, props.chatWith, [message]);
		ConnectionManager.getInstance().emit(
			RequestType.SEND_MESSAGE_TO_ADMIN,
			chat,
			accState.session
		);
		if (props.onMessageSend !== undefined) {
			props.onMessageSend(message, chat);
		}
	};

	const loadMore = (
		<div
			style={{
				textAlign: "center",
				marginTop: 12,
				height: 32,
				lineHeight: "32px",
			}}
		>
			<Button onClick={onLoadMore}>loading more</Button>
		</div>
	);

	return (
		<div style={props.style}>
			<div
				style={{
					overflow: "auto",
					height: "inherit",
					width: "inherit",
					wordWrap: "break-word",
				}}
			>
				<List
					bordered
					itemLayout="horizontal"
					loadMore={loadMore}
					dataSource={listAdminMessage}
					renderItem={(item) => (
						<List.Item
							style={{
								textAlign: "start",
								wordWrap: "break-word",
								border: "1px solid rgba(24, 144, 255, 0.7)",
								borderRadius: "5px 20px 20px 50px",
								margin: "5px",
							}}
						>
							<Typography.Text mark>
								[
								{new Date(item.dateCreate).toLocaleDateString("uk", {
									year: "numeric",
									month: "numeric",
									day: "numeric",
									hour: "numeric",
									minute: "numeric",
									second: "numeric",
								})}
								]
							</Typography.Text>{" "}
							<Typography.Text strong>
								{User.GetUserPIB(chatUsers.find((u) => u.id === item.fromUser))}
							</Typography.Text>
							<br></br>
							{item.content}
						</List.Item>
					)}
				/>
			</div>
			<Row justify="start" style={{ margin: "5px" }}>
				<Col flex="90%">
					<Row justify="start">
						<Input onChange={onInputTextChange} value={inputMessage}></Input>
					</Row>
				</Col>
				<Col flex="auto">
					<Row justify="start">
						<Button onClick={onSendMessage}>Відправити</Button>
					</Row>
				</Col>
			</Row>
		</div>
	);
};
