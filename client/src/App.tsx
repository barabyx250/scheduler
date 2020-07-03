import React, { useEffect } from "react";
import "./App.css";
import { Login } from "./components/login/Login";
import "antd/dist/antd.css";
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Redirect,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
	selectAccount,
	AccountState,
	setUserData,
} from "./redux/slicers/accountSlice";
import { Site } from "./components/site/Site";

function App() {
	const dispatch = useDispatch();

	useEffect(() => {
		const userJsonString = localStorage.getItem("user");

		if (userJsonString !== null) {
			const userAccount = JSON.parse(userJsonString) as AccountState;
			if (userAccount.id != 0) {
				dispatch(setUserData(userAccount));
			}
		}
	});

	return (
		<Router>
			<Site></Site>
		</Router>
	);
}

export default App;
