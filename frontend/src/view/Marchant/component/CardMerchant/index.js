import React from 'react';
import './style.css';
import Img from '../../../../assest/images/img1.png'


const CardMerchant = ({merchant}) =>{
    return(
        <div className = {'CardMerchant col-lg-4 col-md-4 col-sm-6 col-6 mx-auto'} style={{width: "300px"}}>
            <div className={'CardMarchantLogo'}>
                <img width={180} src={merchant.url} alt={'/'} />
            </div>
            <div className={'bottomBackground'}>
                <div className={'Character'}>
                    { merchant.name }
                </div>
                <div className={'oufit'}>
                    Oufit
                </div>
            </div>
            <div className={'MarchantPrice'}>
                <div>
                    {'Price: ' + merchant.price+'YEN'}
                </div>
                <div>buy now</div>
            </div>
        </div>
    );
}

export default CardMerchant;