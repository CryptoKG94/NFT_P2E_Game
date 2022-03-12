import React from 'react';
import './style.css';
import Backbutton from "../../assest/Style/Backbutton";
import ButtonBuy from "../../assest/Style/Navbutton";
import ConnectButton from "../../assest/Style/ConnectButton";
import Img from '../../assest/images/img1.png'
import Img1 from '../../assest/images/img2.png'
const Recruit = () =>{
    return(<>
<div className={'recruit '}>
    <div className={'displayRecruit mt-4'}>
        <div className={'row container recruitButton'}>
            <div className={'col-4 text-center'}>
                <Backbutton link={'/'} />
            </div>
            <div className={'col-4 text-center'}>
                <ButtonBuy link={'/'} text={'Recruit'} />
            </div>
            <div className={'col-4 text-center'}>
                <ConnectButton link={'/'} text={'connect wallet'} />
            </div>
        </div>
    </div>
    <div className={'container'}>
        <div className={'blackGlass mt-5'}>
<div>


 <div className={'ParaRecruit'}>
a violet battle now pits the last human survivors against the <span className={'redSpan'}>Ronin</span> who are trying to steal the $virus samples in order to contaminate the entire human race.
     <br/> the <span className={'greenSpan'}>Samurai</span> will do anything to survive and kill any zombie who tries to oppose them and infiltrate the lab !
 </div>
            <div className={'GenContainer my-5'}>
                <div className={'buttonGen'}>
gen-0
                </div>
                <div className={'buttonGen'}>
gen-1
                </div>
                <div className={'buttonGen1'}>
gen-2
                </div>
            </div>

    <div className={'genMintue'}>
        0 / 3000 mintue
        <br/>
        Connect your wallet first
    </div>

    <div className={'text-center my-4'}>
        <img width={100} src={Img} alt={'/'}/>
        <img width={100} src={Img1} alt={'/'}/>
    </div>
</div>
        </div>

    </div>



</div>
        </>)
}
export default Recruit;