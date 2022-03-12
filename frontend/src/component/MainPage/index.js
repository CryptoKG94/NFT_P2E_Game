import React from 'react';

import './style.css';
import Navbar from "../Navbar";
import Home from "./component/home";

const MainPage = () =>{
    return(<>
        <div className={'dashboard'}>
<Navbar/>
            <Home/>

        </div>
        </>)
}

export default MainPage;