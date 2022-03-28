import React from 'react';
import './style.css';
const CardBank = ({Img,Rs,pool,earn}) =>{
    return(<>
        <div className={'CardBank '}>
<div className={'CardBankTitle'}>
    {pool}
</div>
            <div className={'CardbankLogo'}>
                <img width={80} src={Img} alt={'/'} />
                <div className={'harvest'}>
                    harvest
                </div>
            </div>
            <div className={'countBank'}>
                <h1>0.00000000</h1>
                <p>{earn}</p>
            </div>

            <div className={'buttonBank'}>
                <div className={'buttonLp'}>unstake {Rs}</div>
                <div className={'buttonLp m-2 p-2'}>+</div>
            </div>

            <div className={'Apr'}>
                <div>apy:</div>
                <div>250.14%</div>
            </div>
            <div className={'Apr'}>
                <div>your stake:</div>
                <div>250.14%</div>
            </div>

        </div>
    </>)
}
export default CardBank;