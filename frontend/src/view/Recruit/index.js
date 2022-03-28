import React, { useEffect, useState } from 'react';
import './style.css';
import Backbutton from "../../assest/Style/Backbutton";
import ButtonBuy from "../../assest/Style/Navbutton";
import ConnectButton from "../../assest/Style/ConnectButton";
import Img from '../../assest/images/img1.png'
import Img1 from '../../assest/images/img2.png'
import { useDispatch, useSelector } from 'react-redux';
import * as selectors from '../../store/selectors';
import { useWeb3React } from '@web3-react/core';
import { getNFTInfo } from '../../store/actions/thunks';
import Toast from '../../components/Toast';
import Loading from '../../components/Loading';
import ContractUtils from '../../utils/contractUtils';

const Recruit = () => {
    const dispatch = useDispatch();
    const mintInfo = useSelector(selectors.mintInfo);
    console.log('[kg] => mintInfo: ', mintInfo);
    const { account, library } = useWeb3React();
    const [mintAmount, setMintAmount] = useState(0);
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState("")
    const [toastType, setToastType] = useState(2) //1: success, 2: error
    const [loading, setLoading] = useState(false);
    const [fetchFlag, setFetchFlag] = useState(true);
    const [useShield, setUseShield] = useState(false);
    const [autoStake, setAutoStake] = useState(false);

    const handleChangeAmount = (e) => {
        setMintAmount(Number(e.target.value));
    }

    const setMax = () => {
        setMintAmount(30);
    }

    const decreaseValue = () => {
        if (mintAmount <= 0) return;
        setMintAmount(mintAmount => mintAmount - 1);
    }

    const onUseShield = () => {
        setUseShield(!useShield);
    }

    const onAutoStake = () => {
        setAutoStake(!autoStake);
    }

    const increaseValue = () => {
        if (mintAmount >= 30) return;
        setMintAmount(mintAmount => mintAmount + 1);
    }

    const onClickMint = async () => {
        if (!mintAmount || mintAmount < 0) {
            setShowToast(true);
            setToastMessage("Enter a amount");
            setToastType(2);
            return;
        }

        if (mintAmount > 30) {
            setShowToast(true);
            setToastMessage("User can't mint more than 30 NFTs at once");
            setToastType(2);
            return;
        }

        // setLoading(true);
        const res = await ContractUtils.mintNFT(library, account, mintAmount, autoStake, useShield);
        // setLoading(false);
        if (res.success) {
            setShowToast(true)
            setToastType(1)
            setToastMessage("Minted Successfully!");
            setFetchFlag(true);
        } else {
            setShowToast(true);
            setToastMessage(res.status);
            setToastType(2)
        }
    }

    const onToastClose = () => {
        setShowToast(false);
    }

    useEffect(() => {
        if (fetchFlag) {
            dispatch(getNFTInfo(library));
            setFetchFlag(false);
        }
    }, [fetchFlag]);

    return (<>
        <div className={'recruit '}>
            <div className={'displayRecruit mt-4'}>
                <div className={'row container recruitButton'}>
                    <div className={'col-4 text-center'}>
                        <Backbutton link={'/'} />
                    </div>
                    <div className={'col-4 text-center'}>
                        <ButtonBuy func={onClickMint} text={'Recruit'} />
                    </div>
                    <div className={'col-4 text-center'}>
                        <ConnectButton />
                    </div>
                </div>
            </div>
            <div className={'container'}>
                <div className={'blackGlass mt-5'}>
                    <div>


                        <div className={'ParaRecruit'}>
                            a violet battle now pits the last human survivors against the <span className={'redSpan'}>Ronin</span> who are trying to steal the $virus samples in order to contaminate the entire human race.
                            <br /> the <span className={'greenSpan'}>Samurai</span> will do anything to survive and kill any zombie who tries to oppose them and infiltrate the lab !
                        </div>
                        <div className={'GenContainer my-5'}>
                            <div className={'buttonGen'}>
                                gen-0
                            </div>
                            <div className={'buttonGen'}>
                                gen-1
                            </div>
                            <div className={'buttonGen1'}>
                                gen-2
                            </div>
                        </div>

                        <div className={'genMintue'}>
                            {`${mintInfo && mintInfo.data ? mintInfo.data.mintCount : '-'} / 3000 mintue`}
                            <br />

                            {account ? (
                                <div className={'recruit-buttoncheck'}>
                                    <div className={'ButtonCheck'} onClick={decreaseValue}>-</div>
                                    <div className={'ButtonCheck'} onClick={onClickMint}>{`Mint ${mintAmount} nft`}</div>
                                    <div className={'ButtonCheck'} onClick={increaseValue}>+</div>
                                </div>
                            ) : `Connect your wallet first`}
                        </div>

                        <div className={'text-center my-4'}>
                            <img width={100} src={Img} alt={'/'} />
                            <img width={100} src={Img1} alt={'/'} />
                        </div>
                        <div className={'recruit-buttoncheck'}>
                            <input type={'checkbox'} className={'InputCheck'} id="group1"/>
                            <label className={'checkbox-label'} htmlFor="group1" checked={useShield} onChange={() => setUseShield(!useShield)}>Use Shield</label>
                            {/* <div className={'ButtonCheck btncheck'} onClick={onUseShield}> use shield </div> */}
                            
                            <input type={'checkbox'} className={'InputCheck'} id="group2"/>
                            <label className={'checkbox-label'} htmlFor="group2" checked={autoStake} onChange={() => setAutoStake(!autoStake)}>Auto Stake</label>
                            {/* <div className={'ButtonCheck btncheck'} onClick={onAutoStake}> auto stake </div> */}
                        </div>
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
export default Recruit;