import React, { useState, useEffect } from "react";
import { ConnectionManager } from "../../managers/connetion/connectionManager";
import {
	RequestType,
	ResponseMessage,
	ResponseCode,
} from "../../types/requests";
import {
	TreeUserPosition,
	UserPosition,
	PositionTreeData,
} from "../../types/userPosition";
import { useSelector } from "react-redux";
import { selectAccount } from "../../redux/slicers/accountSlice";
import { Tree, Typography, Input, Button, Row, Col, List, Modal } from "antd";
import { SwitchTransition, CSSTransition } from "react-transition-group";

import "./animations.css";
import { pathToFileURL } from "url";

export const PositionsEditer: React.FC = () => {
	const [userPositionsTreeDataState, setUserPositionsTreeDataState] = useState<
		PositionTreeData[]
	>([]);
	const [currentPosition, setCurrentPosition] = useState<UserPosition>();
	const [treeUserPosition, setTreeUserPositions] = useState<TreeUserPosition>();
	const accState = useSelector(selectAccount);
	const [modal, contextHolder] = Modal.useModal();

	useEffect(() => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_USER_POSITIONS,
			(data) => {
				console.log(data);
				const dataMessage = data as ResponseMessage<UserPosition[]>;
				if (dataMessage.requestCode === ResponseCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}

				const tup: TreeUserPosition = new TreeUserPosition();
				tup.fillByArray(dataMessage.data);
				const treeData = tup.generateTreeData();
				setUserPositionsTreeDataState(treeData);
				setTreeUserPositions(tup);
			}
		);
		ConnectionManager.getInstance().emit(
			RequestType.GET_USER_POSITIONS,
			{},
			accState.session
		);
	}, []);

	const onPositionSelect = (position: any) => {
		console.log(position);
		const posId = Number.parseInt(position[0]);
		const newPos = treeUserPosition?.arrPositions.find(
			(p) => p.pos_id === posId
		);
		if (newPos) {
			setCurrentPosition({
				name: newPos.name,
				parent_id: newPos.parent_id,
				pos_id: newPos.pos_id,
			});
			console.log(newPos);
		}
	};

	const onNameChange = (name: any) => {
		console.log(name.target.value);

		if (currentPosition)
			setCurrentPosition({ ...currentPosition, name: name.target.value });
	};

	const onNameChangeClick = () => {
		ConnectionManager.getInstance().emit(
			RequestType.UPDATE_USER_POSITIONS,
			[currentPosition],
			accState.session
		);
	};

	const getPositionChilds = (posId: number) => {
		const childs = treeUserPosition?.positions.get(posId);
		if (childs !== undefined) {
			return childs.filter((ch) => ch.pos_id !== posId);
		}
		return [];
	};

	const onAddPosition = () => {
		let newName: string = "";
		const onNameChange = (input: any) => {
			console.log(input.target.value);
			newName = input.target.value;
		};

		Modal.confirm({
			title: "Додати посаду",
			content: (
				<div>
					<Input onChange={onNameChange} />
				</div>
			),
			onOk: () => {
				const last_id = treeUserPosition?.getLastId();
				const parent_id = currentPosition?.pos_id;
				if (
					parent_id !== undefined &&
					last_id !== undefined &&
					treeUserPosition !== undefined &&
					newName !== ""
				) {
					const arrPos = treeUserPosition.arrPositions;
					const newUserPos: UserPosition = {
						pos_id: last_id + 1,
						parent_id: parent_id,
						name: newName,
					};
					arrPos.push(newUserPos);

					treeUserPosition.fillByArray(arrPos);
					setUserPositionsTreeDataState(treeUserPosition.generateTreeData());
					ConnectionManager.getInstance().emit(
						RequestType.UPDATE_USER_POSITIONS,
						[newUserPos],
						accState.session
					);
				}
			},
		});
	};

	return (
		<div>
			<Typography.Title>Меню редагування посад</Typography.Title>
			<Tree
				showLine={true}
				onSelect={onPositionSelect}
				treeData={userPositionsTreeDataState}
			/>
			<SwitchTransition mode="out-in">
				<CSSTransition
					key={currentPosition ? currentPosition.pos_id : -1}
					timeout={400}
					classNames="position"
					unmountOnExit
					addEndListener={(node, done) => {
						node.addEventListener("transitionend", done, false);
					}}
				>
					<div
						style={{
							visibility: currentPosition ? "visible" : "hidden",
						}}
					>
						<Row justify="center">
							<Col flex={"30%"}>
								<Input value={currentPosition?.name} onChange={onNameChange} />
							</Col>
							<Col flex={"10%"}>
								<Button onClick={onNameChangeClick}>Оновити ім'я</Button>
							</Col>
							<Col flex={"20%"}>
								<Typography.Text>Хто підпорядковується: </Typography.Text>
								<List
									itemLayout="horizontal"
									dataSource={
										currentPosition
											? getPositionChilds(currentPosition.pos_id)
											: []
									}
									renderItem={(item) => (
										<List.Item
											style={{
												color: "#e6f7ff",
												borderRadius: "5px",
												backgroundColor: "#1890ff",
											}}
										>
											<div style={{ paddingLeft: "1%" }}>{item.name}</div>
										</List.Item>
									)}
									style={{
										marginLeft: "1%",
									}}
								/>
								<Button onClick={onAddPosition}>Додати посаду</Button>
							</Col>
						</Row>
					</div>
				</CSSTransition>
			</SwitchTransition>
			{contextHolder}
		</div>
	);
};
