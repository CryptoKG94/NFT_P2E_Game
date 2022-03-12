import React from 'react';

import './style.css';
import Navbar from "../Navbar";
import Home from "./component/home";
import Backbutton from "../../assest/Style/Backbutton";
import ButtonBuy from "../../assest/Style/Navbutton";
import ConnectButton from "../../assest/Style/ConnectButton";
import Img from "../../assest/images/img1.png";
import Img1 from "../../assest/images/img2.png";
import {Link} from "react-router-dom";

const List = ({text}) =>{
    return(
        <div className={'mainBar mt-2'}>
            <div className={'statistic'}>{text}. oxaoaf...4012</div>
            <div className={'statistic'}>30,000,234 yen</div>
        </div>
    )
}

const Dashboard = () =>{
    return(<>
        <div className={'mainDashboard dashboard'}>
            <div className={'displayRecruit mt-4'}>
                <div className={'row container recruitButton'}>
                    <div className={'col-4 text-center'}>
                        <Backbutton link={'/'} />
                    </div>
                    <div className={'col-4 text-center'}>
                        <ButtonBuy link={'/'} text={'Dashboard'} />
                    </div>
                    <div className={'col-4 text-center some'}>
                        <ConnectButton link={'/'} text={''} />
                    </div>
                </div>
            </div>
            <div className={'container'}>
                <div className={'blackGlass mt-5'}>
<div className={'mainBar'}>
    <Link to={'/static'} className={'statistic'}>Statistic</Link>
    <div className={'statistic'}>Leaderboard</div>
</div>

                    <div className={'mainBar mt-5'}>
                        <div className={'statistic'}>1. oxaoaf...4012</div>
                        <div className={'statistic'}>30,000,234 yen</div>
                    </div>
                    <List text={2}/>
                    <List text={3}/>
                    <List text={4}/>
                    <List text={5}/>
                    <List text={6}/>
                    <List text={7}/>
                    <List text={8}/>
                    <List text={9}/>
                    <List text={10}/>
                    <List text={11}/>
                    <List text={12}/>
                    <List text={13}/>
                </div>

            </div>


        </div>
        </>)
}

export default Dashboard;