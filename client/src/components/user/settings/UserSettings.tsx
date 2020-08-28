import {
	Descriptions,
	message,
	Typography,
	Row,
	Col,
	Space,
	Input,
	Button,
} from "antd";
import React, { useState, useEffect } from "react";
import { User, UserRole } from "../../../types/user";
import { useSelector, useDispatch } from "react-redux";
import {
	selectAccount,
	AccountState,
	setUserData,
} from "../../../redux/slicers/accountSlice";
import { ConnectionManager } from "../../../managers/connetion/connectionManager";
import {
	RequestType,
	ResponseMessage,
	ResponseCode,
} from "../../../types/requests";

import "./description.css";
import { EyeTwoTone, EyeInvisibleOutlined } from "@ant-design/icons";
import { stringify } from "querystring";

const { Paragraph, Title } = Typography;

enum StringChangeType {
	FIRST,
	MIDDLE,
	SECOND,
	LOGIN,
	PASSWORD_FIRST,
	PASSWORD_SECOND,
}

export const UserSettings: React.FC = () => {
	const account = useSelector(selectAccount);
	const [userInfo, setUserInfo] = useState<User>(account);
	const [userPassword, setUserPassword] = useState<{
		first: string;
		second: string;
	}>({
		first: "",
		second: "",
	});
	const dispatch = useDispatch();

	useEffect(() => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_USERS_INFO,
			(data) => {
				const dataMessage = data as ResponseMessage<Array<User>>;
				if (dataMessage.requestCode === ResponseCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}

				if (dataMessage.data.length === 0) {
					message.error(
						"Помилка! Не вдалося завантажити актуальну інформацію користувача.",
						5
					);
					return;
				}

				setUserInfo(dataMessage.data[0]);
				const newUserData = dataMessage.data[0];
				newUserData.session = account.session;
				localStorage.setItem("user", JSON.stringify(newUserData));

				dispatch(setUserData(newUserData));
			}
		);

		ConnectionManager.getInstance().emit(
			RequestType.GET_USERS_INFO,
			[account.id],
			account.session
		);
	}, []);

	const onChangeNames = (nameType: StringChangeType, str: string) => {
		console.log("update", str, nameType);

		if (str === "") {
			message.error("Цей параметр не може бути пустий.");
			return;
		}

		switch (nameType) {
			case StringChangeType.FIRST: {
				setUserInfo({
					...userInfo,
					firstName: str,
				});
				break;
			}
			case StringChangeType.LOGIN: {
				setUserInfo({
					...userInfo,
					login: str,
				});
				break;
			}
			case StringChangeType.MIDDLE: {
				setUserInfo({
					...userInfo,
					middleName: str,
				});
				break;
			}
			case StringChangeType.SECOND: {
				setUserInfo({
					...userInfo,
					secondName: str,
				});
				break;
			}
		}
	};

	const onPasswordChange: (
		type: StringChangeType,
		event: React.ChangeEvent<HTMLInputElement>
	) => void = (type: StringChangeType, { target: { value } }) => {
		if (value === "") {
			message.error("Пароль не може бути пустим");
			return;
		}

		switch (type) {
			case StringChangeType.PASSWORD_FIRST: {
				setUserPassword({
					...userPassword,
					first: value,
				});
				break;
			}
			case StringChangeType.PASSWORD_SECOND: {
				setUserPassword({
					...userPassword,
					second: value,
				});
				break;
			}
		}
	};

	const onSaveChanges = () => {
		if (userPassword.first !== userPassword.second) {
			message.error("Паролі не однакові!");
			return;
		}

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

		const updateUserInfo = userInfo;
		updateUserInfo.password = userPassword.first;

		ConnectionManager.getInstance().emit(
			RequestType.UPDATE_USER_INFO,
			[updateUserInfo],
			account.session
		);
	};

	return (
		<div>
			<Row justify="center">
				<Col flex="60%">
					<Title level={3} style={{ paddingTop: "1%" }}>
						Налаштування
					</Title>
					<Descriptions bordered size="default">
						<Descriptions.Item label="Логін" span={3} className="description">
							<Paragraph
								editable={{
									onChange: onChangeNames.bind(null, StringChangeType.LOGIN),
								}}
								style={{ margin: "0" }}
							>
								{userInfo.login}
							</Paragraph>
						</Descriptions.Item>
						<Descriptions.Item
							label="Прізвище"
							span={3}
							className="description"
						>
							<Paragraph
								editable={{
									onChange: onChangeNames.bind(null, StringChangeType.SECOND),
								}}
								style={{ margin: "0" }}
							>
								{userInfo.secondName}
							</Paragraph>
						</Descriptions.Item>
						<Descriptions.Item
							label="По батькові"
							className="description"
							span={2}
						>
							<Paragraph
								editable={{
									onChange: onChangeNames.bind(null, StringChangeType.MIDDLE),
								}}
								style={{ margin: "0" }}
							>
								{userInfo.middleName}
							</Paragraph>
						</Descriptions.Item>
						<Descriptions.Item label="Ім'я" className="description">
							<Paragraph
								editable={{
									onChange: onChangeNames.bind(null, StringChangeType.FIRST),
								}}
								style={{ margin: "0" }}
							>
								{userInfo.firstName}
							</Paragraph>
						</Descriptions.Item>
						<Descriptions.Item
							label="Змінити пароль"
							className="description"
							span={3}
						>
							<Space direction="vertical">
								<Input.Password
									placeholder="Новий пароль"
									onChange={onPasswordChange.bind(
										null,
										StringChangeType.PASSWORD_FIRST
									)}
									iconRender={(visible) =>
										visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
									}
								/>
								<Input.Password
									placeholder="Повторіть новий пароль"
									onChange={onPasswordChange.bind(
										null,
										StringChangeType.PASSWORD_SECOND
									)}
								/>
							</Space>
						</Descriptions.Item>
						<Descriptions.Item label="Посада" className="description" span={3}>
							{userInfo.position.name}
						</Descriptions.Item>
						<Descriptions.Item
							label="Тип користувача"
							className="description"
							span={3}
						>
							{userInfo.role === UserRole.ADMIN
								? "адміністратор"
								: "звичайний користувач"}
						</Descriptions.Item>
					</Descriptions>
					<Button type="primary" onClick={onSaveChanges}>
						Зберегти
					</Button>
				</Col>
			</Row>
		</div>
	);
};
