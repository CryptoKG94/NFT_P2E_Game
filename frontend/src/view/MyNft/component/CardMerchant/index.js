import React from 'react';
import './style.css';
import Img from '../../../../assest/images/img1.png'
import ButtonBuy from '../../../../assest/Style/ButtonBuy';
const CardMarket = (nft) => {
    console.log(nft);
    const handleOnSale = () => {

    }

    return (<>
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
            {/* <button type='button' onClick={handleOnSale} className='btn btn-danger buttonSale'>
                On Sale
            </button> */}
            <ButtonBuy func={handleOnSale} text={'On Sale'}/>

        </div>
    </>)
}
export default CardMarket;