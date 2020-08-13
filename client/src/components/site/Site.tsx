import { Switch, Route } from "react-router-dom";
import React from "react";
import { Login } from "../login/Login";
import { AccountState, setUserData } from "../../redux/slicers/accountSlice";
import { MainMenu } from "../menu/Menu";
import Store from "./../../app/store";
import { UserRole } from "../../types/user";

export class Site extends React.Component<{}, AccountState> {
	constructor(props: any) {
		super(props);
		this.state = {
			login: "",
			id: 0,
			session: "",
			firstName: "",
			middleName: "",
			password: "",
			role: UserRole.USER,
			secondName: "",
			position: {
				name: "",
				parent_id: 0,
				pos_id: 0,
			},
		};
	}

	componentDidMount() {}

	componentWillMount() {
		const userJsonString = localStorage.getItem("user");

		if (userJsonString !== null) {
			const userAccount = JSON.parse(userJsonString) as AccountState;
			if (userAccount.id !== 0) {
				console.log("componentWillMount: ", userAccount);

				this.setState(userAccount);
				Store.dispatch(setUserData(userAccount));
			}
		} else {
			this.setState({ id: 0, login: "", session: "" });
			Store.dispatch(
				setUserData({
					login: "",
					id: 0,
					session: "",
					firstName: "",
					middleName: "",
					password: "",
					role: UserRole.USER,
					secondName: "",
					position: {
						name: "",
						parent_id: 0,
						pos_id: 0,
					},
				})
			);
		}
	}

	render() {
		// let loginPageRedirect = <Redirect to="/main"></Redirect>;
		// if (this.state.id === 0) {
		// 	loginPageRedirect = <Redirect to="/login"></Redirect>;
		// }

		return (
			<div className="App">
				<header className="App-header">
					{this.state.id === 0 || this.state.session === "" ? (
						<Login></Login>
					) : (
						<div>
							<Route path="/login">
								<Login></Login>
							</Route>
							<Route path={["/main", "/"]}>
								<MainMenu></MainMenu>
							</Route>
						</div>
					)}
				</header>
			</div>
		);
	}
}
