import React from 'react';
import './style.css';
import {Link} from "react-router-dom";

const ConnectButton = ({text,link}) =>{
    return(<>
        <Link to={link} className={'connectButton'}>
            {text}
        </Link>
    </>)
}
export default ConnectButton;