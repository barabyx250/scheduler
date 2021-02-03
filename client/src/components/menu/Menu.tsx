import { Layout, Menu } from "antd";
import {
  PieChartOutlined,
  PlusCircleOutlined,
  UserAddOutlined,
  BranchesOutlined,
  EditOutlined,
  UserSwitchOutlined,
  CheckOutlined,
  ClusterOutlined,
} from "@ant-design/icons";
import React, { useState } from "react";
import styles from "./menu.module.css";
import { UserMenu, UserMenuPath } from "../user/menu/UserMenu";
import { NavLink, Route, Redirect } from "react-router-dom";
import { MyTasks } from "../task/my-task/MyTasks";
import { CreateTask } from "../task/CreateTask";
import { useSelector } from "react-redux";
import { selectAccount } from "../../redux/slicers/accountSlice";
import { UserRole } from "../../types/user";
import { CreateUserPage } from "../user/CreateUser";
import { CSSTransition } from "react-transition-group";
import "./animations.css";
import MenuItem from "antd/lib/menu/MenuItem";
import { SubbordinatesTasks } from "../task/subtasks/SubbordinatesTasks";
import { EditTask } from "../task/edit-task/EditTask";
import { RDPNotification } from "../notifications/Notifcation";
import { PositionsEditer } from "../positions.editer/PositionsEditer";
import { ComplitedTasks } from "../task/complitedTasks/ComplitedTasks";
import { UserSettings } from "../user/settings/UserSettings";
import { UserEditerPage } from "../user/user.editer/UserEditer";
import { FAQ } from "../faq/FAQ";
import { PositionViewer } from "../user/position.viewer/PositionViewer";
import { AdminMessagesPage } from "../messages/admin.messages/AdminMessagesPage";
import { UserMessagesPage } from "../messages/user.messages/UserMessagesPage";
import { AssignedTasks } from "../task/assignedTasks/assignedTasks";

const { Header, Content, Footer, Sider } = Layout;

export enum MenuRoutes {
  MY_TASKS = "/menu/me/tasks",
  CREATE_USERS = "/menu/createuser",
  CREATE_TASK = "/menu/task/create",
  SUBBORDINATES_TASK = "/menu/subordinates/tasks",
  TASK_EDIT = "/menu/task/edit",
  POSITIONS_EDIT = "/menu/positions/edit",
  COMPLITED_TASKS = "/menu/task/selector",
  ASSIGNED_TASKS = "/menu/task/assignedByMe",
  USER_EDIT = "/menu/user/edit",
  POSITION_VIEWER = "/menu/positions/view",
  ADMIN_MESSANGER = "/menu/admin/messages",

  DIVIDER = "divider",
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
    key: "3",
    path: MenuRoutes.SUBBORDINATES_TASK,
    name: "SubordinatesTasks",
    Component: SubbordinatesTasks,
    icon: <BranchesOutlined />,
    content: "Задачі підлеглих",
  },
  {
    key: "6",
    path: MenuRoutes.COMPLITED_TASKS,
    name: "ComplitedTasks",
    Component: ComplitedTasks,
    icon: <CheckOutlined />,
    content: "Завершені задачі",
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
    key: "4",
    path: MenuRoutes.TASK_EDIT,
    name: "TaskEdit",
    Component: EditTask,
    icon: <EditOutlined />,
    content: "Редагувати задачу",
  },
  {
    key: "5001",
    path: MenuRoutes.DIVIDER,
    name: "DIVIDER",
    Component: MyTasks,
    icon: <CheckOutlined />,
    content: "",
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
    key: "7",
    path: MenuRoutes.USER_EDIT,
    name: "UserEdit",
    Component: UserEditerPage,
    icon: <UserSwitchOutlined />,
    content: "Редагувати користувачів",
  },
  {
    key: "5001",
    path: MenuRoutes.DIVIDER,
    name: "DIVIDER",
    Component: MyTasks,
    icon: <CheckOutlined />,
    content: "",
  },
  {
    key: "8",
    path: MenuRoutes.POSITION_VIEWER,
    name: "PositionViewer",
    Component: PositionViewer,
    icon: <ClusterOutlined />,
    content: "Посади",
  },
  {
    key: "55",
    path: MenuRoutes.POSITIONS_EDIT,
    name: "PositionsEdit",
    Component: PositionsEditer,
    icon: <UserSwitchOutlined />,
    content: "Редагувати посади",
  },
  {
    key: "56",
    path: MenuRoutes.ADMIN_MESSANGER,
    name: "AdminMessanger",
    Component: AdminMessagesPage,
    icon: <UserSwitchOutlined />,
    content: "СМС",
  },

  {
    key: "57",
    path: MenuRoutes.ASSIGNED_TASKS,
    name: "AdminMessanger",
    Component: AssignedTasks,
    icon: <UserSwitchOutlined />,
    content: "Мої назначені задачі",
  },
];

export const MainMenu: React.FC = () => {
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
          <div id="textLogoBox">{!state.collapsed ? "RDP" : "ZSU RM"}</div>
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
                  path === MenuRoutes.COMPLITED_TASKS ||
                  path === MenuRoutes.CREATE_TASK ||
                  path === MenuRoutes.MY_TASKS ||
                  path === MenuRoutes.SUBBORDINATES_TASK ||
                  path === MenuRoutes.TASK_EDIT ||
                  path === MenuRoutes.POSITION_VIEWER ||
                  path === MenuRoutes.ASSIGNED_TASKS
                );
              }
              if (accState.role === UserRole.ADMIN) {
                return (
                  path === MenuRoutes.CREATE_USERS ||
                  path === MenuRoutes.POSITIONS_EDIT ||
                  path === MenuRoutes.USER_EDIT ||
                  path === MenuRoutes.ADMIN_MESSANGER ||
                  path === MenuRoutes.POSITION_VIEWER
                );
              }
              return false;
            })
            .map(({ key, path, icon, content }) => {
              if (path === MenuRoutes.DIVIDER) {
                return <Menu.Divider></Menu.Divider>;
              }

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
          <RDPNotification></RDPNotification>
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
            {routes
              .filter(({ path }) => path !== MenuRoutes.DIVIDER)
              .map(({ path, Component }) => (
                <Route key={path} exact path={path}>
                  {({ match }) => {
                    return (
                      <div
                        style={{
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
            <Route
              key={UserMenuPath.SETTINGS}
              exact
              path={UserMenuPath.SETTINGS}
            >
              <UserSettings></UserSettings>
            </Route>

            <Route key={UserMenuPath.FAQ} exact path={UserMenuPath.FAQ}>
              <FAQ></FAQ>
            </Route>

            <Route
              key={UserMenuPath.FEEDBACK}
              exact
              path={UserMenuPath.FEEDBACK}
            >
              <UserMessagesPage></UserMessagesPage>
            </Route>

            <Route exact path={["/", "/main"]}>
              <Redirect to={MenuRoutes.MY_TASKS} />
            </Route>
          </div>
        </Content>
        <div>
          <Footer style={{ textAlign: "center", position: "static" }}>
            Roadmap ©2020 Created by BIUS
          </Footer>
        </div>
      </Layout>
    </Layout>
  );
};
