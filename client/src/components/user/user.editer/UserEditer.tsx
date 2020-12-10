import React, { useState, useEffect } from "react";
import {
	Form,
	Input,
	Button,
	Radio,
	ConfigProvider,
	Modal,
	Result,
	TreeSelect,
	Select,
	Divider,
	message,
} from "antd";
import { Store } from "antd/lib/form/interface";
import FormLocale from "antd/es/locale/uk_UA";
import * as moment from "moment";
import "moment/locale/uk";
import { useSelector } from "react-redux";
import { selectAccount } from "../../../redux/slicers/accountSlice";
import { UserRole, User } from "../../../types/user";
import { ConnectionManager } from "../../../managers/connetion/connectionManager";
import {
	RequestType,
	ResponseMessage,
	ResponseCode,
} from "../../../types/requests";
import {
	UserPosition,
	PositionTreeData,
	TreeUserPosition,
} from "../../../types/userPosition";
import { SwitchTransition, CSSTransition } from "react-transition-group";

moment.locale("uk");

interface ModalProps {
	visible: boolean;
	title: string;
	content: string;
}

interface Props {}
export const UserEditerPage: React.FC<Props> = () => {
	//////HOOKS
	const accState = useSelector(selectAccount);
	const [modalState, setModalState] = useState<ModalProps>({
		visible: false,
		title: "",
		content: "",
	});
	const [userPositionsState, setUserPositionsState] = useState<
		PositionTreeData[]
	>([]);
	const [userPositionsTree, setUserPositionsTree] = useState<
		TreeUserPosition
	>();
	const [users, setUsers] = useState<User[]>([]);
	const [currentUser, setCurrentUser] = useState<User>();
	const [form] = Form.useForm();
	useEffect(() => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_USER_POSITIONS,
			(data: any) => {
				console.log(data);
				const dataMessage = data as ResponseMessage<UserPosition[]>;
				if (dataMessage.requestCode === ResponseCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}

				const tup: TreeUserPosition = new TreeUserPosition();
				tup.fillByArray(dataMessage.data);
				const treeData = tup.generateTreeData();
				setUserPositionsState(treeData);
				setUserPositionsTree(tup);
			}
		);
		ConnectionManager.getInstance().emit(
			RequestType.GET_USER_POSITIONS,
			{},
			accState.session
		);
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_ALL_USERS,
			(data: any) => {
				console.log(data);
				const dataMessage = data as ResponseMessage<User[]>;
				if (dataMessage.requestCode === ResponseCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}

				setUsers(dataMessage.data.filter((u) => u.role !== UserRole.ADMIN));
			}
		);
		ConnectionManager.getInstance().emit(
			RequestType.GET_ALL_USERS,
			{},
			accState.session
		);
	}, []);

	//////VARIABLES
	const layout = {
		labelCol: { span: 8 },
		wrapperCol: { span: 16 },
	};
	const roles = [
		{ value: UserRole.USER, name: "Звичайний користувач" },
		{ value: UserRole.ADMIN, name: "Адмін" },
	];

	//////CALLBACKS
	const onFinish = (data: Store) => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.UPDATE_USER_INFO,
			(data) => {
				const dataMessage = data as ResponseMessage<any>;
				if (dataMessage.requestCode === ResponseCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}

				message.success("Інформація оновлена");
			}
		);

		const updateUserInfo = currentUser;

		if (updateUserInfo) {
			if (data.password) {
				updateUserInfo.password = data.password;
			}

			updateUserInfo.firstName = data.info.firstName;
			updateUserInfo.secondName = data.info.secondName;
			updateUserInfo.middleName = data.info.middleName;
			updateUserInfo.login = data.login;
			const positionParam = userPositionsTree?.arrPositions.find(
				(pos) => pos.pos_id === Number.parseInt(data.position)
			);
			if (positionParam) {
				updateUserInfo.position = positionParam;
			}

			ConnectionManager.getInstance().emit(
				RequestType.UPDATE_USER_INFO,
				[updateUserInfo],
				accState.session
			);
		}
	};
	const handleModalOk = () => {
		setModalState({ visible: false, content: "", title: "" });
	};

	const onTreeChange = () => {
		console.log("CLICK");
	};

	const onUserSelect = (u_id: number) => {
		const user = users.find((u) => u.id === u_id);
		setCurrentUser(user);
		const store: Store = {
			login: user?.login,
			info: {
				firstName: user?.firstName,
				secondName: user?.secondName,
				middleName: user?.middleName,
			},
			role: user?.role,
			position: user?.position.pos_id.toString(),
		};
		form.setFieldsValue(store);
	};

	const usersGroup: Map<UserPosition, Array<User>> = new Map<
		UserPosition,
		Array<User>
	>();
	users.forEach((u) => {
		const isContain =
			Array.from(usersGroup).findIndex(
				(value) => value[0].pos_id === u.position.pos_id
			) >= 0;

		if (isContain) {
			usersGroup.forEach((value, key) => {
				if (key.pos_id === u.position.pos_id) {
					value.push(u);
				}
			});
		} else {
			usersGroup.set(u.position, [u]);
		}
	});

	// if (
	// 	Array.from(usersGroup).findIndex(
	// 		(value) => value[0].pos_id === accState.position.pos_id
	// 	) < 0
	// ) {
	// 	usersGroup.set(accState.position, [accState]);
	// } else {
	// 	usersGroup.forEach((value, key) => {
	// 		if (key.pos_id === accState.position.pos_id) {
	// 			if (value.findIndex((u) => u.id === accState.id) < 0) {
	// 				value.push(accState);
	// 			}
	// 		}
	// 	});
	// }

	return (
		<div
			style={{
				paddingTop: "2%",
				width: "100%",
				maxWidth: "1000px",
				margin: 0,
				textAlign: "center",
				display: "inline-block",
			}}
		>
			<Select style={{ width: "80%" }} onSelect={onUserSelect}>
				{Array.from(usersGroup).map((value: [UserPosition, User[]]) => {
					return (
						<Select.OptGroup label={value[0].name}>
							{value[1].map((v) => {
								if (v.id === accState.id) {
									return <Select.Option value={v.id}>Я</Select.Option>;
								}

								return (
									<Select.Option value={v.id}>
										{User.GetUserPIB(v)}
									</Select.Option>
								);
							})}
						</Select.OptGroup>
					);
				})}
			</Select>
			<Divider style={{ borderColor: "#8c8c8c", width: "80%" }}></Divider>
			<SwitchTransition mode="out-in">
				<CSSTransition
					key={currentUser ? currentUser?.id : -1}
					timeout={400}
					classNames="task"
					unmountOnExit
					addEndListener={(node, done) => {
						node.addEventListener("transitionend", done, false);
					}}
				>
					<ConfigProvider locale={FormLocale}>
						<Form
							{...layout}
							form={form}
							labelCol={{ span: 4 }}
							wrapperCol={{ span: 14 }}
							layout="horizontal"
							initialValues={{ size: "middle" }}
							onFinish={onFinish}
							style={{ visibility: currentUser ? "visible" : "hidden" }}
						>
							<Form.Item
								label="Логін"
								name="login"
								rules={[
									{
										required: true,
										message: "Будь-ласка, введіть логін!",
									},
								]}
							>
								<Input />
							</Form.Item>

							<Form.Item label="ПІБ">
								<Input.Group compact>
									<Form.Item
										name={["info", "secondName"]}
										noStyle
										rules={[
											{ required: true, message: "Введінь будь-ласка фамілію" },
										]}
									>
										<Input style={{ width: "34%" }} defaultValue="" />
									</Form.Item>
									<Form.Item
										name={["info", "firstName"]}
										noStyle
										rules={[
											{ required: true, message: "Введінь будь-ласка імя" },
										]}
									>
										<Input style={{ width: "33%" }} defaultValue="" />
									</Form.Item>
									<Form.Item
										name={["info", "middleName"]}
										noStyle
										rules={[
											{
												required: true,
												message: "Введінь будь-ласка по-батькові",
											},
										]}
									>
										<Input style={{ width: "33%" }} defaultValue="" />
									</Form.Item>
								</Input.Group>
							</Form.Item>

							<Form.Item label="Пароль" name="password">
								<Input.Password />
							</Form.Item>

							<Form.Item
								label="Посада"
								name="position"
								rules={[
									{ required: true, message: "Будь-ласка, оберіть посаду!" },
								]}
							>
								<TreeSelect
									style={{ width: "100%" }}
									// value={this.state.value}
									dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
									treeData={userPositionsState}
									placeholder="Please select"
									treeDefaultExpandAll
									onClick={onTreeChange}
								/>
							</Form.Item>

							<Form.Item
								label="Роль"
								name="role"
								rules={[
									{
										required: true,
										message: "Будь-ласка, оберіть роль!",
									},
								]}
							>
								<Radio.Group
									buttonStyle="solid"
									style={{
										display: "flex",
										flexDirection: "row",
										justifyContent: "flex-start",
										width: "auto",
									}}
								>
									{roles.map((period) => {
										return (
											<Radio.Button value={period.value}>
												{period.name}
											</Radio.Button>
										);
									})}
								</Radio.Group>
							</Form.Item>

							<Form.Item
								style={{
									display: "flex",
									flexDirection: "column",
									justifyContent: "center",
									alignItems: "center",
									width: "auto",
								}}
							>
								<Button
									type="primary"
									htmlType="submit"
									style={{
										display: "flex",
										flexDirection: "column",
										justifyContent: "center",
										alignItems: "center",
										width: "auto",
									}}
								>
									ОНОВИТИ
								</Button>
							</Form.Item>
						</Form>
						<Modal
							title={modalState.title}
							visible={modalState.visible}
							onOk={handleModalOk}
							footer={[
								<Button key="submit" type="primary" onClick={handleModalOk}>
									OK
								</Button>,
							]}
						>
							<Result status="success" title={modalState.content} />
						</Modal>
					</ConfigProvider>
				</CSSTransition>
			</SwitchTransition>
		</div>
	);
};
