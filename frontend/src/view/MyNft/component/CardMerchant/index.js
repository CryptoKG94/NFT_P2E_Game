import React, {useState} from 'react';
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
            <ButtonBuy func={() => handleOnSale(tokenId, startPrice)} text={isApproved ? 'On Sale' : 'Approve'}/>

        </div>
    </>)
}
export default CardMarket;