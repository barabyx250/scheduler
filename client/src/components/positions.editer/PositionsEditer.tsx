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
import {
	Tree,
	Typography,
	Input,
	Button,
	Row,
	Col,
	List,
	Modal,
	message,
	Tooltip,
	Select,
} from "antd";
import { SwitchTransition, CSSTransition } from "react-transition-group";

import "./animations.css";
import { EMPTY_POSITION_ID } from "../../types/constants";

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
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.UPDATE_USER_POSITIONS,
			(data: any) => {
				console.log(data);
				const dataMessage = data as ResponseMessage<UserPosition[]>;
				if (dataMessage.requestCode === ResponseCode.RES_CODE_INTERNAL_ERROR) {
					message.error(dataMessage.requestCode);
					return;
				}

				message.success("Оновлено!");
			}
		);

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

	const onChangeParentPosition = (position: UserPosition) => {
		var newChiefId = -1;
		const onChiefSelect = (value: number) => {
			newChiefId = value;
		};
		Modal.confirm({
			title: "Оберіть нового прямого начальника",
			content: (
				<div>
					<Select style={{ width: "100%" }} onChange={onChiefSelect}>
						{treeUserPosition?.arrPositions
							.filter((pos) => pos.pos_id !== currentPosition?.pos_id)
							.map((pos) => (
								<Select.Option value={pos.pos_id}>{pos.name}</Select.Option>
							))}
						{/* <Select.Option></Select.Option> */}
					</Select>
				</div>
			),
			onOk: () => {
				if (newChiefId >= 0) {
					position.parent_id = newChiefId;
					ConnectionManager.getInstance().registerResponseOnceHandler(
						RequestType.UPDATE_USER_POSITIONS,
						(data: any) => {
							console.log(data);
							const dataMessage = data as ResponseMessage<any>;
							if (
								dataMessage.requestCode === ResponseCode.RES_CODE_INTERNAL_ERROR
							) {
								message.error(dataMessage.requestCode);
								return;
							}

							message.success("Оновлено!");

							ConnectionManager.getInstance().emit(
								RequestType.GET_USER_POSITIONS,
								{},
								accState.session
							);
						}
					);
					ConnectionManager.getInstance().registerResponseOnceHandler(
						RequestType.GET_USER_POSITIONS,
						(data) => {
							console.log(data);
							const dataMessage = data as ResponseMessage<UserPosition[]>;
							if (
								dataMessage.requestCode === ResponseCode.RES_CODE_INTERNAL_ERROR
							) {
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
						RequestType.UPDATE_USER_POSITIONS,
						[position],
						accState.session
					);
				}
			},
		});
	};

	const onDeletePositions = (position: UserPosition) => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.REMOVE_POSITIONS,
			(data) => {
				console.log(data);
				const dataMessage = data as ResponseMessage<UserPosition[]>;
				if (dataMessage.requestCode === ResponseCode.RES_CODE_INTERNAL_ERROR) {
					message.error("Сталася помилка при видаленні! Спробуйте пізніше!");
					return;
				}
				message.success("Видалено успішно!");

				ConnectionManager.getInstance().emit(
					RequestType.GET_USER_POSITIONS,
					{},
					accState.session
				);
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

				const tup: TreeUserPosition = new TreeUserPosition();
				tup.fillByArray(dataMessage.data);
				const treeData = tup.generateTreeData();
				setUserPositionsTreeDataState(treeData);
				setTreeUserPositions(tup);
			}
		);
		ConnectionManager.getInstance().emit(
			RequestType.REMOVE_POSITIONS,
			[position.pos_id],
			accState.session
		);
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
								{currentPosition !== undefined &&
									currentPosition.pos_id !== EMPTY_POSITION_ID && (
										<Tooltip title="Видалення можливе тільки, коли за цією посадою нема мосад нижче неї">
											<Button
												onClick={onDeletePositions.bind(null, currentPosition)}
												disabled={
													getPositionChilds(currentPosition.pos_id).length > 0
												}
											>
												Видалити посаду
											</Button>
										</Tooltip>
									)}
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
										<List.Item style={{ padding: "5px 0" }}>
											<div
												style={{
													paddingLeft: "1%",
													width: "100%",
													color: "#e6f7ff",
													borderRadius: "5px",
												}}
											>
												<Row>
													<Col
														flex="70%"
														style={{
															backgroundColor: "#1890ff",
														}}
													>
														{item.name}
													</Col>
													<Col style={{ paddingLeft: "1%" }}>
														<Tooltip title="Назначити нового прямого начальника">
															<Button
																type="text"
																size="small"
																danger
																onClick={onChangeParentPosition.bind(
																	null,
																	item
																)}
															>
																Рухати
															</Button>
														</Tooltip>
													</Col>
												</Row>
											</div>
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
