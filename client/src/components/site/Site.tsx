import {
	Router,
	Switch,
	Route,
	Redirect,
	useLocation,
	useHistory,
} from "react-router-dom";
import React from "react";
import { Login } from "../login/Login";
import {
	AccountState,
	setUserData,
	selectAccount,
} from "../../redux/slicers/accountSlice";
import { MainMenu } from "../menu/Menu";
import { MyTasks } from "../mytask/MyTasks";
import { useDispatch } from "react-redux";
import Store from "./../../app/store";

export class Site extends React.Component<{}, AccountState> {
	constructor(props: any) {
		super(props);
		this.state = {
			login: "",
			id: 0,
			session: "",
		};
	}

	componentDidMount() {}

	componentWillMount() {
		const userJsonString = localStorage.getItem("user");

		if (userJsonString !== null) {
			const userAccount = JSON.parse(userJsonString) as AccountState;
			if (userAccount.id != 0) {
				console.log("componentWillMount: ", userAccount);

				this.setState(userAccount);
				Store.dispatch(setUserData(userAccount));
			}
		} else {
			this.setState({ id: 0, login: "", session: "" });
			Store.dispatch(setUserData({ session: "", login: "", id: 0 }));
		}
	}

	render() {
		debugger;
		// let loginPageRedirect = <Redirect to="/main"></Redirect>;
		// if (this.state.id === 0) {
		// 	loginPageRedirect = <Redirect to="/login"></Redirect>;
		// }

		return (
			<div className="App">
				<header className="App-header">
					{this.state.id === 0 ? (
						<Login></Login>
					) : (
						<Switch>
							<Route path="/login">
								<Login></Login>
							</Route>
							<Route path={["/main", "/"]}>
								<MainMenu></MainMenu>
							</Route>
						</Switch>
					)}
				</header>
			</div>
		);
	}
}
