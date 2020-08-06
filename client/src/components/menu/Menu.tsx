import { Layout, Menu } from "antd";
import {
	PieChartOutlined,
	PlusCircleOutlined,
	GroupOutlined,
	UsergroupAddOutlined,
	UserAddOutlined,
	BranchesOutlined,
	EditOutlined,
	UserSwitchOutlined,
} from "@ant-design/icons";
import React, { useState } from "react";
import styles from "./menu.module.css";
import { UserMenu } from "../user/menu/UserMenu";
import { NavLink, Switch, Route } from "react-router-dom";
import { MyTasks } from "../task/my-task/MyTasks";
import { CreateTask } from "../task/CreateTask";
import { useDispatch, useSelector } from "react-redux";
import { selectAccount } from "../../redux/slicers/accountSlice";
import { UserRole } from "../../types/user";
import { CreateUserPage } from "../user/CreateUser";
import { CSSTransition } from "react-transition-group";
import "./animations.css";
import MenuItem from "antd/lib/menu/MenuItem";
import { SubbordinatesTasks } from "../task/subtasks/SubbordinatesTasks";
import { EditTask } from "../task/edit-task/EditTask";
import { Notification } from "../notifications/Notifcation";
import { PositionsEditer } from "../positions.editer/PositionsEditer";

const { Header, Content, Footer, Sider } = Layout;

export enum MenuRoutes {
	MY_TASKS = "/menu/me/tasks",
	CREATE_USERS = "/menu/createuser",
	CREATE_TASK = "/menu/task/create",
	SUBBORDINATES_TASK = "/menu/subordinates/tasks",
	TASK_EDIT = "/menu/task/edit",
	POSITIONS_EDIT = "/menu/positions/edit",
}

const routes = [
	{
		key: "0",
		path: MenuRoutes.MY_TASKS,
		name: "MyTask",
		Component: MyTasks,
		icon: <PieChartOutlined />,
		content: "Мої задачі",
	},
	{
		key: "1",
		path: MenuRoutes.CREATE_USERS,
		name: "CreateUser",
		Component: CreateUserPage,
		icon: <UserAddOutlined />,
		content: "Створити користувача",
	},
	{
		key: "2",
		path: MenuRoutes.CREATE_TASK,
		name: "CreateTask",
		Component: CreateTask,
		icon: <PlusCircleOutlined />,
		content: "Створити задачу",
	},
	{
		key: "3",
		path: MenuRoutes.SUBBORDINATES_TASK,
		name: "SubordinatesTasks",
		Component: SubbordinatesTasks,
		icon: <BranchesOutlined />,
		content: "Задачі підлеглих",
	},
	{
		key: "4",
		path: MenuRoutes.TASK_EDIT,
		name: "TaskEdit",
		Component: EditTask,
		icon: <EditOutlined />,
		content: "Редагувати задачу",
	},
	{
		key: "5",
		path: MenuRoutes.POSITIONS_EDIT,
		name: "PositionsEdit",
		Component: PositionsEditer,
		icon: <UserSwitchOutlined />,
		content: "Редагувати посади",
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
					{routes
						.filter(({ path }) => {
							if (accState.role === UserRole.USER) {
								return (
									path !== MenuRoutes.CREATE_USERS &&
									path !== MenuRoutes.POSITIONS_EDIT
								);
							}
							return true;
						})
						.map(({ key, path, icon, content }) => {
							return (
								<MenuItem key={path} icon={icon} onClick={onMyTaskClick}>
									<NavLink to={path}>{content}</NavLink>
								</MenuItem>
							);
						})}
				</Menu>
			</Sider>
			<Layout className="site-layout">
				<Header
					className="site-layout-background"
					style={{
						padding: 0,
						textAlign: "right",
						display: "flex",
						justifyContent: "flex-end",
						alignItems: "center",
					}}
				>
					<Notification></Notification>
					<Menu
						theme="dark"
						mode="horizontal"
						defaultSelectedKeys={["1"]}
						style={headerStyle}
					>
						<Menu.Item
							key="1"
							style={{
								padding: "0",
								margin: "0",
								minWidth: "100px",
								textAlign: "center",
							}}
						>
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
