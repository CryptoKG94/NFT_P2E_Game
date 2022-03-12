import React from 'react';
import './style.css';
import Img from '../../../../assest/images/img1.png'
const CardMerchant = () =>{
    return(<>
        <div className={'CardMerchant '}>
            <div className={'CardMarchantLogo'}>
                <img width={180} src={Img} alt={'/'} />

            </div>
<div className={'bottomBackground'}>
     <div className={'Character'}>
         Name of character
     </div>
    <div className={'oufit'}>
        Oufit
    </div>
</div>
            <div className={'MarchantPrice'}>
                <div>1,200 yen</div>
                <div>buy now</div>
            </div>


        </div>
    </>)
}
export default CardMerchant;