import React, { useState, useEffect } from "react";
import {
	Form,
	Input,
	Button,
	Radio,
	Select,
	ConfigProvider,
	Modal,
	Result,
	TreeSelect,
} from "antd";
import { Store } from "antd/lib/form/interface";
import FormLocale from "antd/es/locale/uk_UA";
import * as moment from "moment";
import "moment/locale/uk";
import { useSelector } from "react-redux";
import { selectAccount } from "../../redux/slicers/accountSlice";
import { UserRole, User } from "../../types/user";
import { ConnectionManager } from "../../managers/connetion/connectionManager";
import {
	RequestType,
	ResponseMessage,
	ResponseCode,
} from "../../types/requests";
import {
	UserPosition,
	PositionTreeData,
	TreeUserPosition,
} from "../../types/userPosition";

moment.locale("uk");

interface ModalProps {
	visible: boolean;
	title: string;
	content: string;
}

interface Props {}
export const CreateUserPage: React.FC<Props> = () => {
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
	const [form] = Form.useForm();
	useEffect(() => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_USER_POSITIONS,
			(data) => {
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
			}
		);
		ConnectionManager.getInstance().emit(
			RequestType.GET_USER_POSITIONS,
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
		console.log(data);
		/*
		info: {secondName: "p", firstName: "i", middleName: "b"}
login: "Predator051"
password: "awdawd"
position: "3"
role: 0
		*/
		const user: User = {
			id: 0,
			firstName: data.info.firstName,
			login: data.login,
			password: data.password,
			role: data.role,
			middleName: data.info.middleName,
			secondName: data.info.secondName,
			session: "",
			position: {
				pos_id: data.position,
				name: "",
				parent_id: 0,
			},
		};
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.CREATE_USER,
			(data) => {
				console.log(data);
				const dataMessage = data as ResponseMessage<User>;
				if (
					dataMessage.requestCode === ResponseCode.RES_CODE_INTERNAL_ERROR &&
					dataMessage.data.id !== 0
				) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				setModalState({
					visible: true,
					content: `Користувач ${dataMessage.data.login} успішно створений`,
					title: "Система",
				});
			}
		);
		ConnectionManager.getInstance().emit(
			RequestType.CREATE_USER,
			user,
			accState.session
		);
	};

	const handleModalOk = () => {
		setModalState({ visible: false, content: "", title: "" });
	};

	const onTreeChange = () => {
		console.log("CLICK");
	};

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
			<ConfigProvider locale={FormLocale}>
				<Form
					{...layout}
					form={form}
					labelCol={{ span: 4 }}
					wrapperCol={{ span: 14 }}
					layout="horizontal"
					initialValues={{ size: "middle" }}
					onFinish={onFinish}
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
								rules={[{ required: true, message: "Введінь будь-ласка імя" }]}
							>
								<Input style={{ width: "33%" }} defaultValue="" />
							</Form.Item>
							<Form.Item
								name={["info", "middleName"]}
								noStyle
								rules={[
									{ required: true, message: "Введінь будь-ласка по-батькові" },
								]}
							>
								<Input style={{ width: "33%" }} defaultValue="" />
							</Form.Item>
						</Input.Group>
					</Form.Item>

					<Form.Item
						label="Пароль"
						name="password"
						rules={[
							{
								required: true,
								message: "Будь-ласка, введіть пароль!",
							},
						]}
					>
						<Input.Password />
					</Form.Item>

					<Form.Item
						label="Посада"
						name="position"
						rules={[{ required: true, message: "Будь-ласка, оберіть посаду!" }]}
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
							СТВОРИТИ
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
		</div>
	);
};
