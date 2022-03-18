import React, { useEffect, useState } from 'react';
import './style.css';
import Backbutton from "../../assest/Style/Backbutton";
import ButtonLink from "../../assest/Style/ButtonLink";
import ButtonNav from "../../assest/Style/Navbutton";
import ConnectButton from "../../assest/Style/ConnectButton";
import CardMarket from "./component/CardMerchant";
import NavbarSelector from "./component/Navbar";
import BigNumber from 'bignumber.js';
import { useWeb3React } from '@web3-react/core';
import ContractUtils from '../../utils/contractUtils';
import { useHistory } from 'react-router-dom';
import { SUCCESS, WARNNING } from '../../utils/Constants';
import Toast from '../../components/Toast';

const initNFTInfo = {
    balance: new BigNumber(0),
    tokenIds: [],
    metadatas: [],
}

const MarcketPlace = () => {
    const { account, library } = useWeb3React();
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState("")
    const [toastType, setToastType] = useState(2) //1: success, 2: error
    const [isApproved, setIsApproved] = useState(false);
    const [nftInfo, setNFTInfo] = useState();
    const [fetchFlag, setFetchFlag] = useState(true);

    const history = useHistory();

    function handleClick() {
        history.push("/marketplace");
    }


    useEffect(() => {
        if (fetchFlag && account) {
            console.log('fetchFlag:  TRUE')
            fetchIsApprovedForAll()
            fetchNFTInfo()
            setFetchFlag(false)
        }
    }, [account, fetchFlag])

    const fetchIsApprovedForAll = async () => {
        const isApp = await ContractUtils.isApprovedForAllToMarket(library, account);
        setIsApproved(isApp.success);
    }

    const fetchNFTInfo = async () => {

        let nfts = initNFTInfo;
        if (account) {
            const res = await ContractUtils.fetchMarketplaceInfo(library)

            if (res.success) {
                nfts.balance = res.status.balances;
                nfts.tokenIds = res.status.tokenIds.slice();
                nfts.metadatas = res.status.metadatas.slice();
                setNFTInfo(nfts);
            }
        }
    }

    const handleDestroySale = async (tokenId) => {
        if (account) {
            const res = await ContractUtils.destroySale(library, account, tokenId);
            if (res.success) {
                onToastOpen(SUCCESS, "Destroy sale Successfully!");
            } else {
                onToastOpen(WARNNING, res.status);
            }
        }
    }

    const handleAuction = async (tokenId, bidPrice) => {
        if (account) {
            const res = await ContractUtils.auction(library, account, tokenId, bidPrice);
            if (res.success) {
                onToastOpen(SUCCESS, "Auction Successfully!");
            } else {
                onToastOpen(WARNNING, res.status);
            }
        }
    }

    const handleConfirm = async (tokenId) => {
        if (account) {
            const res = await ContractUtils.confirm(library, account, tokenId);
            if (res.success) {
                onToastOpen(SUCCESS, "Saled Successfully!");
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
                        <Backbutton link={'/'} />
                    </div>
                    <div className={'col-4 text-center'}>
                        <ButtonNav link={'/'} text={'Marketplace'} />
                    </div>
                    <div className={'col-4 text-center'}>
                        <ButtonLink link={'/mynft'} text={'my nft'} />
                        <ConnectButton link={'/'} text={'connect wallet'} />
                    </div>

                </div>
            </div>
            <div className={'navbarSelect container'}>
                <div className={'row'}>
                    <div className={'col-2'}>
                        <NavbarSelector text={'floor price'} price={"$55"} />
                    </div> <div className={'col-2'}>
                        <NavbarSelector text={'Highest Sale price'} price={"$55"} />
                    </div> <div className={'col-2'}>
                        <NavbarSelector text={'Total sale volume'} price={"$55"} />
                    </div> <div className={'col-4'}>
                        <NavbarSelector text={'Price (lowest to highest)'} />
                    </div> <div className={'col-2'}>
                        <NavbarSelector text={'filter '} />
                    </div>
                </div>

            </div>
            <div className={'container'}>
                <div className={'row'}>
                    {
                        nftInfo && nftInfo.tokenIds && nftInfo.tokenIds.map((tokenId, idx) => {
                            const item = nftInfo.metadatas[idx];
                            return (
                                <div className={'col-lg-3 col-md-4 col-sm-4 col-6'}>
                                    <CardMarket nft={item} tokenId={tokenId} destroy={handleDestroySale} auction={handleAuction} confirm={handleConfirm} />
                                </div>
                            )
                        })
                    }
                </div>
            </div>
            <Toast
                open={showToast}
                message={toastMessage}
                handleClose={onToastClose}
                type={toastType}
            />
        </div>
    </>)
}
export default MarcketPlace;