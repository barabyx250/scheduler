import { Alert, Menu, Dropdown, Button } from "antd";
import React from "react";
import { DownOutlined, UserOutlined } from "@ant-design/icons";
import styles from "./userMenu.module.css";
import { ACCOUNT_STORAGE_KEY } from "../../../types/constants";

export class UserMenu extends React.Component<{
	name?: string;
}> {
	onQuitClick() {
		localStorage.removeItem(ACCOUNT_STORAGE_KEY);
		window.location.reload();
	}

	render() {
		return (
			<Dropdown
				overlay={
					<div>
						<Menu>
							<Menu.Item>2nd menu item</Menu.Item>
							<Menu.Item>3rd menu item</Menu.Item>
							<Menu.Item danger onClick={this.onQuitClick}>
								Вийти
							</Menu.Item>
						</Menu>
					</div>
				}
				placement="bottomRight"
			>
				<div>
					{this.props.name === "" || this.props.name === undefined
						? "USER"
						: this.props.name.toUpperCase}{" "}
					<UserOutlined />
				</div>
			</Dropdown>
		);
	}
}
