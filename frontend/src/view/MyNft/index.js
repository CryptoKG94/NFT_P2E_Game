import React, { useEffect, useState } from 'react';
import './style.css';
import Backbutton from "../../assest/Style/Backbutton";
import ButtonBuy from "../../assest/Style/Navbutton";
import ConnectButton from "../../assest/Style/ConnectButton";
import CardMarket from "./component/CardMerchant";
import BigNumber from 'bignumber.js';
import { useWeb3React } from '@web3-react/core';
import ContractUtils from '../../utils/contractUtils';
import { useHistory } from 'react-router-dom';

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
        const isApp = await ContractUtils.isApprovedForAll(library, account);
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
                        <ConnectButton link={'/'} text={'connect wallet'} />
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
                                    <CardMarket nft={item} tokenId={tokenId} />
                                </div>
                            )
                        })
                    }
                </div>
            </div>

        </div>
    </>)
}
export default MyNft;