import React from 'react';
import './style.css';
import Backbutton from "../../assest/Style/Backbutton";
import ButtonBuy from "../../assest/Style/Navbutton";
import ConnectButton from "../../assest/Style/ConnectButton";
import CardBank from "./component/Card";
import Img1 from '../../assest/images/bank/FTM.png'
import Img2 from '../../assest/images/bank/Tomb.png'
import Img3 from '../../assest/images/bank/USDC.png'
import Img4 from '../../assest/images/bank/USDT.png'

const Bank = () =>{
    return(<>
        <div className={'recruit bank'}>
            <div className={'displayRecruit my-4'}>
                <div className={'row container recruitButton'}>
                    <div className={'col-4 text-center'}>
                        <Backbutton link={'/'} />
                    </div>
                    <div className={'col-4 text-center'}>
                        <ButtonBuy link={'/'} text={'bank'} />
                    </div>
                    <div className={'col-4 text-center'}>
                        <ConnectButton link={'/'} text={'connect wallet'} />
                    </div>
                </div>
            </div>
<div className={'container'}>
    <div className={'row'}>
<div className={'col-lg-3 col-md-4 col-sm-4 col-6'}>
    <CardBank Img={Img1} Rs={"ftm"} pool={'FTM POOl'} earn={'ftm earned'}/>
</div>
        <div className={'col-lg-3 col-md-4 col-sm-4 col-6'}>
    <CardBank Img={Img2} Rs={"Tomb"} pool={'Tomb Pool'} earn={'tomb earned'}/>
</div>
        <div className={'col-lg-3 col-md-4 col-sm-4 col-6'}>
    <CardBank Img={Img3} Rs={"usdc"} pool={'usdc pool'} earn={'usdc earned'}/>
</div><div className={'col-lg-3 col-md-4 col-sm-4 col-6'}>
    <CardBank Img={Img4} Rs={"usdt"} pool={'usdt'} earn={'usdt earned'}/>

</div>

    </div>
</div>

        </div>
    </>)
}
export default Bank;