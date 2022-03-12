import React from 'react';
import './style.css';
import Img from '../../../../assest/images/img1.png'
const CardMarket = () =>{
    return(<>
        <div className={'CardMarket'}>
            <div className={'CardMarchantLogo'}>
                <img width={200} src={Img} alt={'/'} />

            </div>
<div className={''}>
     <div className={'sumari'}>
         Samurai #1125
     </div>
</div>
            <div className={'highOffer'}>
                <div className={'priceOffer'}>$30<span className={'spanOffer'}>(highest offer)</span></div>
                <div>$125</div>
            </div>


        </div>
    </>)
}
export default CardMarket;