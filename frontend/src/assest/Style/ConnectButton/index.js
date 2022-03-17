import React, { useEffect } from 'react';
import { useWeb3React } from "@web3-react/core";
import { Button } from '@mui/material';
import './style.css';
import { Link } from "react-router-dom";
import { injected, walletconnect } from "../../../utils/Connector";

const ConnectButton = () => {
    const { chainId, account, active, activate, deactivate} = useWeb3React();
    useEffect(() => {
        activate(injected);
    }, []);
    return (<>
        {
            !account ?
                <Link to={'#'} onClick={
                    !active ? () => activate(injected) : null
                } className={'connectButton'}>
                    Connect Wallet
                </Link>
                :
                <Link to={'#'} onClick={
                    active ? () => deactivate() : null
                } className={'connectButton'}>
                    {account &&
                        `${account.slice(0, 6)}...${account.slice(
                            account.length - 4,
                            account.length
                        )}`}
                </Link>
        }
    </>)
}
export default ConnectButton;