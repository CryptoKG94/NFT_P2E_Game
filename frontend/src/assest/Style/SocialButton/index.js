import React from 'react';
import './style.css';
import {Link} from "react-router-dom";

const SocialButton = ({text,link,Img}) =>{
    return(<>
        <Link to={link} className={'SocialButton'}>
           <img className={'ImgHome'} src={Img} alt={'#'} />
        </Link>
    </>)
}
export default SocialButton;