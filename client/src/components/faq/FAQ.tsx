import { Collapse, Badge, Row, Space, Typography } from "antd";
import React from "react";
import { UserRole } from "../../types/user";
import { useSelector } from "react-redux";
import { selectAccount } from "../../redux/slicers/accountSlice";

const { Panel } = Collapse;

const faqData = [
	{
		role: UserRole.USER,
		header: "Опис пунктів головного меню",
		text: (
			<Collapse>
				<Panel header="Мої задачі" key="1" style={{ textAlign: "start" }}>
					<Typography.Text>
						Пункт меню "Мої задачі" відображає задачі, які були поставлені
						користувачеві. Присутні 3 режима перегляду:{" "}
						<ul>
							<li>Тижневий огляд - відображає задачі на поточний тиждень. </li>
							<li>Місячний огляд - відображає задачі на поточний місяць.</li>
							<li>Піврічний огляд - відображає задачі на поточне півріччя.</li>
						</ul>
						Клік по задачі відображає подробиці задачі.
					</Typography.Text>
				</Panel>
				<Panel header="Задачі підлеглих" key="2" style={{ textAlign: "start" }}>
					<Typography.Text>
						Пункт меню "Задачі підлеглих" відображає задачі, які були поставлені
						вашим прямим и не прямим підлеглим.
					</Typography.Text>
				</Panel>
				<Panel header="Завершені задачі" key="3" style={{ textAlign: "start" }}>
					<Typography.Text>
						Пункт меню "Завершені задачі" відображає задачі, які вже виконали
						(звітували про виконання). <br></br>
						Відображаються задачі: ваші та ваших прямих та не прямих підлеглих.
						<br></br>
						Можливо здійснювати пошук по імені завдання та сортування задач по
						даті виконання.
					</Typography.Text>
				</Panel>
				<Panel header="Створити задачу" key="4" style={{ textAlign: "start" }}>
					<Typography.Text>
						Пункт меню "Створити задачу" дозволяє створити задачу та назначити
						її на вас чи вашого підлеглого.<br></br>
					</Typography.Text>
				</Panel>
				<Panel
					header="Редагувати задачу"
					key="5"
					style={{ textAlign: "start" }}
				>
					<Typography.Text>
						Пункт меню "Редагувати задачу" дозволяє редагувати задачу, яку
						поставили ви чи вашому підлеглому.<br></br>
					</Typography.Text>
				</Panel>
				{/* <Panel
					header="Тільки для адміністраторів. Створити користувача"
					key="6"
					style={{ textAlign: "start" }}
				>
					<Typography.Text>
						Пункт меню "Створити користувача" дозволяє створити нового
						користувача в системі. Доступний тільки для адміністраторів<br></br>
					</Typography.Text>
				</Panel>
				<Panel
					header="Тільки для адміністраторів. Редагувати користувача"
					key="6"
					style={{ textAlign: "start" }}
				>
					<Typography.Text>
						Пункт меню "Редагувати користувача" дозволяє редагувати користувача.
						Доступний тільки для адміністраторів<br></br>
					</Typography.Text>
				</Panel> */}
				<Panel header="Посади" key="7" style={{ textAlign: "start" }}>
					<Typography.Text>
						Пункт меню "Посади" відображає посади та людей, які назначені на ці
						посади.<br></br>
					</Typography.Text>
				</Panel>
				{/* <Panel
					header="Тільки для адміністраторів. Редагувати посади"
					key="8"
					style={{ textAlign: "start" }}
				>
					<Typography.Text>
						Пункт меню "Редагувати посади" дозволяє редагувати посади: добавляти
						нові, редагувати поточні та видаляти їх.<br></br>
						Видаляти поточні посади можливо тільки у разі, якщо ця посада не має
						посад нижче неї. У разі видалення посади, користувачі, які
						перебувають на неї, будуть переназначенні на "пусту" посаду.
						Адміністратор в свою чергу повинен користувачів, які не перебувають
						ні на які посаді ("пуста" посада), переназначити на нову посаду в
						пункті меню "Редагувати користувачів".
					</Typography.Text>
				</Panel> */}
			</Collapse>
		),
	},
	{
		role: UserRole.ADMIN,
		header: "Опис пунктів головного меню",
		text: (
			<Collapse>
				<Panel
					header="Створити користувача"
					key="6"
					style={{ textAlign: "start" }}
				>
					<Typography.Text>
						Пункт меню "Створити користувача" дозволяє створити нового
						користувача в системі. <br></br>
					</Typography.Text>
				</Panel>
				<Panel
					header="Редагувати користувача"
					key="7"
					style={{ textAlign: "start" }}
				>
					<Typography.Text>
						Пункт меню "Редагувати користувача" дозволяє редагувати користувача.
						<br></br>
					</Typography.Text>
				</Panel>

				<Panel
					header="Редагувати посади"
					key="8"
					style={{ textAlign: "start" }}
				>
					<Typography.Text>
						Пункт меню "Редагувати посади" дозволяє редагувати посади: добавляти
						нові, редагувати поточні та видаляти їх.<br></br>
						Видаляти поточні посади можливо тільки у разі, якщо ця посада не має
						посад нижче неї. У разі видалення посади, користувачі, які
						перебувають на неї, будуть переназначенні на "пусту" посаду.
						Адміністратор в свою чергу повинен користувачів, які не перебувають
						ні на якій посаді ("пуста" посада), переназначити на нову посаду в
						пункті меню "Редагувати користувачів".
					</Typography.Text>
				</Panel>
			</Collapse>
		),
	},
	{
		role: UserRole.USER,
		header: "Як створити задачу тільки для себе?",
		text: (
			<Row justify="start">
				<Space direction="vertical" align="start">
					<Typography.Text>
						Під час створення задачі, задачу потрібно поставити на себе і тоді
						буде відображений перемикач "Особиста задача".
					</Typography.Text>
					<Typography.Text>Особисту задачу:</Typography.Text>
					<Badge status="processing" text="бачите тільки ви." color="blue" />
					<Badge
						status="processing"
						text="редагувати можете тільки ви."
						color="red"
					/>
					<Badge
						status="processing"
						text="ваш безпосередній начальник та начальники вище не бачуть цю задачу."
						color="orange"
					/>
				</Space>
			</Row>
		),
	},
	{
		role: UserRole.USER,
		header: "Які завдання я можу редагувати?",
		text: (
			<Row justify="start">
				<Space direction="vertical" align="start">
					<Typography.Text>
						Ви можете редагувати завдання, які поставили ви, та завдання
						підлеглих (тільки у разі, якщо завдання не було поставлене людиною
						вище за вашої посади)
					</Typography.Text>
				</Space>
			</Row>
		),
	},
	{
		role: UserRole.USER,
		header: "Як створити задачу?",
		text: (
			<Row justify="start">
				<Space direction="vertical" align="start">
					<Typography.Text>
						Задачу можливо створити в меню "Створити задачу". Для створення
						задачу, потрібно внести слідуючі дані:
					</Typography.Text>
					<Badge
						status="processing"
						text={
							<Typography.Text>
								<Typography.Text strong>Назва задачі. </Typography.Text>
								<Typography.Text>Розмір назви необмеженний.</Typography.Text>
							</Typography.Text>
						}
						color="red"
					/>
					<Badge
						status="processing"
						text={
							<Typography.Text>
								<Typography.Text strong>Опис задачі. </Typography.Text>
								<Typography.Text>Розмір опису необмеженний.</Typography.Text>
							</Typography.Text>
						}
						color="red"
					/>
					<Badge
						status="processing"
						text={<Typography.Text strong>Виконавець.</Typography.Text>}
						color="red"
					/>
					<Badge
						status="processing"
						text={<Typography.Text strong>Термін виконання.</Typography.Text>}
						color="red"
					/>
					<Badge
						status="processing"
						text={
							<Typography.Text strong>Періодичність задачі.</Typography.Text>
						}
						color="red"
					/>
					<Badge
						status="processing"
						text={
							<Typography.Text strong>
								Пріорітет виконання задачі.
							</Typography.Text>
						}
						color="red"
					/>
				</Space>
			</Row>
		),
	},
	{
		role: UserRole.USER,
		header: "Як редагувати задачу?",
		text: (
			<Row justify="start">
				<Space direction="vertical" align="start">
					<Typography.Text>
						Задачу можливо відредагувати в меню "Редагувати задачу". Якщо задача
						була вже виконана, можливо відмінити виконання цієї задачі. При
						необхідності, задачу можливо видалити.
					</Typography.Text>
				</Space>
			</Row>
		),
	},
];

export const FAQ: React.FC = () => {
	const accState = useSelector(selectAccount);
	return (
		<Row justify="center">
			<div style={{ width: "70%", paddingTop: "1%" }}>
				<Collapse>
					{faqData
						.filter(({ role }) => role === accState.role)
						.map(({ header, text }) => {
							return (
								<Panel header={header} key={header}>
									{text}
								</Panel>
							);
						})}
				</Collapse>
			</div>
		</Row>
	);
};
