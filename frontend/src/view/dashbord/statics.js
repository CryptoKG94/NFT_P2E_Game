import React from 'react';

import './style.css';
import Navbar from "../Navbar";
import Home from "./component/home";
import Backbutton from "../../assest/Style/Backbutton";
import ButtonBuy from "../../assest/Style/Navbutton";
import ConnectButton from "../../assest/Style/ConnectButton";
import Img from "../../assest/images/img1.png";
import Img1 from "../../assest/images/img2.png";


const statics = () => {
	return (
		<>
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
							<div className={'statistic'}>Statistic</div>
							<div className={'statistic'}>Leaderboard</div>
						</div>

						<div className={'mainBar mt-5'}>
							<div className={'statistic'}>
								<div>RONIN MINTED</div>
								<div className={'subTitle'}>30,0000</div>
							</div>
							<div className={'statistic'}>
								<div>SAMURAI MINTED</div>
								<div className={'subTitle'}>14,0000</div>
							</div>
						</div>
						<div className={'mainBar mt-2'}>
							<div className={'statistic'}>
								<div>RONIN STAKED</div>
								<div className={'subTitle'}>23,0000</div>
							</div>
							<div className={'statistic'}>
								<div>SAMURAI STOLEN</div>
								<div className={'subTitle'}>7,0000</div>
							</div>
						</div>
						<div className={'mainBar mt-2'}>
							<div className={'statistic'}>
								<div>SAMURAI STAKED</div>
								<div className={'subTitle'}>7,0000</div>
							</div>
							<div className={'statistic'}>
								<div>SAMURAI STOLEN</div>
								<div className={'subTitle'}>5,0000</div>
							</div>
						</div>
						<div className={'mainBar mt-2'}>
							<div className={'statistic'}>
								<div>TOTAL YEN CLAIMED</div>
								<div className={'subTitle'}>2,30,0000</div>
							</div>
							<div className={'statistic'}>
								<div>TOTAL YEN BURNED</div>
								<div className={'subTitle'}>1,14,0000</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default statics;