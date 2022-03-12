import React from 'react';
import './style.css';
import Img from '../../../../assest/images/home_img.png'
import ButtonBuy from "../../../../assest/Style/ButtonBuy";
import SocialButton from "../../../../assest/Style/SocialButton";
const Home = () =>{
    return(<>
        <div className={'homeSection container'}>
                <img className={'img-fluid'} src={Img} alt={'no img'}/>
        </div>
        <div className={'homeButton'}>
<div className={'row'}>
    <div className={'col-12'}>
        <div className={'text-center mb-3'}>
            <ButtonBuy link={'/'} text={'Buy yen'} />
        </div>
    </div>
    <div className={'col-12'}>
        <div className={'text-center mt-4'}>
            <div className={'socialicon'}>
                <SocialButton link={'/'} icon={'fa-brands fa-twitter'} />
                <SocialButton link={'/'} icon={'fa-brands fa-fantasy-flight-games'} />
                <SocialButton link={'/'} icon={'fa-brands fa-twitter'} />
            </div>

        </div>
    </div>

</div>
        </div>
        </>)
}
export default Home;