import { Router, Switch, Route, Redirect, useLocation, useHistory } from "react-router-dom";
import React from "react";
import { Login } from "../login/Login";
import { AccountState, setUserData, selectAccount } from "../../redux/slicers/accountSlice";
import { MainMenu } from '../menu/Menu';

export class Site extends React.Component<{}, AccountState> {
  constructor(props: any) {
    super(props);
    this.state = {
      login: "",
      id: 0,
      sessionId: ""
    };
  }

  componentDidMount() {

  }

  componentWillMount() {
    const userJsonString = localStorage.getItem("user");

    if (userJsonString !== null){
      const userAccount = JSON.parse(userJsonString) as AccountState;
      if (userAccount.id != 0)
      {
          //useDispatch()(setUserData(userAccount));
          this.setState(userAccount);
      }
    }
  }

  componentDidUpdate() {}

  render() {

    let loginPageRedirect = <Redirect to="/main"></Redirect>;
    if (this.state.id === 0) {
        loginPageRedirect = <Redirect to="/login"></Redirect>;
    }

    return (
      <div className="App">
        <header className="App-header">
          <Switch>
            <Route path="/login">
              <Login></Login>
            </Route>
            <Route path="/user">
            </Route>
            <Route path={["/main", "/"]}>
                <MainMenu>
                </MainMenu>
            </Route>
            {loginPageRedirect}
          </Switch>
        </header>
      </div>
    );
  }
}
