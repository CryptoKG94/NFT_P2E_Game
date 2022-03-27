import React, { useState } from 'react';
import { Paper, Button, Tabs, Box, Grid, FormControl, OutlinedInput, InputAdornment, Typography } from "@material-ui/core";
import './style.css';


const CardMerchant = ({merchant, modalButton, amounts, onPlus, onMinus, data}) =>{

    let onBuy, amount;
    onBuy = modalButton;
    amount = amounts;
    console.log("Data = ", data);
    console.log("merchant:", merchant);

    let price, totalSupply, remainSupply;
    if (merchant.id == 0) {
        price = data.portionPrice;
        totalSupply = data.totalPortions;
        remainSupply = data.remainPortions;
    } else if (merchant.id == 1) {
        price = data.crossbowPrice_Ronin;
        totalSupply = data.totalCrossbows_Ronin;
        remainSupply = data.remainCrossbows_Ronin;
    } else if (merchant.id == 2) {
        price = data.crossbowPrice_SM;
        totalSupply = data.totalCrossbows_SM;
        remainSupply = data.remainCrossbows_SM;
    } else if (merchant.id == 3) {
        price = data.shieldPrice;
        totalSupply = data.totalShields;
        remainSupply = data.remainShields;
    } else {}

    return(
        <div className = {'CardMerchant col-lg-4 col-md-4 col-sm-6 col-6 mx-auto'} style={{width: "300px"}}>
            <div className={'portion'}>
                <div className={'totalPortion mb-3'}>
                    Total {merchant.name} : <input type={'text'} value={totalSupply} className={'inputPortion'}/>
                </div>
                <div className={'totalPortion'}>
                    Remain {merchant.name} : <input type={'text'} value={remainSupply} className={'inputPortion'}/>
                </div>
            </div>
            <div className={'CardMarchantLogo'}>
                <img width={180} src={merchant.url} alt={'/'} />
            </div>
            <div className={'bottomBackground'}>
                <div className={'Character'}>
                    { merchant.name }
                </div>
                <div className={'MarchantPrice'}>
                    {price+'YEN'}
                </div>
            </div>
            <div className={'MarchantPrice'}>
            <div>Buy Amount </div>
                <div className={'d-flex'}>
                    <div className={'btnplus'} onClick={e => onMinus(merchant.id)}>-</div>
                    <div className={'btnplus'} onClick={onBuy}>{amount}</div>
                    <div className={'btnplus'} onClick={ e => onPlus(merchant.id)}>+</div>
                </div>
            </div>
        </div>
    );
}

export default CardMerchant;