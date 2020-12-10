import {
	List,
	Avatar,
	Button,
	Skeleton,
	Row,
	Col,
	Typography,
	Space,
} from "antd";

import React, { useState, useEffect } from "react";
import {
	RequestType,
	ResponseMessage,
	ResponseCode,
} from "../../../types/requests";
import { AdminChat, AdminMessage } from "../../../types/adminMessage";
import { ConnectionManager } from "../../../managers/connetion/connectionManager";
import { useSelector } from "react-redux";
import { selectAccount } from "../../../redux/slicers/accountSlice";
import { User } from "../../../types/user";
import { AdminMessageDialog } from "../admin.dialog/AdminMessageDialog";
import {
	NotificationItem,
	NotificationType,
} from "../../../types/notification";

export const AdminMessagesPage: React.FC = () => {
	const [initLoading, setInitLoading] = useState<boolean>(false);
	const accState = useSelector(selectAccount);
	const [chats, setChats] = useState<AdminChat[]>([]);
	const [users, setUsers] = useState<User[]>([]);
	const [currentChat, setCurrentChat] = useState<AdminChat>();

	const loadChats = () => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_ALL_ADMIN_CHATS,
			(data) => {
				console.log(RequestType.GET_LAST_MESSAGES, data);
				const dataMessage = data as ResponseMessage<AdminChat[]>;
				if (dataMessage.requestCode === ResponseCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}

				ConnectionManager.getInstance().emit(
					RequestType.GET_USERS_INFO,
					dataMessage.data.map((ch) => ch.withUser),
					accState.session
				);
				setChats(dataMessage.data.sort((a, b) => a.withUser - b.withUser));
			}
		);

		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_USERS_INFO,
			(data) => {
				console.log(RequestType.GET_USERS_INFO, data);
				const dataMessage = data as ResponseMessage<User[]>;
				if (dataMessage.requestCode === ResponseCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				setUsers(dataMessage.data);
			}
		);

		ConnectionManager.getInstance().emit(
			RequestType.GET_ALL_ADMIN_CHATS,
			{},
			accState.session
		);
	};

	useEffect(() => {
		loadChats();
	}, []);

	useEffect(() => {
		ConnectionManager.getInstance().registerResponseHandler(
			RequestType.NOTIFICATION,
			(data: NotificationItem) => {
				console.log("notification", data);
				if (data.type === NotificationType.ADMIN_SMS) {
					loadChats();
				}
			},
			false
		);
	}, []);

	const onChatClick = (chat: AdminChat) => {
		setCurrentChat(chat);
	};

	const onMessageSend = (msg: AdminMessage, chat: AdminChat) => {
		loadChats();
	};

	return (
		<div style={{ height: "80vh" }}>
			<Row style={{ height: "100%" }}>
				<Col
					flex="30%"
					style={{
						backgroundColor: "#f0f5ff",
						height: "100%",
						wordWrap: "break-word",
						overflow: "auto",
					}}
				>
					<List
						loading={initLoading}
						bordered
						itemLayout="horizontal"
						dataSource={chats}
						renderItem={(item) => (
							<List.Item
								style={{
									textAlign: "start",
									border: "1px solid rgba(24, 144, 255, 0.7)",
									borderRadius: "0px 10px 10px 0px",
									margin: "2px",
									textOverflow: "ellipsis",
									overflow: "hidden",
									width: "inherit",
								}}
								key={item.id}
								id={item.id.toString()}
								onClick={onChatClick.bind(null, item)}
							>
								<Space
									direction="vertical"
									style={{
										width: "100%",
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
									}}
								>
									<Typography.Text strong mark>
										{User.GetUserPIB(users.find((u) => u.id === item.withUser))}
									</Typography.Text>
									<div
										style={{
											textOverflow: "ellipsis",
										}}
									>
										{
											item.messages.reduce((prev, curr) => {
												return prev.dateCreate < curr.dateCreate ? curr : prev;
											}).content
										}
									</div>
								</Space>
							</List.Item>
						)}
					/>
				</Col>
				<Col
					flex="70%"
					style={{
						// backgroundColor: "#bae7ff",
						height: "100%",
						// wordWrap: "break-word",
						// overflow: "scroll",
					}}
				>
					{currentChat !== undefined && (
						<AdminMessageDialog
							chatWith={currentChat.withUser}
							style={{ height: "70vh", width: "125vh" }}
							onMessageSend={onMessageSend}
						></AdminMessageDialog>
					)}
				</Col>
			</Row>
		</div>
	);
};
