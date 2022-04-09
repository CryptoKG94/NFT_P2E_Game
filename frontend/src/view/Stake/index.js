import React, { useEffect, useState } from 'react';
import './style.css';
import Backbutton from "../../assest/Style/Backbutton";
import ButtonNav from "../../assest/Style/Navbutton";
import ButtonBuy from "../../assest/Style/ButtonBuy";
import ConnectButton from "../../assest/Style/ConnectButton";
import RoninImg from '../../assest/images/6_ronin.png';
import SamImg from '../../assest/images/6_sam.png';
import { mintNFT, getNFTInfo } from '../../store/actions/thunks';
// import { Button } from '@mui/material';
import { useDispatch } from 'react-redux';
import { useWeb3React } from '@web3-react/core';
import BigNumber from 'bignumber.js'
import ContractUtils from '../../utils/contractUtils';
import { getFullDisplayBalance, getBalanceNumber } from '../../components/formatBalance';
import Toast from '../../components/Toast';
import Loading from '../../components/Loading';
import { SUCCESS, WARNNING } from '../../utils/Constants';
import TimerComponent from '../../components/timer';

const STAKETAB = 1;
const UNSTAKETAB = 2;

const initStakedInfo = {
    balance: new BigNumber(0),
    tokenIds: [],
    metadatas: [],
    stakeInfo: []
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
    const [roninAllSelected, setRoninAllSelected] = useState(false);
    const [samAllSelected, setSamAllSelected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [usePortion, setUsePortion] = useState(false);
    const [useCrossBow, setUseCrossBow] = useState(false);

    const fetchIsApprovedForAll = async () => {
        const isApp = await ContractUtils.isApprovedForAllToStake(library, account);
        setIsApproved(isApp.success);
    }

    useEffect(async () => {
        if (fetchFlag && account) {
            console.log('fetchFlag:  TRUE')
            setLoading(true);
            await fetchIsApprovedForAll()
            await fetchUnStakedInfo()
            await fetchStakedInfo()
            setFetchFlag(false)
            setLoading(false);
        }
        // if (account) fetchReward()
    }, [account, fetchFlag])

    // const fetchReward = async () => {
    //     const result = await ContractUtils.fetchStakingReward(library, account);
    //     if (result.success) {
    //         setReward(getFullDisplayBalance(new BigNumber(result.status)))
    //     }
    // }

    async function fetchUnStakedInfo() {

        let unstaked = initUnStakedInfo;
        if (account) {
            const res = await ContractUtils.fetchUnstakedInfo(library, account)

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
                staked.stakeInfo = res.status.stakeInfo.slice();
                setStakedInfo(staked);
            }
        }

        setSelectedUnStakedTokenIds([])
        setSelectedStakedTokenIds([])
    }

    const IsSelected = (type, tokenId) => {

        const list = type == UNSTAKETAB ? selectedUnStakedTokenIds : selectedStakedTokenIds
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

    const onSelectChange = async (e) => {
        console.log(e);
    }

    const unstakedNFTClick = async (tokenId, index) => {

        if (IsSelected(UNSTAKETAB, tokenId)) {

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
        if (IsSelected(STAKETAB, tokenId)) {
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

    const onClickRoninSelectAll = () => {
        let selectState = !roninAllSelected;
        setRoninAllSelected(selectState);
        let newlist = tabStatus == STAKETAB ? selectedStakedTokenIds : selectedUnStakedTokenIds;
        let info = tabStatus == STAKETAB ? stakedInfo : unstakedInfo;
        if (selectState) {
            info && info.tokenIds && info.tokenIds.map((tokenId, idx) => {
                const item = info.metadatas[idx];
                if (item.isRonin && !IsSelected(tabStatus, tokenId)) {
                    newlist.push(tokenId);
                }
            })
        } else {
            info && info.tokenIds && info.tokenIds.map((tokenId, idx) => {
                const item = info.metadatas[idx];
                if (item.isRonin && IsSelected(tabStatus, tokenId)) {
                    newlist = removeItemFromArray(
                        newlist,
                        tokenId,
                    );
                }
            })
        }
        tabStatus == STAKETAB ?
            setSelectedStakedTokenIds(newlist) :
            setSelectedUnStakedTokenIds(newlist)
    }

    const onClickSamuSelectAll = () => {
        let selectState = !samAllSelected;
        setSamAllSelected(selectState);
        let newlist = tabStatus == STAKETAB ? selectedStakedTokenIds : selectedUnStakedTokenIds;
        let info = tabStatus == STAKETAB ? stakedInfo : unstakedInfo;
        if (selectState) {
            info && info.tokenIds && info.tokenIds.map((tokenId, idx) => {
                const item = info.metadatas[idx];
                if (!item.isRonin && !IsSelected(tabStatus, tokenId)) {
                    newlist.push(tokenId);
                }
            })
        } else {
            info && info.tokenIds && info.tokenIds.map((tokenId, idx) => {
                const item = info.metadatas[idx];
                if (!item.isRonin && IsSelected(tabStatus, tokenId)) {
                    newlist = removeItemFromArray(
                        newlist,
                        tokenId,
                    );
                }
            })
        }
        tabStatus == STAKETAB ?
            setSelectedStakedTokenIds(newlist) :
            setSelectedUnStakedTokenIds(newlist)
    }

    const handleStake = async () => {
        if (!account) {
            onToastOpen(WARNNING, "Please connect wallet");
            return;
        }

        if (selectedUnStakedTokenIds.length == 0) {
            onToastOpen(WARNNING, "Please select NFT to stake");
            return;
        }

        if (!isApproved) {
            setRequestedApproval(true);
            let res = await ContractUtils.setApprovalForAllToStake(library, account);
            setRequestedApproval(false);

            if (res.success) {
                setIsApproved(true);
                onToastOpen(SUCCESS, "Approved Successfully!");
            } else {
                onToastOpen(WARNNING, res.status);
            }
        } else {
            try {
                setRequestedApproval(true);
                let res = await ContractUtils.stake(library, account, selectedUnStakedTokenIds);
                setRequestedApproval(false)
                setFetchFlag(true)

                if (res.success) {
                    onToastOpen(SUCCESS, "Staked Successfully!");
                } else {
                    onToastOpen(WARNNING, res.status);
                }
            } catch {
                console.log('Stake failed')
                setRequestedApproval(false)
            }
        }
    }

    const handleUnStake = async () => {
        if (!account) {
            onToastOpen(WARNNING, "Please connect wallet");
            return;
        }

        if (selectedStakedTokenIds.length == 0) {
            onToastOpen(WARNNING, "Please select NFT to unstake");
            return;
        }

        try {
            setRequestedApproval(true);
            let res = await ContractUtils.unStake(library, account, selectedStakedTokenIds, usePortion, useCrossBow, true);
            setRequestedApproval(false);
            setFetchFlag(true);

            if (res.success) {
                onToastOpen(SUCCESS, "Unstaked Successfully");
            } else {
                onToastOpen(WARNNING, res.status);
            }
        } catch {
            console.log('Stake failed');
            setRequestedApproval(false);
        }
    }

    const onClickBuyYen = async () => {
        if (!account) {
            onToastOpen(WARNNING, "Please connect wallet");
            return;
        }

        if (selectedStakedTokenIds.length == 0) {
            onToastOpen(WARNNING, "Please select NFT to claim");
            return;
        }
        try {
            setRequestedApproval(true);
            let res = await ContractUtils.unStake(library, account, selectedStakedTokenIds, usePortion, useCrossBow, false);
            setRequestedApproval(false);
            setFetchFlag(true);

            if (res.success) {
                onToastOpen(SUCCESS, "Claimed Successfully!");
            } else {
                onToastOpen(WARNNING, res.status);
            }
        } catch {
            console.log('Stake failed');
            setRequestedApproval(false);
        }
    }

    const handleUsePortion = () => {
        setUsePortion(!usePortion);
    }

    const handleUseCrossBow = () => {
        setUseCrossBow(!useCrossBow);
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
        <div className={'recruit stake'}>
            <div className={'displayRecruit mt-4'}>
                <div className={'row container recruitButton'}>
                    <div className={'col-4 text-center'}>
                        <Backbutton link={'/'} />
                    </div>
                    <div className={'col-4 text-center'}>
                        {tabStatus == UNSTAKETAB ?
                            <ButtonNav func={handleStake} text={isApproved ? 'STAKE' : 'APPROVE'} />
                            : <></>
                        }
                    </div>
                    <div className={'col-4 text-center'}>
                        <ConnectButton />
                    </div>
                </div>
            </div>

            <div className={'items-container'}>
                <div className={'StackV container'}>
                    <div className={'stackDiv'}>
                        <div className={tabStatus == STAKETAB ? 'stake tabsel' : 'stake'} onClick={() => setTabStatus(STAKETAB)}>Stake - 30</div>
                        <div className={tabStatus == UNSTAKETAB ? 'stake tabsel' : 'stake'} onClick={() => setTabStatus(UNSTAKETAB)}>unStake - 30</div>
                    </div>
                    {tabStatus == STAKETAB ?
                        <div className={'d-flex justify-content-center align-items-center'}>
                            <ButtonBuy disabled={tabStatus != STAKETAB ? true : false} func={onClickBuyYen} text={'Claim YEN'} />
                            <ButtonBuy disabled={tabStatus != STAKETAB ? true : false} func={handleUnStake} text={'Claim YEN & Unstake'} />
                        </div>
                        : <></>
                    }

                </div>

                <div className={'my-5'}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <div className={'textStake'}>
                        you can only unstake if ronin collected at least 20,000 YEN
                    </div>
                    {tabStatus == STAKETAB ?
                        <div style={{
                            fontSize: '20px',
                            marginLeft: '20px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                            <input type={'checkbox'} className={'InputCheck'} id="stake-shield" checked={usePortion} onChange={() => handleUsePortion()} />
                            <label style={{ color: 'red', padding: '10px' }} htmlFor="stake-shield">USE PORTION</label>

                            <input type={'checkbox'} className={'InputCheck'} id="stake-auto" checked={useCrossBow} onChange={() => handleUseCrossBow()}/>
                            <label style={{ color: 'red', padding: '10px' }} htmlFor="stake-auto">USE CROSSBOW</label>
                        </div>
                        : <></>
                    }
                    <div className={'d-flex justify-content-sm-between align-items-center'}>
                        <div className={'stakes ronin-12'}>ronin - 12</div>
                        <div className={'stakes stakes-btn'} onClick={onClickRoninSelectAll}>select all</div>
                    </div>
                    <div className={'row m-4'}
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            maxWidth: '1000px',
                        }}>
                        {
                            tabStatus == STAKETAB ?
                                stakedInfo && stakedInfo.tokenIds && stakedInfo.tokenIds.map((tokenId, idx) => {
                                    const item = stakedInfo.metadatas[idx];
                                    const stakeInfo = stakedInfo.stakeInfo[idx];
                                    const selected = IsSelected(STAKETAB, tokenId);
                                    if (item.isRonin) {
                                        return (
                                            <div
                                                style={{
                                                    margin: "10px",
                                                    width: "180px",
                                                    height: "270px",
                                                    backgroundColor: "#010414",
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    textAlign: "center",
                                                    borderRadius: "20px",
                                                    color: "white",
                                                    border: "2px solid white",
                                                }}
                                                key={tokenId}
                                            >
                                                <div style={{}}>
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            justifyContent: "space-around",
                                                            alignItems: "center",
                                                        }}
                                                    >
                                                        <h1>{`NFT ID:${tokenId}`}</h1>
                                                        <input type={'checkbox'} className={'InputCheck'} checked={selected} onChange={() => stakedNFTClick(tokenId, idx)} />
                                                    </div>

                                                    <img
                                                        style={{
                                                            borderRadius: "30px",
                                                            padding: "10px",
                                                        }}
                                                        width="120px"
                                                        height="130px"
                                                        src={RoninImg}
                                                        alt={"/"}
                                                    />

                                                    <h3>
                                                        Reward:{" "}
                                                        <span style={{ paddingLeft: "26px" }}>{`${getBalanceNumber(stakeInfo.reward)}`}</span>
                                                    </h3>
                                                    <TimerComponent depositTime={stakeInfo.depositTime} />
                                                </div>
                                            </div>
                                            // <div className={'col-lg-2 col-md-3 col-sm-4'} onClick={() => stakedNFTClick(tokenId, idx)}>
                                            //     <div className={selected ? 'stackeImg withBorder' : 'stackeImg noBorder'}>
                                            //         <img width='80' src={RoninImg} alt={'NFT'} style={{ borderRadius: '5px' }} />
                                            //         <div className={'stakeText'}>0.1 FTM</div>
                                            //     </div>
                                            // </div>
                                        )
                                    }
                                })
                                :
                                unstakedInfo && unstakedInfo.tokenIds && unstakedInfo.tokenIds.map((tokenId, idx) => {
                                    const item = unstakedInfo.metadatas[idx];
                                    const selected = IsSelected(UNSTAKETAB, tokenId);
                                    if (item.isRonin) {
                                        return (
                                            <div
                                                style={{
                                                    margin: "10px",
                                                    width: "180px",
                                                    height: "270px",
                                                    backgroundColor: "#010414",
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    textAlign: "center",
                                                    borderRadius: "20px",
                                                    color: "white",
                                                    border: "2px solid white",
                                                }}
                                                key={tokenId}
                                            >
                                                <div style={{}}>
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            justifyContent: "space-around",
                                                            alignItems: "center",
                                                        }}
                                                    >
                                                        <h1>{`NFT ID:${tokenId}`}</h1>
                                                        <input type={'checkbox'} className={'InputCheck'} checked={selected} onChange={() => unstakedNFTClick(tokenId, idx)} />
                                                    </div>

                                                    <img
                                                        style={{
                                                            borderRadius: "30px",
                                                            padding: "10px",
                                                        }}
                                                        width="120px"
                                                        height="130px"
                                                        src={RoninImg}
                                                        alt={"/"}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    }
                                })
                        }
                    </div>
                    <div className={'d-flex justify-content-sm-between align-items-center'}>
                        <div className={'stakes ronin-12'}>samurai</div>
                        <div className={'stakes stakes-btn'} onClick={onClickSamuSelectAll}>select all</div>
                    </div>
                    <div className={'row m-4'}>
                        {
                            tabStatus == STAKETAB ?
                                stakedInfo && stakedInfo.tokenIds && stakedInfo.tokenIds.map((tokenId, idx) => {
                                    const item = stakedInfo.metadatas[idx];
                                    const stakeInfo = stakedInfo.stakeInfo[idx];
                                    const selected = IsSelected(STAKETAB, tokenId);
                                    if (!item.isRonin) {
                                        return (
                                            <div
                                                style={{
                                                    margin: "10px",
                                                    width: "180px",
                                                    height: "270px",
                                                    backgroundColor: "#010414",
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    textAlign: "center",
                                                    borderRadius: "20px",
                                                    color: "white",
                                                    border: "2px solid white",
                                                }}
                                                key={tokenId}
                                            >
                                                <div style={{}}>
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            justifyContent: "space-around",
                                                            alignItems: "center",
                                                        }}
                                                    >
                                                        <h1>{`NFT ID:${tokenId}`}</h1>
                                                        <input type={'checkbox'} className={'InputCheck'} checked={selected} onChange={() => stakedNFTClick(tokenId, idx)} />
                                                    </div>

                                                    <img
                                                        style={{
                                                            borderRadius: "30px",
                                                            padding: "10px",
                                                        }}
                                                        width="120px"
                                                        height="130px"
                                                        src={SamImg}
                                                        alt={"/"}
                                                    />

                                                    <h3>
                                                        Reward:{" "}
                                                        <span style={{ paddingLeft: "26px" }}>{`${getBalanceNumber(stakeInfo.reward)}`}</span>
                                                    </h3>
                                                </div>
                                            </div>
                                        )
                                    }
                                })
                                :
                                unstakedInfo && unstakedInfo.tokenIds && unstakedInfo.tokenIds.map((tokenId, idx) => {
                                    const item = unstakedInfo.metadatas[idx];
                                    const selected = IsSelected(UNSTAKETAB, tokenId);
                                    if (!item.isRonin) {
                                        return (
                                            <div
                                                style={{
                                                    margin: "10px",
                                                    width: "180px",
                                                    height: "270px",
                                                    backgroundColor: "#010414",
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    textAlign: "center",
                                                    borderRadius: "20px",
                                                    color: "white",
                                                    border: "2px solid white",
                                                }}
                                                key={tokenId}
                                            >
                                                <div style={{}}>
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            justifyContent: "space-around",
                                                            alignItems: "center",
                                                        }}
                                                    >
                                                        <h1>{`NFT ID:${tokenId}`}</h1>
                                                        <input type={'checkbox'} className={'InputCheck'} checked={selected} onChange={() => unstakedNFTClick(tokenId, idx)} />
                                                    </div>

                                                    <img
                                                        style={{
                                                            borderRadius: "30px",
                                                            padding: "10px",
                                                        }}
                                                        width="120px"
                                                        height="130px"
                                                        src={SamImg}
                                                        alt={"/"}
                                                    />
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
        <Loading
            open={loading}
        />
        <Toast
            open={showToast}
            message={toastMessage}
            handleClose={onToastClose}
            type={toastType}
        />
    </>)
}
export default Stake;