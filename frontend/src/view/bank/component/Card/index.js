import React, { useEffect, useState } from 'react';
import './style.css';

const CardBank = ({item, onDeposit}) =>{
    const [amountYEN, setAmountYEN] = useState(0);
    return(<>
        <div className={'CardBank '}>
            <div className={'CardBankTitle'}>
                {item.name + ' POOL'}
            </div>
            <div className={'CardbankLogo'}>
                <img width={80} src={item.img} alt={'/'} />
                <div className={'harvest'}>
                    harvest
                </div>
            </div>
            <div className={'countBank'}>
                <h1>0.00000000</h1>
                <p> {item.name + ' earned'} </p>
            </div>

            <div className={'buttonBank'}>
                <div className={'buttonLp'}>unstake {item.name}</div>
                <div className={'buttonLp m-2 p-2'} onClick={e=> onDeposit(item.id, amountYEN)}>+</div>
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