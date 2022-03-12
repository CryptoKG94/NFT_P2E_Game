import React from 'react';
import './style.css';
import Backbutton from "../../assest/Style/Backbutton";
import ButtonBuy from "../../assest/Style/Navbutton";
import ConnectButton from "../../assest/Style/ConnectButton";
import Img from '../../assest/images/6.png';
const Stake = () =>{
    return(<>
        <div className={'recruit stack'}>
            <div className={'displayRecruit mt-4'}>
                <div className={'row container recruitButton'}>
                    <div className={'col-4 text-center'}>
                        <Backbutton link={'/'} />
                    </div>
                    <div className={'col-4 text-center'}>
                        <ButtonBuy link={'/'} text={'Stake'} />
                    </div>
                    <div className={'col-4 text-center'}>
                        <ConnectButton link={'/'} text={'connect wallet'} />
                    </div>
                </div>
            </div>

            <div className={'blackGlass mt-5'}>
<div className={'StackV container'}>
    <div className={'stackDiv'}>
        <div className={'stake'}>Stack - 30</div>
        <div className={'stake'}>unStack - 30</div>
    </div>
    <div className={'d-flex justify-content-center align-items-center'}>
        <ConnectButton link={'/'} text={'buy yen'} />
        <ConnectButton link={'/'} text={'buy yen & unstake'} />
    </div>

</div>

<div className={'my-5'}>
    <div className={'textStake'}>
        you can only unstake if ronin collected at least 2$ bribe
    </div>
    <div className={'d-flex justify-content-sm-between align-items-center'}>
        <div className={'stakes'}>ronin - 12</div>
        <div className={'stakes'}>select all</div>
    </div>
    <div className={'row m-4'}>
        <div className={'col-lg-2 col-md-3 col-sm-4'}>
            <div className={'stackeImg'}>
                <img width='80' src={Img} alt={'/'}/>
                <div className={'stakeText'}>#1.6541098641</div>
            </div>
        </div>
        <div className={'col-lg-2 col-md-3 col-sm-4'}>
            <div className={'stackeImg'}>
                <img width='80' src={Img} alt={'/'}/>
                <div className={'stakeText'}>#1.6541098641</div>
            </div>
        </div>
        <div className={'col-lg-2 col-md-3 col-sm-4'}>
            <div className={'stackeImg'}>
                <img width='80' src={Img} alt={'/'}/>
                <div className={'stakeText'}>#1.6541098641</div>
            </div>
        </div>
        <div className={'col-lg-2 col-md-3 col-sm-4'}>
            <div className={'stackeImg'}>
                <img width='80' src={Img} alt={'/'}/>
                <div className={'stakeText'}>#1.6541098641</div>
            </div>
        </div>
        <div className={'col-lg-2 col-md-3 col-sm-4'}>
            <div className={'stackeImg'}>
                <img width='80' src={Img} alt={'/'}/>
                <div className={'stakeText'}>#1.6541098641</div>
            </div>
        </div>
        <div className={'col-lg-2 col-md-3 col-sm-4'}>
            <div className={'stackeImg'}>
                <img width='80' src={Img} alt={'/'}/>
                <div className={'stakeText'}>#1.6541098641</div>
            </div>
        </div>
        <div className={'col-lg-2 col-md-3 col-sm-4'}>
            <div className={'stackeImg'}>
                <img width='80' src={Img} alt={'/'}/>
                <div className={'stakeText'}>#1.6541098641</div>
            </div>
        </div>

    </div>
    <div className={'d-flex justify-content-sm-between align-items-center'}>
        <div className={'stakes'}>samurai</div>
        <div className={'stakes'}>select all</div>
    </div>
    <div className={'row m-4'}>
        <div className={'col-lg-2 col-md-3 col-sm-4 col-xs-6'}>
            <div className={'stackeImg'}>
                <img width='80' src={Img} alt={'/'}/>
                <div className={'stakeText'}>#1.6541098641</div>
            </div>
        </div>
        <div className={'col-lg-2 col-md-3 col-sm-4 col-xs-6'}>
            <div className={'stackeImg'}>
                <img width='80' src={Img} alt={'/'}/>
                <div className={'stakeText'}>#1.6541098641</div>
            </div>
        </div>

    </div>
</div>

            </div>


        </div>
    </>)
}
export default Stake;