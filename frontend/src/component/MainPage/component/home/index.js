import React from 'react';
import './style.css';
import Img1 from '../../../../assest/images/twitter.png'
import Img2 from '../../../../assest/images/vector.png'
import Img3 from '../../../../assest/images/w.png'
import Img4 from '../../../../assest/images/w.png'
import Img from '../../../../assest/images/home_img.png'
import ButtonBuy from "../../../../assest/Style/ButtonBuy";
import SocialButton from "../../../../assest/Style/SocialButton";
const Home = () =>{
    return(<>
        <div className={'homeSection container'}>
                <img className={'img-fluid my-3'} src={Img} alt={'no img'}/>
        </div>
        <div className={'homeButton mt-4'}>
<div className={'row'}>
    <div className={'col-12'}>
        <div className={'text-center mb-3'}>
            <ButtonBuy link={'/'} text={'Buy yen'} />
        </div>
    </div>
    <div className={'col-12'}>
        <div className={'text-center mt-4'}>
            <div className={'socialicon'}>
                <SocialButton link={'/'} Img={Img1} />
                <SocialButton link={'/'} Img={Img2} />
                <SocialButton link={'/'} Img={Img3}/>
            </div>

        </div>
    </div>

</div>
        </div>
        </>)
}
export default Home;