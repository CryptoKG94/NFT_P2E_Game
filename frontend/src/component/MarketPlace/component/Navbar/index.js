import React from 'react';
import './style.css';
import SeclectNav from "./component/select";

const NavbarSelector = ({text, price}) =>{
    return(<>
        <div className={'topNav my-4'}>
         <SeclectNav text={text} price={price}/>
        </div>
    </>)
}
export default NavbarSelector;