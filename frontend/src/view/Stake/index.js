import React, { useEffect, useState } from 'react';
import './style.css';
import Backbutton from "../../assest/Style/Backbutton";
import ButtonBuy from "../../assest/Style/Navbutton";
import ConnectButton from "../../assest/Style/ConnectButton";
import Img from '../../assest/images/6.png';
import { mintNFT, getNFTInfo } from '../../store/actions/thunks';
import { Button } from '@mui/material';
import { useDispatch } from 'react-redux';
import { useWeb3React } from '@web3-react/core';
import BigNumber from 'bignumber.js'
import ContractUtils from '../../utils/contractUtils';
import { getFullDisplayBalance } from '../../components/formatBalance';
import Toast from '../../components/Toast';

const STAKETAB = 1;
const UNSTAKETAB = 2;

const initStakedInfo = {
    balance: new BigNumber(0),
    tokenIds: [],
    metadatas: [],
}

const initUnStakedInfo = {
    balance: new BigNumber(0),
    tokenIds: [],
    metadatas: [],
}

const Stake = () => {
    const dispatch = useDispatch();
    const [tabStatus, setTabStatus] = useState(STAKETAB);
    const { account, library } = useWeb3React();
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState("")
    const [toastType, setToastType] = useState(2) //1: success, 2: error

    const [requestedApproval, setRequestedApproval] = useState(false)
    const [isApproved, setIsApproved] = useState(false)

    const [fetchFlag, setFetchFlag] = useState(true)
    const [redraw, setRedraw] = useState(false)

    const [unstakedInfo, setUnStakedInfo] = useState()
    const [stakedInfo, setStakedInfo] = useState()

    const [reward, setReward] = useState(new BigNumber(0))

    const [selectedUnStakedTokenIds, setSelectedUnStakedTokenIds] = useState([]);
    const [selectedStakedTokenIds, setSelectedStakedTokenIds] = useState([]);

    const fetchIsApprovedForAll = async () => {
        const isApp = await ContractUtils.isApprovedForAll(library, account);
        setIsApproved(isApp.success);
    }

    useEffect(() => {
        if (fetchFlag && account) {
            console.log('fetchFlag:  TRUE')
            fetchIsApprovedForAll()
            fetchUnStakedInfo()
            fetchStakedInfo()
            setFetchFlag(false)
        }
        // if (account) fetchReward()
    }, [account, fetchFlag])

    const fetchReward = async () => {
        const result = await ContractUtils.fetchStakingReward(library, account);
        if (result.success) {
            setReward(getFullDisplayBalance(new BigNumber(result.status)))
        }
    }

    async function fetchUnStakedInfo() {

        let unstaked = initUnStakedInfo;
        if (account) {
            const res = await ContractUtils.fetchUnStakedInfo(library, account)

            if (res.success) {
                unstaked.balance = res.status.balances;
                unstaked.tokenIds = res.status.tokenIds.slice();
                unstaked.metadatas = res.status.metadatas.slice();
                setUnStakedInfo(unstaked);
            }
        }

        setSelectedUnStakedTokenIds([])
        setSelectedStakedTokenIds([])
    }

    const fetchStakedInfo = async () => {
        let staked = initStakedInfo;
        if (account) {
            const res = await ContractUtils.fetchStakedInfo(library, account)

            if (res.success) {
                staked.balance = res.status.balances;
                staked.tokenIds = res.status.tokenIds.slice();
                staked.metadatas = res.status.metadatas.slice();
                setStakedInfo(staked);
            }
        }

        setSelectedUnStakedTokenIds([])
        setSelectedStakedTokenIds([])
    }

    const IsSelected = (type, tokenId) => {

        const list = type == 0 ? selectedUnStakedTokenIds : selectedStakedTokenIds
        for (let i = 0; i < list.length; i++) {
            if (list[i] == tokenId) {
                return true;
            }
        }
        return false;
    }

    const removeItemFromArray = (oldlist, tokenId) => {
        let list = oldlist;
        for (let i = 0; i < list.length; i++) {
            if (list[i] == tokenId) {
                list[i] = list[list.length - 1];
                list.pop()
                break;
            }
        }
        return list;
    }

    const unstakedNFTClick = async (tokenId, index) => {

        if (IsSelected(0, tokenId)) {

            let newlist = removeItemFromArray(
                selectedUnStakedTokenIds,
                tokenId,
            );
            setSelectedUnStakedTokenIds(newlist)
        } else {

            let newlist = selectedUnStakedTokenIds;
            newlist.push(tokenId);
            setSelectedUnStakedTokenIds(newlist);
        }

        setRedraw(!redraw);
    }

    const stakedNFTClick = async (tokenId, index) => {
        if (IsSelected(1, tokenId)) {
            const newlist = removeItemFromArray(
                selectedStakedTokenIds,
                tokenId,
            )
            setSelectedStakedTokenIds(newlist)
        } else {
            var newlist = selectedStakedTokenIds;
            newlist.push(tokenId);
            setSelectedStakedTokenIds(newlist);
        }

        setRedraw(!redraw)
    }

    const handleStake = async () => {
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
                await ContractUtils.stake(library, account, selectedUnStakedTokenIds);
                setRequestedApproval(false)
                setFetchFlag(true)
            } catch {
                console.log('Stake failed')
                setRequestedApproval(false)
            }
        }
    }

    const handleUnStake = async () => {
        if (!account) {
            setShowToast(true);
            setToastMessage("Please connect wallet");
            setToastType(2);
            return;
        }
        try {
            setRequestedApproval(true);
            await ContractUtils.unStake(library, account, selectedUnStakedTokenIds, true);
            setRequestedApproval(false);
            setFetchFlag(true);
        } catch {
            console.log('Stake failed');
            setRequestedApproval(false);
        }
    }

    const onClickBuyYen = () => {

    }

    const onToastClose = () => {
        setShowToast(false);
    }

    return (<>
        <div className={'recruit stack'}>
            <div className={'displayRecruit mt-4'}>
                <div className={'row container recruitButton'}>
                    <div className={'col-4 text-center'}>
                        <Backbutton link={'/'} />
                    </div>
                    <div className={'col-4 text-center'}>
                        <Button className="buttonBuy" onClick={handleStake}>
                            Stake
                        </Button>
                    </div>
                    <div className={'col-4 text-center'}>
                        <ConnectButton />
                    </div>
                </div>
            </div>

            <div className={'blackGlass mt-5'}>
                <div className={'StackV container'}>
                    <div className={'stackDiv'}>
                        <div className={'stake'} onClick={() => setTabStatus(STAKETAB)}>Stack - 30</div>
                        <div className={'stake'} onClick={() => setTabStatus(UNSTAKETAB)}>unStack - 30</div>
                    </div>
                    <div className={'d-flex justify-content-center align-items-center'}>
                        <Button className="buttonBuy" onClick={onClickBuyYen}>
                            Buy yen
                        </Button>
                        <Button className="buttonBuy" onClick={onClickBuyYen}>
                            Buy yen & Unstake
                        </Button>
                    </div>

                </div>

                <div className={'my-5'}>
                    <div className={'textStake'}>
                        you can only unstake if ronin collected at least 2$ bribe
                    </div>
                    <div className={'d-flex justify-content-sm-between align-items-center'}>
                        <div className={'stakes'}>ronin - 12</div>
                        <div className={'stakes'}>select all</div>
                    </div>
                    <div className={'row m-4'}>
                        {
                            tabStatus == STAKETAB ?
                                stakedInfo && stakedInfo.tokenIds && stakedInfo.tokenIds.map((tokenId, idx) => {
                                    const item = stakedInfo.metadatas[idx];
                                    const isSelected = IsSelected(0, tokenId);
                                    if (item.isRonin) {
                                        return (
                                            <div className={'col-lg-2 col-md-3 col-sm-4'}>
                                                <div className={'stackeImg'}>
                                                    <img width='80' src={Img} alt={'/'} />
                                                    <div className={'stakeText'}>#1.6541098641</div>
                                                </div>
                                            </div>
                                        )
                                    }
                                })
                                :
                                unstakedInfo && unstakedInfo.tokenIds && unstakedInfo.tokenIds.map((tokenId, idx) => {
                                    const item = unstakedInfo.metadatas[idx];
                                    const isSelected = IsSelected(0, tokenId);
                                    if (item.isRonin) {
                                        return (
                                            <div className={'col-lg-2 col-md-3 col-sm-4'}>
                                                <div className={'stackeImg'}>
                                                    <img width='80' src={Img} alt={'/'} />
                                                    <div className={'stakeText'}>#1.6541098641</div>
                                                </div>
                                            </div>
                                        )
                                    }
                                })
                        }
                    </div>
                    <div className={'d-flex justify-content-sm-between align-items-center'}>
                        <div className={'stakes'}>samurai</div>
                        <div className={'stakes'}>select all</div>
                    </div>
                    <div className={'row m-4'}>
                        {
                            tabStatus == STAKETAB ?
                                stakedInfo && stakedInfo.tokenIds && stakedInfo.tokenIds.map((tokenId, idx) => {
                                    const item = stakedInfo.metadatas[idx];
                                    const isSelected = IsSelected(0, tokenId);
                                    if (!item.isRonin) {
                                        return (
                                            <div className={'col-lg-2 col-md-3 col-sm-4'}>
                                                <div className={'stackeImg'}>
                                                    <img width='80' src={Img} alt={'/'} />
                                                    <div className={'stakeText'}>#1.6541098641</div>
                                                </div>
                                            </div>
                                        )
                                    }
                                })
                                :
                                unstakedInfo && unstakedInfo.tokenIds && unstakedInfo.tokenIds.map((tokenId, idx) => {
                                    const item = unstakedInfo.metadatas[idx];
                                    const isSelected = IsSelected(0, tokenId);
                                    if (!item.isRonin) {
                                        return (
                                            <div className={'col-lg-2 col-md-3 col-sm-4'}>
                                                <div className={'stackeImg'}>
                                                    <img width='80' src={Img} alt={'/'} />
                                                    <div className={'stakeText'}>#1.6541098641</div>
                                                </div>
                                            </div>
                                        )
                                    }
                                })
                        }
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
export default Stake;