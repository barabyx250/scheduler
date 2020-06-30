import React from "react";
import "./App.css";
import { Login } from "./components/login/Login";
import "antd/dist/antd.css";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAccount, AccountState } from "./redux/slicers/accountSlice";
import { Site } from "./components/site/Site";

function App() {
  return (
    <Router>
        <Site>
            
        </Site>
    </Router>
    // <Router>
    //     <div className="App">
    //         <header className="App-header">
    //             <Switch>
    //                 <Route path="/login">
    //                     <Login></Login>
    //                 </Route>
    //                 {account.id === 0 ? <Redirect from="/" to="/login" /> : <br/>}
    //             </Switch>
    //         </header>
    //     </div>
    // </Router>
  );
}

export default App;
