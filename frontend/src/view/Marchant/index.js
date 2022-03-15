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
    const [isApproved, setIsApproved] = useState(false)
    const [fetchFlag, setFetchFlag] = useState(true)

    const fetchIsApprovedForYEN = async () => {
        const isApp = await ContractUtils.isApprovedForYEN(library, account);
        setIsApproved(isApp.success);
    }

    useEffect(() => {
        if (fetchFlag && account) {
            console.log('fetchFlag:  TRUE')
            fetchIsApprovedForYEN()
            // fetchUnStakedInfo()
            // fetchStakedInfo()
            setFetchFlag(false)
        }
        // if (account) fetchReward()
    }, [account, fetchFlag])

    const handleBuyPortions = async () => {
        console.log("handleBuyPortions");
        if (!account) {
            setShowToast(true);
            setToastMessage("Please connect wallet");
            setToastType(2);
            return;
        }

        if (!isApproved) {
            try {
                setRequestedApproval(true);
                await ContractUtils.setApprovalForYEN(library, account);
                setIsApproved(true);
                setRequestedApproval(false);
            } catch {
                console.log('Approve failed');
                setRequestedApproval(false);
            }
        } else {
            try {
                
                setRequestedApproval(true);
                await ContractUtils.buyPortions(library, account);
                setRequestedApproval(false)
                setFetchFlag(true)
                console.log("Success buy portion");
            } catch {
                console.log('Stake failed')
                setRequestedApproval(false)
            }
        }
    }

    const onSeekApproval = async token => {
        // await dispatch(changeApproval({ address, provider, networkID: chainID }));
        setRequestedApproval(true);
        await ContractUtils.setApprovalForYEN(library, account);
        setIsApproved(true);
    };

    let modalButton = [];

    modalButton.push(
        <Button
          className="stake-button"
          variant="contained"
          color="primary"
        //   disabled={isPendingTxn(pendingTransactions, "approve_presale")}
          onClick={() => {
            onSeekApproval();
          }}
        >
          {/* {txnButtonText(pendingTransactions, "approve_presale", "Approve")} */}
          Approve
        </Button>
    )

    modalButton.push(
        <Button
          className="stake-button"
          variant="contained"
          color="primary"
        //   disabled={isPendingTxn(pendingTransactions, "approve_presale")}
          onClick={() => {
            handleBuyPortions();
          }}
        >
          {/* {txnButtonText(pendingTransactions, "approve_presale", "Approve")} */}
          Buy Portion
        </Button>
    )

    modalButton.push(
        <Button
          className="stake-button"
          variant="contained"
          color="primary"
        //   disabled={isPendingTxn(pendingTransactions, "approve_presale")}
          onClick={() => {
            handleBuyPortions();
          }}
        >
          {/* {txnButtonText(pendingTransactions, "approve_presale", "Approve")} */}
          Buy Crossbow
        </Button>
    )

    modalButton.push(
        <Button
          className="stake-button"
          variant="contained"
          color="primary"
        //   disabled={isPendingTxn(pendingTransactions, "approve_presale")}
          onClick={() => {
            handleBuyPortions();
          }}
        >
          {/* {txnButtonText(pendingTransactions, "approve_presale", "Approve")} */}
          Buy Shield
        </Button>
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
                                            handleBuyPortions={handleBuyPortions}
                                            modalButton={modalButton}
                                            />
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