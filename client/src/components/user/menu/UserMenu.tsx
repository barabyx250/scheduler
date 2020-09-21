import { Menu, Dropdown, Typography } from "antd";
import React from "react";
import { UserOutlined } from "@ant-design/icons";
import { ACCOUNT_STORAGE_KEY } from "../../../types/constants";
import { TimersManager } from "../../../managers/timersManager";
import Store from "../../../app/store";
import { UserRole } from "../../../types/user";

export enum UserMenuPath {
	SETTINGS = "/user/settings",
	FAQ = "/user/faq",
	FEEDBACK = "/user/feedback",
}

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
							<Menu.Item>
								<Typography.Link href={UserMenuPath.SETTINGS}>
									Мої налаштування
								</Typography.Link>
							</Menu.Item>
							<Menu.Item>
								<Typography.Link href={UserMenuPath.FAQ}>FAQ</Typography.Link>
							</Menu.Item>
							{Store.getState().account.role === UserRole.USER && (
								<Menu.Item>
									<Typography.Link href={UserMenuPath.FEEDBACK}>
										Написати адміністратору
									</Typography.Link>
								</Menu.Item>
							)}
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
