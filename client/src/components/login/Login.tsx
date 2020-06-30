import React, { useState } from "react";
import { Button, Form, Input } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import logo from "./title.png";
import {
	ConnectionManager,
	RequestType,
} from "../../managers/connetion/connectionManager";
import { useDispatch, useSelector } from "react-redux";
import { selectAccount, setUserData } from "../../redux/slicers/accountSlice";
import { useHistory } from "react-router-dom";
import styles from "./login.module.css";
import { User } from "../../types/user";
import { RequestMessage, RequestCode } from "../../types/requests";
import { ErrorBox } from "../error/Error";

export function Login() {
	const dispatch = useDispatch();
	const [error, setErrorData] = useState("");
	const history = useHistory();

	const onFinish = (data: any) => {
		//{username: "уававыа", password: "ыаывыаыва"}
		ConnectionManager.getInstance().registerResponseHandler(
			RequestType.LOGIN,
			(data) => {
				const dataMessage = data as RequestMessage<User>;
				if (
					dataMessage.requestCode == RequestCode.RES_CODE_INTERNAL_ERROR ||
					dataMessage.data.id === 0
				) {
					console.log(`Error: ${dataMessage.requestCode}`);
					setErrorData(dataMessage.messageInfo);
					return;
				}
				setErrorData("");
				dispatch(
					setUserData({
						id: dataMessage.data.id,
						login: dataMessage.data.login,
						sessionId: dataMessage.data.session,
					})
				);
				localStorage.setItem("user", JSON.stringify(dataMessage.data));
				history.push("/");
			}
		);
		ConnectionManager.getInstance().emit(RequestType.LOGIN, data);
	};

	return (
		<div className={styles.box}>
			<img src={logo} className="App-logo" alt="logo" />
			<br />
			<Form
				name="normal_login"
				className={styles.formWidth}
				initialValues={{ remember: true }}
				onFinish={onFinish}
			>
				<Form.Item
					name="username"
					rules={[
						{ required: true, message: "Будь-ласка, введіть ваше ім'я!" },
					]}
				>
					<Input
						prefix={<UserOutlined className="site-form-item-icon" />}
						placeholder="Користувач"
						allowClear
					/>
				</Form.Item>
				<Form.Item
					name="password"
					rules={[
						{ required: true, message: "Будь-ласка, введіть ваш пароль!" },
					]}
				>
					<Input.Password
						prefix={<LockOutlined className="site-form-item-icon" />}
						allowClear
						placeholder="Пароль"
					/>
				</Form.Item>

				<Form.Item>
					<Button
						type="primary"
						htmlType="submit"
						className="login-form-button"
						size="large"
					>
						Увійти
					</Button>
				</Form.Item>
			</Form>
			{error !== "" && <ErrorBox description={error}></ErrorBox>}
		</div>
	);
}
