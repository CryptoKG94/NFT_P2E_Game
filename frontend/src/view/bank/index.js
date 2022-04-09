import React, { useEffect, useState } from 'react';
import './style.css';
import Backbutton from "../../assest/Style/Backbutton";
import ButtonBuy from "../../assest/Style/Navbutton";
import ConnectButton from "../../assest/Style/ConnectButton";
import CardBank from "./component/Card";
import Img_FTM from '../../assest/images/bank/FTM.png'
import Img_TOMB from '../../assest/images/bank/Tomb.png'
import Img_USDC from '../../assest/images/bank/USDC.png'
import Img_USDT from '../../assest/images/bank/USDT.png'
import ContractUtils from '../../utils/contractUtils';
import { useWeb3React } from '@web3-react/core'
import Toast from '../../components/Toast';

const Bank = () =>{
    let banklist = [
        {
            id: 0,
            name: 'FTM',
            img: Img_FTM
        },
        {
            id: 1,
            name: 'TOMB',
            img: Img_TOMB
        },
        {
            id: 2,
            name: 'USDC',
            img: Img_USDC
        },
        {
            id: 3,
            name: 'USDT',
            img: Img_USDT
        }
    ]

    const { account, library } = useWeb3React();
    const [requestedDeposit, setRequestedDeposit] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("")
    const [toastType, setToastType] = useState(2) //1: success, 2: error

    const [fetchFlag, setFetchFlag] = useState(true)

    const handleDeposit = async (id, amount) => {
        if (!account) {
            setShowToast(true);
            setToastMessage("Please connect wallet");
            setToastType(2);
            return;
        }

        try {
            setRequestedDeposit(true);
            let res = await ContractUtils.DepositYEN(library, account, id, amount);
            setRequestedDeposit(false)
            setFetchFlag(true)
            if (res.success) {
                setShowToast(true);
                setToastMessage("Buy Crossbow successfully");
                setToastType(1);
            } else {
                setShowToast(true);
                setToastMessage("Failed");
                setToastType(2);
            }
        } catch {
            console.log('Stake failed')
            setRequestedDeposit(false)
        }
    }

    const onToastClose = () => {
        setShowToast(false);
    }

    return(<>
        <div className={'recruit bank'}>
            <div className={'displayRecruit my-4'}>
                <div className={'row container recruitButton'}>
                    <div className={'col-4 text-center'}>
                        <Backbutton link={'/'} />
                    </div>
                    <div className={'col-4 text-center'}>
                        <ButtonBuy link={'/'} text={'bank'} />
                    </div>
                    <div className={'col-4 text-center'}>
                        <ConnectButton link={'/'} text={'connect wallet'} />
                    </div>
                </div>
            </div>
            <div className={'container'}>
                <div className={'row'}>
                    {
                        banklist.map((item) => {
                            return (
                                <div className={'col-lg-3 col-md-4 col-sm-4 col-6'}>
                                    <CardBank item={item} onDeposit={handleDeposit}/>
                                </div>
                            )
                        })
                    }
                    {/* <div className={'col-lg-3 col-md-4 col-sm-4 col-6'}>
                        <CardBank Img={Img1} Rs={"FTM"} pool={'FTM Pool'} earn={'ftm earned'}/>
                    </div>
                        <CardBank Img={Img2} Rs={"Tomb"} pool={'Tomb Pool'} earn={'tomb earned'}/>
                    </div>
                    <div className={'col-lg-3 col-md-4 col-sm-4 col-6'}>
                        <CardBank Img={Img3} Rs={"usdc"} pool={'usdc pool'} earn={'usdc earned'}/>
                    </div>
                    <div className={'col-lg-3 col-md-4 col-sm-4 col-6'}>
                        <CardBank Img={Img4} Rs={"usdt"} pool={'usdt'} earn={'usdt earned'}/>
                    </div> */}
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

export default Bank;