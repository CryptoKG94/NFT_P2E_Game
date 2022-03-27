import React, { useEffect, useState } from 'react';
import './style.css';
import Backbutton from "../../assest/Style/Backbutton";
import ButtonBuy from "../../assest/Style/Navbutton";
import ConnectButton from "../../assest/Style/ConnectButton";
import CardBank from "../bank/component/Card";
import CardMerchant from "./component/CardMerchant";
import { height } from '@mui/system';
import { useWeb3React } from '@web3-react/core';
import ContractUtils from '../../utils/contractUtils';
import Toast from '../../components/Toast';
import { Paper, Button, Tabs, Box, Grid, FormControl, OutlinedInput, InputAdornment, Typography } from "@material-ui/core";

const Initdata = {
    portionPrice: 0,
    totalPortions: 0,
    remainPortions: 0,

    crossbowPrice_Ronin: 0,
    totalCrossbows_Ronin: 0,
    remainCrossbows_Ronin: 0,

    crossbowPrice_SM: 0,
    totalCrossbows_SM: 0,
    remainCrossbows_SM: 0,

    shieldPrice: 0,
    totalShields: 0,
    remainShields: 0,
}

const Marchant = () => {
    let merchantList = [
        {
            id: 0,
            name: 'Portions',
            price: '20000',
            url: "images/potions.png",
        },
        {
            id: 1,
            name: 'Ronin Crossbow',
            price: '25000',
            url: "images/crossbow.png",
        },
        {
            id: 2,
            name: 'Samurai Crossbows',
            price: '25000',
            url: "images/crossbow.png",
        },
        {
            id: 3,
            name: 'Shield',
            price: '30000',
            url: "images/shield.png",
        }
    ];

    const { account, library } = useWeb3React();

    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState("")
    const [toastType, setToastType] = useState(2) //1: success, 2: error

    const [requestedApproval, setRequestedApproval] = useState(false)
    const [isApproved, setIsApproved] = useState(false)
    const [fetchFlag, setFetchFlag] = useState(true)
    const [amountPortion, setAmountPortion] = useState(0);
    const [amountCrossbowR, setAmountCrossbowR] = useState(0);
    const [amountCrossbowS, setAmountCrossbowS] = useState(0);
    const [amountShield, setAmountShield] = useState(0);
    const [data, setData] = useState(Initdata);

    const fetchisApprovedForYENToStaking = async () => {
        const isApp = await ContractUtils.isApprovedForYENToStaking(library, account);
        setIsApproved(isApp.success);
    }

    
    const getMerchantInfo = async () => {
        const res = await ContractUtils.getMerchantInfo(library);
        if (res.success) {
            setData(res.status);
        }
    }

    useEffect(() => {
        if (fetchFlag && account) {
            console.log('fetchFlag:  TRUE')
            fetchisApprovedForYENToStaking()
            // fetchUnStakedInfo()
            // fetchStakedInfo()
            getMerchantInfo()
            setFetchFlag(false)
        }
        // if (account) fetchReward()
    }, [account, fetchFlag])

   

    // useEffect( () => {
    //     if(fetchFlag && account) {
    //         getMerchantInfo();
    //     }
    // }, [account])


    const handlePlusEvent = async (id) => {
        if (id == 0) {
            setAmountPortion(amountPortion => amountPortion + 1);
        } else if (id == 1) {
            setAmountCrossbowR(amountCrossbowR => amountCrossbowR + 1);
        } else if (id == 2) {
            setAmountCrossbowS(amountCrossbowS => amountCrossbowS + 1);
        } else if (id == 3) {
            setAmountShield(amountShield => amountShield + 1);
        } else {}
    }

    const handleMinusEvent = async (id) => {
        if (id == 0) {
            if (amountPortion == 0) return;
            setAmountPortion(amountPortion => amountPortion - 1);
        } else if (id == 1) {
            if (amountCrossbowR == 0) return;
            setAmountCrossbowR(amountCrossbowR => amountCrossbowR - 1);
        } else if (id == 2) {
            if (amountCrossbowS == 0) return;
            setAmountCrossbowS(amountCrossbowS => amountCrossbowS - 1);
        } else if (id == 3) {
            if (amountShield == 0) return;
            setAmountShield(amountShield => amountShield - 1);
        } else {}
    }

    let amounts = [];
    amounts.push(amountPortion);
    amounts.push(amountCrossbowR);
    amounts.push(amountCrossbowS);
    amounts.push(amountShield);

    const handleBuyPortions = async () => {
        if (!account) {
            setShowToast(true);
            setToastMessage("Please connect wallet");
            setToastType(2);
            return;
        }

        try {
            setRequestedApproval(true);
            let res = await ContractUtils.buyPortions(library, account, amountPortion);
            setRequestedApproval(false)
            setFetchFlag(true)
            if (res.success) {
                setShowToast(true);
                setToastMessage("Buy Portion successfully");
                setToastType(1);
            } else {
                setShowToast(true);
                setToastMessage("Failed");
                setToastType(2);
            }
        } catch {
            console.log('Stake failed')
            setRequestedApproval(false)
        }
    }

    const handleBuyCrossbows = async (forRonin) => {
        if (!account) {
            setShowToast(true);
            setToastMessage("Please connect wallet");
            setToastType(2);
            return;
        }

        try {
            setRequestedApproval(true);
            let res = await ContractUtils.buyCrossbows(library, account, forRonin? amountCrossbowR: amountCrossbowS, forRonin);
            setRequestedApproval(false)
            setFetchFlag(true)
            if (res.success) {
                setShowToast(true);
                setToastMessage("Buy Crossbow successfully");
                setToastType(1);
            } else {
                setShowToast(true);
                setToastMessage("Failed");
                setToastType(2);
            }
        } catch {
            console.log('Stake failed')
            setRequestedApproval(false)
        }
    }

    const handleBuyShields = async () => {
        if (!account) {
            setShowToast(true);
            setToastMessage("Please connect wallet");
            setToastType(2);
            
            return;
        }

        try {
            setRequestedApproval(true);
            let res = await ContractUtils.buyShields(library, account, amountShield);
            setRequestedApproval(false)
            setFetchFlag(true)
            if (res.success) {
                setShowToast(true);
                setToastMessage("Buy Crossbow successfully");
                setToastType(1);
            } else {
                setShowToast(true);
                setToastMessage("Failed");
                setToastType(2);
            }
        } catch {
            console.log('Stake failed')
            setRequestedApproval(false)
        }
    }

    let modalButton = [];

    modalButton.push(
        handleBuyPortions
    )

    modalButton.push( () =>
        handleBuyCrossbows(true)
    )

    modalButton.push( () =>
        handleBuyCrossbows(false)
    )

    modalButton.push(
        handleBuyShields
    )

    const onToastClose = () => {
        setShowToast(false);
    }

    return (<>
        <div className={'recruit merchent'}>
            <div className={'displayRecruit mt-4'}>
                <div className={'row container recruitButton'}>
                    <div className={'col-4 text-center'}>
                        <Backbutton link={'/'} />
                    </div>
                    <div className={'col-4 text-center'}>
                        <Button className="buttonBuy">
                            Merchant
                        </Button>
                    </div>
                    <div className={'col-4 text-center'}>
                        <ConnectButton link={'/'} text={'connect wallet'} />
                    </div>
                </div>
            </div>

            <div className={'container'} style={{height: "90vh"}}>
                <div className="card-container">
                    <div className='sub-container'>
                        <div className={'row'}>
                            {
                                merchantList.map((item) => {
                                    return <CardMerchant merchant={item} 
                                            modalButton={modalButton[item.id]}
                                            amounts={amounts[item.id]}
                                            onPlus={handlePlusEvent}
                                            onMinus={handleMinusEvent}
                                            data={data}
                                            />
                                })
                            }
                        </div>
                    </div>
                </div>
            </div>

        </div>
        <Toast
            open={showToast}
            message={toastMessage}
            handleClose={onToastClose}
            type={toastType}
        />
    </>)
}

export default Marchant;