import React from 'react';
import './style.css';
import Backbutton from "../../assest/Style/Backbutton";
import ButtonBuy from "../../assest/Style/Navbutton";
import ConnectButton from "../../assest/Style/ConnectButton";
import CardBank from "../bank/component/Card";
import CardMerchant from "./component/CardMerchant";
import CardMarket from "./component/CardMerchant";
import NavbarSelector from "./component/Navbar";

const MyNft = () =>{
    return(<>
        <div className={'recruit marketPlace'}>
            <div className={'displayRecruit my-4'}>
                <div className={'row container recruitButton'}>
                    <div className={'col-3 text-center'}>
                        <Backbutton link={'/'} />
                    </div>
                    <div className={'col-4 text-center'}>
                        <ButtonBuy link={'/'} text={'My Nft'} />
                    </div>

                    <div className={'col-4 text-center'}>

                        <ConnectButton link={'/'} text={'connect wallet'} />
                    </div>

                </div>
            </div>

            <div className={'container'}>
                <div className={'collections'}>collections</div>
                <div className={'row'}>
                    <div className={'col-lg-3 col-md-4 col-sm-4 col-6'}>
                        <CardMarket/>

                    </div><div className={'col-lg-3 col-md-4 col-sm-4 col-6'}>
                    <CardMerchant/>

                </div><div className={'col-lg-3 col-md-4 col-sm-4 col-6'}>
                    <CardMerchant/>

                </div>
                    <div className={'col-lg-3 col-md-4 col-sm-4 col-6'}>
                    <CardMerchant/>
                </div>
                    <div className={'col-lg-3 col-md-4 col-sm-4 col-6'}>
                    <CardMerchant/>
                </div>
                </div>
            </div>

        </div>
    </>)
}
export default MyNft;