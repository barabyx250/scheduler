import { Layout, Menu } from "antd";
import {
	PieChartOutlined,
	PlusCircleOutlined,
	GroupOutlined,
	UsergroupAddOutlined,
	UserAddOutlined,
	BranchesOutlined,
} from "@ant-design/icons";
import React, { useState } from "react";
import styles from "./menu.module.css";
import { UserMenu } from "../user/menu/UserMenu";
import { NavLink, Switch, Route } from "react-router-dom";
import { MyTasks } from "../task/mytask/MyTasks";
import { CreateTask } from "../task/CreateTask";
import { useDispatch, useSelector } from "react-redux";
import { selectAccount } from "../../redux/slicers/accountSlice";
import { UserRole } from "../../types/user";
import { CreateUserPage } from "../user/CreateUser";
import { CSSTransition } from "react-transition-group";
import "./animations.css";
import MenuItem from "antd/lib/menu/MenuItem";
import { SubbordinatesTasks } from "../task/subtasks/SubbordinatesTasks";

const { Header, Content, Footer, Sider } = Layout;

const routes = [
	{
		key: "0",
		path: "/menu/mytasks",
		name: "MyTask",
		Component: MyTasks,
		icon: <PieChartOutlined />,
		content: "Мої задачі",
	},
	{
		key: "1",
		path: "/menu/createuser",
		name: "CreateUser",
		Component: CreateUserPage,
		icon: <UserAddOutlined />,
		content: "Створити користувача",
	},
	{
		key: "2",
		path: "/menu/createtask",
		name: "CreateTask",
		Component: CreateTask,
		icon: <PlusCircleOutlined />,
		content: "Створити задачу",
	},
	{
		key: "3",
		path: "/menu/subordinates/tasks",
		name: "SubordinatesTasks",
		Component: SubbordinatesTasks,
		icon: <BranchesOutlined />,
		content: "Задачі підлеглих",
	},
];

export const MainMenu: React.FC = () => {
	const dispatch = useDispatch();
	const accState = useSelector(selectAccount);
	const [state, setState] = useState({
		collapsed: false,
	});

	const onCollapse = (collapsed: any) => {
		console.log(collapsed);
		setState({ collapsed });
	};

	const headerStyle: React.CSSProperties = {
		padding: 0,
		textAlign: "right",
	};

	const onMyTaskClick = () => {};

	return (
		<Layout style={{ minHeight: "100vh" }}>
			<Sider collapsed={state.collapsed} onCollapse={onCollapse}>
				<div className={styles.logoBox}>
					<div id="textLogoBox">
						{!state.collapsed ? "ZSU Roadmap" : "ZSU RM"}
					</div>
				</div>
				<Menu
					theme="dark"
					defaultSelectedKeys={[window.location.pathname]}
					mode="inline"
				>
					{/* <Menu.Item
						key="1"
						icon={<PieChartOutlined />}
						onClick={onMyTaskClick}
					>
						<NavLink to="/menu/mytasks">Мої задачі</NavLink>
					</Menu.Item>
					<Menu.Item
						key="6"
						icon={<PlusCircleOutlined />}
						onClick={onMyTaskClick}
					>
						<NavLink to="/menu/createtask">Створити задачу</NavLink>
					</Menu.Item>
					{accState.role === UserRole.ADMIN && (
						<Menu.Item key="7" icon={<PlusCircleOutlined />}>
							<NavLink to="/menu/createuser">Створити користувача</NavLink>
						</Menu.Item>
					)}
					<Menu.Item key="8" icon={<GroupOutlined />} onClick={onMyTaskClick}>
						Задачі підлеглих
					</Menu.Item> */}
					{routes.map(({ key, path, icon, content }) => {
						return (
							<MenuItem key={path} icon={icon} onClick={onMyTaskClick}>
								<NavLink to={path}>{content}</NavLink>
							</MenuItem>
						);
					})}
				</Menu>
			</Sider>
			<Layout className="site-layout">
				<Header className="site-layout-background" style={{ padding: 0 }}>
					<Menu
						theme="dark"
						mode="horizontal"
						defaultSelectedKeys={["1"]}
						style={headerStyle}
					>
						<Menu.Item key="1">
							<UserMenu name={accState.login}></UserMenu>
						</Menu.Item>
					</Menu>
				</Header>
				<Content style={{ margin: "0 16px" }}>
					<div
						className="site-layout-background"
						style={{ width: "100%", height: "100%", position: "relative" }}
					>
						{routes.map(({ path, Component }) => (
							<Route key={path} exact path={path}>
								{({ match }) => {
									console.log(match);

									return (
										<div
											style={{
												position: "absolute",
												width: "100%",
											}}
										>
											<CSSTransition
												in={match !== null}
												timeout={400}
												classNames="my-node"
												onEnter={() => console.log("Enter")}
												onExited={() => console.log("Exit")}
												unmountOnExit
											>
												<Component />
											</CSSTransition>
										</div>
									);
								}}
							</Route>
						))}
					</div>
				</Content>
				<Footer style={{ textAlign: "center" }}>
					ZSU Roadmap ©2020 Created by BIUS
				</Footer>
			</Layout>
		</Layout>
	);
};
