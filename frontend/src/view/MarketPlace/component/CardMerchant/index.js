import React, { useState } from 'react';
import './style.css';
import Img from '../../../../assest/images/img1.png'
import ButtonBuy from '../../../../assest/Style/ButtonBuy';
const Web3 = require("web3");

const CardMarket = ({
    tokenId,
    isOwner,
    nftInfo,
    saleInfo,
    destroy,
    auction,
    confirm,
    isApprovedForYen
}) => {
    const startPrice = Web3.utils.fromWei("" + saleInfo.startPrice);
    const maxBid = Web3.utils.fromWei("" + saleInfo.maxBid);

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
                    {`${nftInfo.isRonin ? 'Ronin' : 'Samurai'}  ${tokenId}`}
                </div>
            </div>
            <div className={'highOffer'}>
                <div className={'priceOffer'}>
                    {`${maxBid} Yen`}
                    <span className={'spanOffer'}>(highest offer)</span></div>
                <div>{`${startPrice} Yen`}</div>
            </div>
            {
                !isOwner ?
                    <div className="button-group">
                        <input type={'number'}
                            className={'InputCheck'}
                            onChange={handleChangeAmount}
                            value={bidPrice}
                        />
                        <ButtonBuy func={() => auction(tokenId, bidPrice)} text={!isApprovedForYen ? 'Approve Yen' : 'Offer'} />
                    </div>
                    :
                    <div className="button-group mt-2">
                        <ButtonBuy func={() => confirm(tokenId)} text={'Confirm'} />
                        <ButtonBuy func={() => destroy(tokenId)} text={'Destroy'} />
                    </div>
            }
        </div>
    </>)
}
export default CardMarket;