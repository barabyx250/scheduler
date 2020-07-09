import { Menu, Dropdown } from "antd";
import React from "react";
import { UserOutlined } from "@ant-design/icons";
import { ACCOUNT_STORAGE_KEY } from "../../../types/constants";
import { TimersManager } from "../../../managers/timersManager";

export class UserMenu extends React.Component<{
	name?: string;
}> {
	onQuitClick() {
		localStorage.removeItem(ACCOUNT_STORAGE_KEY);
		TimersManager.getInstance().clearAllCallback();
		window.location.reload();
	}

	render() {
		console.log("User name: ", this.props.name);
		return (
			<Dropdown
				overlay={
					<div>
						<Menu>
							<Menu.Item>Мої налаштування</Menu.Item>
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
						: this.props.name.toUpperCase()}{" "}
					<UserOutlined />
				</div>
			</Dropdown>
		);
	}
}
