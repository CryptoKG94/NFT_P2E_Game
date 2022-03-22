import React, { useState } from 'react';
import { Paper, Button, Tabs, Box, Grid, FormControl, OutlinedInput, InputAdornment, Typography } from "@material-ui/core";
import './style.css';


const CardMerchant = ({merchant, modalButton}) =>{
    const [merchantPrice, setMerchantPrice] = useState(0)

    const handleChangeAmount = (e) => {
        setMerchantPrice(Number(e.target.value));
    }

    console.log("merchant:", merchant);
    return(
        <div className = {'CardMerchant col-lg-4 col-md-4 col-sm-6 col-6 mx-auto'} style={{width: "300px"}}>
            <div className={'CardMarchantLogo'}>
                <img width={180} src={merchant.url} alt={'/'} />
            </div>
            <div className={'bottomBackground'}>
                <div className={'Character'}>
                    { merchant.name }
                </div>
                <div className={'MarchantPrice'}>
                    {'Price: ' + merchant.price+'YEN'}
                </div>
            </div>
            <div className={'MarchantPrice'}>
                <div className={'button-group'}>
                    <div className={'MarchantPrice'}>
                        Amount: 
                    </div>
                    <input type={'number'}
                        className={'InputCheck'}
                        onChange={handleChangeAmount}
                        value={merchantPrice}
                    />
                </div>
                {modalButton[merchant.id]}
                {/* <Button variant="text" onClick={handleBuyPortions}>
                    buy now
                </Button> */}
            </div>
        </div>
    );
}

export default CardMerchant;