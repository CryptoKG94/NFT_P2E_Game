import React from 'react';
import './style.css';
import Img from '../../../assest/images/backarrowImg.png'
import {Link} from "react-router-dom";

const Backbutton = ({text,link}) =>{
    return(<>
        <Link to={link} className={'buttonBack_'}>
            <img width={50} src={Img} alt={'/#'}/>
        </Link>
    </>)
}
export default Backbutton;