import React from 'react';
import './style.css';
import Img from '../../../../assest/images/img1.png'
const CardBank = () =>{
    return(<>
        <div className={'CardBank '}>
<div className={'CardBankTitle'}>
    Minecraft Mods
</div>
            <div className={'CardbankLogo'}>
                <img width={80} src={Img} alt={'/'} />
                <div className={'harvest'}>
                    harvest
                </div>
            </div>
            <div className={'countBank'}>
                <h1>0.00000000</h1>
                <p>minecraft</p>
            </div>

            <div className={'buttonBank'}>
                <div className={'buttonLp'}>unstake bribe - wavax lp</div>
                <div className={'buttonLp m-2 p-2'}>+</div>
            </div>

            <div className={'Apr'}>
                <div>apr:</div>
                <div>250.14%</div>
            </div>
            <div className={'Apr'}>
                <div>apr:</div>
                <div>250.14%</div>
            </div>

        </div>
    </>)
}
export default CardBank;