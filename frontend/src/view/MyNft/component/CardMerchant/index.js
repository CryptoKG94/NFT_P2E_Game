import React, { useState } from 'react';
import './style.css';
import Img from '../../../../assest/images/img1.png'
import ButtonBuy from '../../../../assest/Style/ButtonBuy';
const CardMarket = (props) => {
    console.log(props.nft);
    const nft = props.nft;
    const handleOnSale = props.callback;
    const tokenId = props.tokenId;
    const isApproved = props.isApproved;

    const [startPrice, setStartPrice] = useState(0);
    const handleChangeAmount = (e) => {
        setStartPrice(Number(e.target.value));
    }

    return (<>
        <div className={'CardMarket'}>
            <div className={'CardMarchantLogo'}>
                <img width={200} src={Img} alt={'/'} />
            </div>
            <div className={''}>
                <div className={'sumari'}>
                    {`${nft.isRonin ? 'Ronin' : 'Samurai'} ${tokenId}`}
                </div>
            </div>
            <div className='button-group'>
                <div>
                    <input type={'number'}
                        className={'InputField'}
                        onChange={handleChangeAmount}
                        value={startPrice}
                        id={'onsale-price'}
                    />
                    <label htmlFor='onsale-price' className='onsale-price'>(YEN)</label>
                </div>
                <ButtonBuy func={() => handleOnSale(tokenId, startPrice)} text={isApproved ? 'On Sale' : 'Approve'} />
            </div>

        </div>
    </>)
}
export default CardMarket;