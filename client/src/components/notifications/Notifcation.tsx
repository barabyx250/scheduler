import React, { useState, useEffect } from "react";
import {
	NotificationOutlined,
	NotificationFilled,
	InfoCircleTwoTone,
	CloseOutlined,
	FullscreenOutlined,
} from "@ant-design/icons";
import { NotificationItem, NotificationType } from "../../types/notification";
import {
	notification,
	Badge,
	Dropdown,
	Typography,
	Menu,
	Button,
	Row,
	Col,
	message,
} from "antd";
import { ConnectionManager } from "../../managers/connetion/connectionManager";
import {
	RequestType,
	ResponseMessage,
	ResponseCode,
} from "../../types/requests";
import { useSelector } from "react-redux";
import { selectAccount } from "../../redux/slicers/accountSlice";

import { TaskDrawer, TaskDrawerProps } from "../task/TaskDrawer";
import { User } from "../../types/user";
import { Task } from "../../types/task";

export const Notification: React.FC = () => {
	const onTaskDrawerClose = () => {
		setTaskDrawerState((prevState) => ({
			...prevState,
			visible: false,
		}));
	};

	const [notificationItems, setNotificationItems] = useState<
		NotificationItem[]
	>([]);
	const [taskDrawerState, setTaskDrawerState] = useState<TaskDrawerProps>({
		visible: false,
		onClose: onTaskDrawerClose,
	});
	const accState = useSelector(selectAccount);

	const openNotification = (
		message: string,
		description: string,
		duration: number = 0
	) => {
		const args = {
			message: message,
			description: description,
			duration: duration,
		};
		notification["info"](args);
	};

	useEffect(() => {
		ConnectionManager.getInstance().registerResponseHandler(
			RequestType.NOTIFICATION,
			(data: NotificationItem) => {
				console.log("notification", data);
				openNotification(data.title, data.content);
			}
		);
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_MY_NOTIFICATIONS,
			(data: ResponseMessage<NotificationItem[]>) => {
				console.log("get notifications", data);
				if (data.requestCode === ResponseCode.RES_CODE_INTERNAL_ERROR) {
					message.error(data.messageInfo);
					return;
				}
				setNotificationItems(
					data.data.sort((a: NotificationItem, b: NotificationItem) => {
						return new Date(a.dateCreation) <= new Date(b.dateCreation)
							? 1
							: -1;
					})
				);
			}
		);

		ConnectionManager.getInstance().emit(
			RequestType.GET_MY_NOTIFICATIONS,
			{},
			accState.session
		);
	}, []);

	const onCloseNotification = (obj: any) => {
		//obj.currentTarget
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.READ_NOTIFICATIONS,
			(data: ResponseMessage<number[]>) => {
				console.log("READ_NOTIFICATIONS", data);
				if (data.requestCode === ResponseCode.RES_CODE_SUCCESS) {
					setNotificationItems(
						notificationItems.filter((n) => {
							return n.id !== data.data[0];
						})
					);
				}
			}
		);

		ConnectionManager.getInstance().emit(
			RequestType.READ_NOTIFICATIONS,
			[Number(obj.currentTarget.value)],
			accState.session
		);
	};

	const onSaveNotificationClick = (obj: any) => {
		console.log("CLICK", obj.target);

		const notId = Number(obj.currentTarget.value);
		const not = notificationItems.find((n) => n.id === notId);
		if (not) {
			if (
				not.type === NotificationType.SYSTEM ||
				not.type === NotificationType.TASK_CREATE
			) {
				ConnectionManager.getInstance().registerResponseOnceHandler(
					RequestType.GET_TASKS_INFO,
					(data) => {
						const dataMessage = data as ResponseMessage<Array<Task>>;
						console.log("Data message", dataMessage);
						if (
							dataMessage.requestCode === ResponseCode.RES_CODE_INTERNAL_ERROR
						) {
							console.log(`Error: ${dataMessage.requestCode}`);
							return;
						}

						if (dataMessage.data.length === 0) {
							message.error("Помилка! Мабудь, задача вже видалена.", 5);
							return;
						}

						const task = dataMessage.data[0];

						ConnectionManager.getInstance().registerResponseOnceHandler(
							RequestType.GET_USERS_INFO,
							(data) => {
								const dataMessage = data as ResponseMessage<Array<User>>;
								if (
									dataMessage.requestCode ===
									ResponseCode.RES_CODE_INTERNAL_ERROR
								) {
									console.log(`Error: ${dataMessage.requestCode}`);
									return;
								}

								let executer = dataMessage.data[0];
								let author = dataMessage.data[1];

								setTaskDrawerState((prevState) => ({
									...prevState,
									task: task,
									visible: true,
									author: author,
									executer: executer,
								}));
							}
						);

						ConnectionManager.getInstance().emit(
							RequestType.GET_USERS_INFO,
							[task.executerId, task.authorId],
							accState.session
						);
					}
				);
				console.log("CLICK ON NOT ", not);

				ConnectionManager.getInstance().emit(
					RequestType.GET_TASKS_INFO,
					[JSON.parse(not.customData).id],
					accState.session
				);
			}
		}
	};

	if (notificationItems.length === 0)
		return (
			<NotificationOutlined
				style={{ fontSize: "30px", color: "#f0f0f0", paddingRight: "1%" }}
			/>
		);

	return (
		<div
			style={{
				paddingRight: "1%",
			}}
		>
			<TaskDrawer {...taskDrawerState}></TaskDrawer>
			<Dropdown
				arrow
				overlay={
					<Menu>
						{notificationItems.map((not) => {
							const dateCreation = new Date(not.dateCreation);
							return (
								<Menu.Item
									key={not.id}
									icon={<InfoCircleTwoTone />}
									style={{
										border: "1px solid #1890ff",
										borderRadius: "5px",
										borderTop: "0",
										borderTopLeftRadius: "0",
										borderTopRightRadius: "0",
									}}
								>
									<div
										style={{
											borderLeft: "3px solid #2f54eb",
											paddingLeft: "4px",
											maxWidth: "450px",
											width: "450px",
										}}
									>
										<Row>
											<Col flex="93%">
												<Typography.Text
													style={{
														color: "#2f54eb",
													}}
												>
													{not.title.toUpperCase()}
												</Typography.Text>

												<p />
												<div
													style={{
														textOverflow: "ellipsis",
														overflow: "hidden",
														whiteSpace: "normal",
													}}
												>
													{not.content}
												</div>
												<Row>
													<Col flex="50%">
														<Button
															type="link"
															icon={<FullscreenOutlined />}
															value={not.id}
															onClick={onSaveNotificationClick}
														>
															Відкрити
														</Button>
													</Col>
													<Col flex="50%">
														<div style={{ textAlign: "right" }}>
															<Typography.Text strong>
																{dateCreation.toLocaleString("uk")}
															</Typography.Text>
														</div>
													</Col>
												</Row>
											</Col>
											<Col flex="auto" style={{ paddingLeft: "1%" }}>
												<Button
													type="ghost"
													// shape="circle"
													// size="large"
													icon={<CloseOutlined />}
													style={{
														// border: "0",
														width: "100%",
														height: "100%",
													}}
													value={not.id}
													onClick={onCloseNotification}
												/>
											</Col>
										</Row>
									</div>
								</Menu.Item>
							);
						})}
					</Menu>
				}
				trigger={["click"]}
				overlayStyle={{
					overflow: "auto",
					maxHeight: "400px",
					borderRadius: "5px",
				}}
			>
				<div
					style={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
					}}
				>
					<Badge count={notificationItems.length} offset={[-30, 30]}>
						<NotificationFilled
							style={{ fontSize: "30px", color: "#f5222d" }}
						/>
					</Badge>
				</div>
			</Dropdown>
		</div>
	);
};
