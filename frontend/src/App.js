import React from 'react';
import './App.css';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link, Redirect
} from "react-router-dom";
import Dashbord from "./view/dashbord";
import ScrollToTop from "./utils/ScrollToTop";
import Recruit from "./view/Recruit";
import Marchant from "./view/Marchant";
import Stake from "./view/Stake";
import Bank from "./view/bank";
import MarcketPlace from "./view/MarketPlace";
import MainPage from "./view/MainPage";
import MyNft from "./view/MyNft";
import statics from "./view/dashbord/statics";


function App() {
  return (
      <div className="app">
          <Router>
              <ScrollToTop/>
              <Switch>
                  <Route path="/" exact component={MainPage} />
                  <Route path="/dashboard" exact component={statics} />
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
