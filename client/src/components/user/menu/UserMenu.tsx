import { Alert, Menu, Dropdown, Button } from "antd";
import React from "react";
import { DownOutlined, UserOutlined } from "@ant-design/icons";
import styles from "./userMenu.module.css";

export class UserMenu extends React.Component<{
	name?: string;
}> {
	render() {
		return (
			<Dropdown
				overlay={
					<div>
						<Menu>
							<Menu.Item>2nd menu item</Menu.Item>
							<Menu.Item>3rd menu item</Menu.Item>
							<Menu.Item danger>Вийти</Menu.Item>
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
