import { Layout, Menu, Breadcrumb, Button } from "antd";
import {
	DesktopOutlined,
	PieChartOutlined,
	FileOutlined,
	TeamOutlined,
	UserOutlined,
} from "@ant-design/icons";
import React from "react";
import styles from "./menu.module.css";
import logo from "./logo.png";
import { UserMenu } from "../user/menu/UserMenu";
import { Calendar, Type } from "../calendar/Calendar";
import { Task } from "../../types/task";

const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;

export class MainMenu extends React.Component {
	state = {
		collapsed: false,
	};

	onCollapse = (collapsed: any) => {
		console.log(collapsed);
		this.setState({ collapsed });
	};

	headerStyle: React.CSSProperties = {
		padding: 0,
		textAlign: "right",
	};

	render() {
		return (
			<Layout style={{ minHeight: "100vh" }}>
				<Sider
					collapsible
					collapsed={this.state.collapsed}
					onCollapse={this.onCollapse}
				>
					<div className={styles.logoBox}>
						<div id="textLogoBox">
							{!this.state.collapsed ? "ZSU Roadmap" : "ZSU RM"}
						</div>
					</div>
					<Menu theme="dark" defaultSelectedKeys={["1"]} mode="inline">
						<Menu.Item key="1" icon={<PieChartOutlined />}>
							Мої задачі
						</Menu.Item>
						<SubMenu key="sub2" icon={<TeamOutlined />} title="Team">
							<Menu.Item key="6">Team 1</Menu.Item>
							<Menu.Item key="8">Team 2</Menu.Item>
						</SubMenu>
					</Menu>
				</Sider>
				<Layout className="site-layout">
					<Header className="site-layout-background" style={{ padding: 0 }}>
						<Menu
							theme="dark"
							mode="horizontal"
							defaultSelectedKeys={["1"]}
							style={this.headerStyle}
						>
							<Menu.Item key="1">
								<UserMenu></UserMenu>
							</Menu.Item>
						</Menu>
					</Header>
					<Content style={{ margin: "0 16px" }}>
						<div
							className="site-layout-background"
							style={{ width: "100%", height: "100%" }}
						>
							<Calendar tasks={[]} type={Type.WEEK}></Calendar>
						</div>
					</Content>
					<Footer style={{ textAlign: "center" }}>
						ZSU Roadmap ©2020 Created by BIUS
					</Footer>
				</Layout>
			</Layout>
		);
	}
}
