import React, { useEffect, useState } from 'react';
import './style.css';
import Backbutton from "../../assest/Style/Backbutton";
import ButtonBuy from "../../assest/Style/Navbutton";
import ConnectButton from "../../assest/Style/ConnectButton";
import CardNFT from "./component/CardMerchant";
import BigNumber from 'bignumber.js';
import { useWeb3React } from '@web3-react/core';
import ContractUtils from '../../utils/contractUtils';
import { useHistory } from 'react-router-dom';
import { SUCCESS, WARNNING } from '../../utils/Constants';
import Toast from '../../components/Toast';
import Loading from '../../components/Loading';

const initNFTInfo = {
    balance: new BigNumber(0),
    tokenIds: [],
    metadatas: [],
}

const MyNft = () => {
    const { account, library } = useWeb3React();
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState("")
    const [toastType, setToastType] = useState(2) //1: success, 2: error
    const [isApproved, setIsApproved] = useState(false);
    const [nftInfo, setNFTInfo] = useState();
    const [fetchFlag, setFetchFlag] = useState(true);
    const [loading, setLoading] = useState(false);

    const history = useHistory();

    function handleClick() {
        history.push("/marketplace");
    }


    useEffect(async () => {
        if (fetchFlag && account) {
            // console.log('fetchFlag:  TRUE')
            setLoading(true);
            await fetchIsApprovedForAll();
            await fetchNFTInfo();
            setFetchFlag(false);
            setLoading(false);
        }
    }, [account, fetchFlag])

    const fetchIsApprovedForAll = async () => {
        const isApp = await ContractUtils.isApprovedForAllToMarket(library, account);
        setIsApproved(isApp.success);
    }

    const fetchNFTInfo = async () => {

        let nfts = initNFTInfo;
        if (account) {
            const res = await ContractUtils.fetchUnstakedInfo(library, account)

            if (res.success) {
                nfts.balance = res.status.balances;
                nfts.tokenIds = res.status.tokenIds.slice();
                nfts.metadatas = res.status.metadatas.slice();
                setNFTInfo(nfts);
            }
        }
    }

    const handleOnSale = async (tokenId, startPrice) => {
        if (!account) {
            onToastOpen(WARNNING, "Please connect wallet!");
            return;
        }

        if (!isApproved) {
            let res = await ContractUtils.setApprovalForAllToMarket(library, account);
                
            if (res.success) {
                setIsApproved(true);
                onToastOpen(SUCCESS, "Approved Successfully!");
            } else {
                onToastOpen(WARNNING, res.status);
            }
        } else {
            const res = await ContractUtils.onSale(library, account, tokenId, startPrice);
            if (res.success) {
                setFetchFlag(true);
                onToastOpen(SUCCESS, "On saled Successfully!");
            } else {
                onToastOpen(WARNNING, res.status);
            }
        }
    }

    const onToastOpen = (type, msg) => {
        setShowToast(true);
        setToastMessage(msg);
        setToastType(type);
    }

    const onToastClose = () => {
        setShowToast(false);
    }

    return (<>
        <div className={'recruit marketPlace'}>
            <div className={'displayRecruit my-4'}>
                <div className={'row container recruitButton'}>
                    <div className={'col-3 text-center'}>
                        <Backbutton link={'/marketplace'} />
                    </div>
                    <div className={'col-4 text-center'}>
                        <ButtonBuy link={'/'} text={'My Nft'} />
                    </div>

                    <div className={'col-4 text-center'}>
                        <ConnectButton link={'/'} text={'Connect wallet'} />
                    </div>

                </div>
            </div>

            <div className={'container'}>
                <div className={'collections'}>collections</div>
                <div className={'row'}>
                    {
                        nftInfo && nftInfo.tokenIds && nftInfo.tokenIds.map((tokenId, idx) => {
                            const item = nftInfo.metadatas[idx];
                            return (
                                <div className={'col-lg-3 col-md-4 col-sm-4 col-6'}>
                                    <CardNFT nft={item} tokenId={tokenId} callback={handleOnSale} isApproved={isApproved} />
                                </div>
                            )
                        })
                    }
                </div>
            </div>
            <Loading
                open={loading}
            />
            <Toast
                open={showToast}
                message={toastMessage}
                handleClose={onToastClose}
                type={toastType}
            />
        </div>
    </>)
}
export default MyNft;