import React from 'react';
import './style.css';
import {Link} from "react-router-dom";

const ButtonBuy = ({text, link}) =>{
    return(<>
        <Link to={link} className={'buttonLink'}>
            {text}
        </Link>
    </>)
}
export default ButtonBuy;