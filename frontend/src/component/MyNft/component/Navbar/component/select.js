import React from 'react';
import './style.css';

const SeclectNav = ({text, price}) =>{
    return(<>
        <div className={'topNavbar '}>
<div className={'price'}>
    {text}
</div>
            <div className={'price'}>
               {price}

            </div>

        </div>

    </>)
}
export default SeclectNav;