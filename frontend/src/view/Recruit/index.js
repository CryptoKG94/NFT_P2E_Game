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
import { mintNFT, getNFTInfo } from '../../store/actions/thunks';
import Toast from '../../components/Toast';
import ContractUtils from '../../utils/contractUtils';

const Recruit = () => {
    const dispatch = useDispatch();
    const nftInfo = useSelector(selectors.zomibeInfo);
    const { account, library } = useWeb3React();
    const [mintAmount, setMintAmount] = useState(0);
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState("")
    const [toastType, setToastType] = useState(2) //1: success, 2: error

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

        const res = await ContractUtils.mintNFT(library, account, mintAmount);
        if (res.success) {
            setShowToast(true)
            setToastType(1)
            setToastMessage("Minted Successfully!");
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
        dispatch(getNFTInfo());
    }, []);

    return (<>
        <div className={'recruit '}>
            <div className={'displayRecruit mt-4'}>
                <div className={'row container recruitButton'}>
                    <div className={'col-4 text-center'}>
                        <Backbutton link={'/'} />
                    </div>
                    <div className={'col-4 text-center'}>
                        <ButtonBuy func={onClickMint} text={'Recruit'}/>
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
                            0 / 3000 mintue
                            <br />

                            {account ? (
                                <>
                                <input type={'number'} 
                                className={'InputCheck'} 
                                onChange={handleChangeAmount}
                                value={mintAmount}
                                />
                                <div className={'bouttonChecher'}>
                                    <div className={'ButtonCheck'} onClick={decreaseValue}>-</div>
                                    <div className={'ButtonCheck'}>{`Mint ${mintAmount} nft`}</div>
                                    <div className={'ButtonCheck'} onClick={increaseValue}>+</div>
                                </div>
                                </>
                            ) : `Connect your wallet first`}
                        </div>

                        <div className={'text-center my-4'}>
                            <img width={100} src={Img} alt={'/'} />
                            <img width={100} src={Img1} alt={'/'} />
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
export default Recruit;