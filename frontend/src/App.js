import React from 'react';
import './App.css';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link, Redirect
} from "react-router-dom";
import Dashbord from "./component/dashbord";
import ScrollToTop from "./utils/ScrollToTop";
import Recruit from "./component/Recruit";
import Marchant from "./component/Marchant";
import Stake from "./component/Stake";
import Bank from "./component/bank";
import MarcketPlace from "./component/MarketPlace";
import MainPage from "./component/MainPage";
import MyNft from "./component/MyNft";
import statics from "./component/dashbord/statics";


function App() {
  return (
      <div className="app">
          <Router>
              <ScrollToTop/>
              <Switch>
                  <Route path="/" exact component={MainPage} />
                  <Route path="/dashboard" exact component={Dashbord} />
                  <Route path="/recruit" exact component={Recruit} />
                  <Route path="/stack" exact component={Stake} />
                  <Route path="/mynft" exact component={MyNft} />
                  <Route path="/bank" exact component={Bank} />
                  <Route path="/static" exact component={statics} />
                  <Route path="/merchant" exact component={Marchant} />
                  <Route path="/marketplace" exact component={MarcketPlace} />
                  <Redirect to={'/'} />
              </Switch>
          </Router>
      </div>
  );
}

export default App;
