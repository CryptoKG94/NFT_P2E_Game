import React from 'react';
import './style.css';
import {Link} from "react-router-dom";

const ButtonBuy = ({text, func, disabled = false}) =>{
    return(<>
        <Link to={'#'} onClick={func} className={'buttonNav'}>
            {text}
        </Link>
    </>)
}
export default ButtonBuy;