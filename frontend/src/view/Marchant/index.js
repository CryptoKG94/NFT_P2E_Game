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

const Marchant = () => {
    let merchantList = [
        {
            id: 0,
            name: 'Portion',
            price: '20000',
            url: "images/potions.png",
        },
        {
            id: 1,
            name: 'Crossbow',
            price: '25000',
            url: "images/crossbow.png",
        },
        {
            id: 2,
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

    const handleBuyPortions = async () => {
        if (!account) {
            setShowToast(true);
            setToastMessage("Please connect wallet");
            setToastType(2);
            return;
        }

        if (!isApproved) {
            try {
                setRequestedApproval(true);
                await ContractUtils.setApprovalForAll(library, account);
                setIsApproved(true);
                setRequestedApproval(false);
            } catch {
                console.log('Approve failed');
                setRequestedApproval(false);
            }
        } else {
            try {
                setRequestedApproval(true);
                await ContractUtils.buyPortions(library, account, selectedUnStakedTokenIds);
                setRequestedApproval(false)
                setFetchFlag(true)
            } catch {
                console.log('Stake failed')
                setRequestedApproval(false)
            }
        }
    }

    return (<>
        <div className={'recruit merchent'}>
            <div className={'displayRecruit mt-4'}>
                <div className={'row container recruitButton'}>
                    <div className={'col-4 text-center'}>
                        <Backbutton link={'/'} />
                    </div>
                    <div className={'col-4 text-center'}>
                        <ButtonBuy link={'/'} text={'Merchant'} />
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
                                    return <CardMerchant merchant={item} />
                                })
                            }
                            {/* <div className={'col-lg-4 col-md-4 col-sm-4 col-6'}>
                        <CardMerchant/>
                    </div>

                    <div className={'col-lg-4 col-md-4 col-sm-4 col-6'}>
                        <CardMerchant/>
                    </div>

                    <div className={'col-lg-4 col-md-4 col-sm-4 col-6'}>
                        <CardMerchant/>
                    </div> */}
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