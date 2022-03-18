import React, { useState } from 'react';
import './style.css';
import Img from '../../../../assest/images/img1.png'
import ButtonBuy from '../../../../assest/Style/ButtonBuy';
const CardMarket = (props) => {
    const tokenId = props.tokenId;
    const nft = props.nft;
    const destroy = props.destroy;
    const auction = props.auction;
    const confirm = props.confirm;

    const [bidPrice, setBidPrice] = useState(0);
    const handleChangeAmount = (e) => {
        setBidPrice(Number(e.target.value));
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
            <div className="button-group">
                <input type={'number'}
                    className={'InputCheck'}
                    onChange={handleChangeAmount}
                    value={bidPrice}
                />
                <ButtonBuy func={() => auction(tokenId, bidPrice)} text={'Offer'} />
            </div>
            <div className="button-group mt-2">
                <ButtonBuy func={() => confirm(tokenId)} text={'Confirm'} />
                <ButtonBuy func={() => destroy(tokenId)} text={'Destroy'} />
            </div>
        </div>
    </>)
}
export default CardMarket;