import React, { useEffect, useState } from 'react';
import './style.css';
import Backbutton from "../../assest/Style/Backbutton";
import ButtonLink from "../../assest/Style/ButtonLink";
import ButtonNav from "../../assest/Style/Navbutton";
import ConnectButton from "../../assest/Style/ConnectButton";
import CardMarket from "./component/CardMarket";
import NavbarSelector from "./component/Navbar";
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
    saleInfo: [],
    nftInfo: []
}

const MarcketPlace = () => {
    const { account, library } = useWeb3React();
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState("")
    const [toastType, setToastType] = useState(2) //1: success, 2: error
    const [isApproved, setIsApproved] = useState(false);
    const [isApprovedForYen, setIsApprovedForYen] = useState(false);
    const [nftInfo, setNFTInfo] = useState();
    const [fetchFlag, setFetchFlag] = useState(true);
    const [loading, setLoading] = useState(false);
    const [floorPrice, setFloorPrice] = useState(0);
    const [highPrice, setHighPrice] = useState(0);
    const [totalSaleVolume, setTotalSaleVolume] = useState(0);
    const history = useHistory();

    function handleClick() {
        history.push("/marketplace");
    }
  
    const fetchIsApprovedForAll = async () => {
        const isApp = await ContractUtils.isApprovedForAllToMarket(library, account);
        setIsApproved(isApp.success);
    }

    const fetchIsApprovedForYen = async () => {
        const isApp = await ContractUtils.isApprovedForYENToMarketplace(library, account);
        setIsApprovedForYen(isApp.success);
    }

    const fetchNFTInfo = async () => {

        let nfts = initNFTInfo;
        if (account) {
            const res = await ContractUtils.fetchMarketplaceInfo(library)

            if (res.success) {
                nfts.balance = res.status.balances;
                nfts.tokenIds = res.status.tokenIds.slice();
                nfts.saleInfo = res.status.saleInfo.slice();
                nfts.nftInfo = res.status.nftInfo.slice();
                setFloorPrice(res.status.floorPrice);
                setHighPrice(res.status.highPrice);
                setNFTInfo(nfts);
                setTotalSaleVolume(nfts.balance);
            }
        }
    }

    useEffect(async () => {
        if (fetchFlag && account) {
            console.log('fetchFlag:  TRUE');
            setLoading(true);
            await fetchIsApprovedForAll();
            await fetchIsApprovedForYen();
            await fetchNFTInfo();
            setFetchFlag(false);
            setLoading(false);
        }
    }, [account, fetchFlag])

    const handleDestroySale = async (tokenId) => {
        if (account) {
            const res = await ContractUtils.destroySale(library, account, tokenId);
            if (res.success) {
                onToastOpen(SUCCESS, "Destroy sale Successfully!");
                setFetchFlag(true);
            } else {
                onToastOpen(WARNNING, res.status);
            }
        }
    }

    const handleAuction = async (tokenId, bidPrice) => {
        if (!account) {
            onToastOpen(WARNNING, "Please connect wallet");
            return;
        }

        if (!isApprovedForYen) {
            const res = await ContractUtils.setApprovalForYENToMarketplace(library, account);
            setIsApprovedForYen(res.success);
        } else {
            const res = await ContractUtils.auction(library, account, tokenId, bidPrice);
            if (res.success) {
                onToastOpen(SUCCESS, "Auction Successfully!");
                setFetchFlag(true);
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
                setFetchFlag(true);
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
                        <NavbarSelector text={'floor price'} price={ floorPrice } />
                    </div> <div className={'col-2'}>
                        <NavbarSelector text={'Highest Sale price'} price={ highPrice } />
                    </div> <div className={'col-2'}>
                        <NavbarSelector text={'Total sale volume'} price={ totalSaleVolume } />
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
                            const nft = nftInfo.nftInfo[idx];
                            const saleInfo = nftInfo.saleInfo[idx];
                            const isOwner = saleInfo.currentOwner == account;
                            return (
                                <div className={'col-lg-3 col-md-4 col-sm-4 col-6'}>
                                    <CardMarket
                                        isOwner={isOwner}
                                        saleInfo={saleInfo}
                                        nftInfo={nft}
                                        tokenId={tokenId}
                                        destroy={handleDestroySale}
                                        auction={handleAuction}
                                        confirm={handleConfirm}
                                        isApprovedForYen={isApprovedForYen} />
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
export default MarcketPlace;