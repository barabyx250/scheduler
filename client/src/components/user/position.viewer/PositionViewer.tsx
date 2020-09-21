import React, { useState, useEffect } from "react";
import { ConnectionManager } from "../../../managers/connetion/connectionManager";
import {
	RequestType,
	ResponseMessage,
	ResponseCode,
} from "../../../types/requests";
import {
	TreeUserPosition,
	UserPosition,
	PositionTreeData,
} from "../../../types/userPosition";
import { useSelector } from "react-redux";
import { selectAccount } from "../../../redux/slicers/accountSlice";
import { Tree, Typography, Row, Col } from "antd";
import { User, UserRole } from "../../../types/user";
import { UserOutlined } from "@ant-design/icons";

export const PositionViewer: React.FC = () => {
	const [userPositionsTreeDataState, setUserPositionsTreeDataState] = useState<
		PositionTreeData[]
	>([]);
	const [users, setUsers] = useState<User[]>([]);
	const [treeUserPosition, setTreeUserPositions] = useState<TreeUserPosition>();
	const accState = useSelector(selectAccount);
	const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
	const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);

	useEffect(() => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_ALL_USERS,
			(data: ResponseMessage<User[]>) => {
				console.log("GET_ALL_USERS", data);
				if (data.requestCode === ResponseCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${data.requestCode}`);
					return;
				}
				setUsers(data.data.filter((u) => u.role !== UserRole.ADMIN));
			}
		);
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_USER_POSITIONS,
			(data) => {
				console.log(data);
				const dataMessage = data as ResponseMessage<UserPosition[]>;
				if (dataMessage.requestCode === ResponseCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}

				var tup: TreeUserPosition = new TreeUserPosition();
				tup.fillByArray(dataMessage.data);
				const treeData = tup.generateTreeData();
				setUserPositionsTreeDataState(treeData);
				setTreeUserPositions(tup);

				ConnectionManager.getInstance().emit(
					RequestType.GET_ALL_USERS,
					{},
					accState.session
				);
			}
		);
		ConnectionManager.getInstance().emit(
			RequestType.GET_USER_POSITIONS,
			{},
			accState.session
		);
	}, []);

	const onPositionExpand = (positions: React.Key[]) => {
		setExpandedKeys(positions);
	};

	const onPositionSelect = (positions: React.Key[]) => {
		setSelectedKeys(positions);
	};

	let treeData: PositionTreeData[] = [];
	console.log("IN");
	if (treeUserPosition !== undefined && users.length > 0) {
		treeData = treeUserPosition.mapTitleGenerateTreeData((up: UserPosition) => {
			const filtered_users = users.filter(
				(u) => u.position.pos_id === up.pos_id
			);

			if (filtered_users.length <= 0) {
				return "ПУСТО";
			}

			return filtered_users.reduce<string>(
				(previousValue: string, user: User) => {
					if (previousValue === "") return User.GetUserPIB(user);

					return previousValue + " | " + User.GetUserPIB(user);
				},
				""
			);
		});
	}

	return (
		<div>
			<Typography.Title>Меню огляду посад</Typography.Title>
			<Row>
				<Col flex="50%">
					<Tree
						showLine={true}
						onExpand={onPositionExpand}
						onSelect={onPositionSelect}
						treeData={userPositionsTreeDataState}
						expandedKeys={expandedKeys}
						selectedKeys={selectedKeys}
					/>
				</Col>
				<Col flex="50%">
					<Tree
						// showLine={true}
						showIcon={true}
						treeData={treeData}
						onExpand={onPositionExpand}
						onSelect={onPositionSelect}
						expandedKeys={expandedKeys}
						selectedKeys={selectedKeys}
						icon={<UserOutlined />}
					/>
				</Col>
			</Row>
		</div>
	);
};
