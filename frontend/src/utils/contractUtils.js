import Contract from 'web3-eth-contract';
import * as Constants from './Constants';
import BigNumber from "bignumber.js";
import { constants } from 'buffer';
import { getBalanceNumber } from '../components/formatBalance';

const Web3 = require('web3');
const SnRContract = require("../contracts/SnRContract.json");
const SnRContractABI = SnRContract["abi"];
const LordContract = require("../contracts/LordContract.json");
const LordContractABI = LordContract["abi"];
const YenContract = require("../contracts/YENContract.json");
const YenContractABI = YenContract["abi"];
const MarketplaceContract = require("../contracts/MarketPlace.json");
const MarketplaceContractABI = MarketplaceContract["abi"];
const BankContract = require("../contracts/BankContract.json");
const BankContractABI = BankContract["abi"];
// MCB
// import { ethers } from "ethers";
//

//#region mint and init functions

export const getBNBDecimals = () => {
    return 18;
}

export const setupNetwork = async () => {
    const provider = window.ethereum
    if (provider) {
        // const chainId = parseInt(process.env.REACT_APP_CHAIN_ID, 10)
        const chainId = Constants.ChainID
        try {
            await provider.request({
                method: 'wallet_addEthereumChain',
                params: [
                    {
                        chainId: `0x${chainId.toString(16)}`,
                        chainName: Constants.CHAIN_NAME[chainId],
                        nativeCurrency: Constants.NATIVE_CURRENCY[chainId],
                        rpcUrls: [Constants.NODE],
                        blockExplorerUrls: [Constants.BASE_BSC_SCAN_URLS[chainId]],
                    },
                ],
            })
            return true
        } catch (error) {
            console.error('Failed to setup the network in Metamask:', error)
            return false
        }
    } else {
        console.error("Can't setup the BSC network on metamask because window.ethereum is undefined")
        return false
    }
}

export const getMintInfo = async (provider) => {

    try {
        if (!provider) {
            if (window.ethereum) {
                const web3 = new Web3(window.ethereum);
                let contract = await new web3.eth.Contract(SnRContractABI, Constants.SnRAddress);
                let price = await contract.methods.MINT_PRICE().call();
                let minted = await contract.methods.minted().call();

                let data = {
                    price: web3.utils.fromWei("" + price),
                    mintCount: minted
                }
                return {
                    success: true,
                    status: data
                }
            }
        } else {
            const web3 = new Web3(provider);
            let contract = await new web3.eth.Contract(SnRContractABI, Constants.SnRAddress);
            let price = await contract.methods.MINT_PRICE().call();
            let minted = await contract.methods.minted().call();

            let data = {
                price: price,
                mintCount: minted
            }
            return {
                success: true,
                status: data
            }
        }

    } catch (err) {
        return {
            success: false,
            status: err.message
        }
    }
}

export const mintNFT = async (provider, address, count, autoStake, useShield) => {

    const web3 = new Web3(provider);
    let contract = await new web3.eth.Contract(SnRContractABI, Constants.SnRAddress)

    try {
        let nftPrice = await contract.methods.MINT_PRICE().call();

        let price = new BigNumber(nftPrice);
        let amount = price.multipliedBy(count);

        await contract.methods.mint(count, autoStake, useShield).send({ from: address, value: amount });
        return {
            success: true,
            status: 'Success'
        }
    } catch (err) {
        return {
            success: false,
            status: err.message
        }
    }
}

export const getMetaData = async (hashVal) => {
    try {
        let response = await fetch(hashVal);
        let responseJson = await response.json();
        // console.log(responseJson.image);

        return responseJson;
    } catch (error) {
        console.error(error);
        return "";
    }
}

export const getAssetInfo = async (provider, address) => {

    const web3 = new Web3(provider);
    let contract = await new web3.eth.Contract(SnRContractABI, Constants.SnRAddress)

    try {
        let data = {
            balance: 0,
            metaData: {}
        };

        const balance = await contract.methods.balanceOf(address).call()

        for (let i = 0; i < balance; i++) {
            const tokenId = await contract.methods.tokenOfOwnerByIndex(address, i).call()
            const dataInfo = await contract.methods.userInfo(address, tokenId).call()
            data.metaData[tokenId] = dataInfo;
        }
        return {
            success: true,
            status: data
        }
    } catch (err) {
        return {
            success: false,
            status: err.message
        }
    }
}
//#endregion

//#region staking

export const fetchStakingReward = async (provider, tokenId) => {

    const web3 = new Web3(provider);
    let contract = await new web3.eth.Contract(LordContractABI, Constants.LordAddress)

    try {
        const result = await contract.methods
            .pendingTokenReward(tokenId)
            .call()

        return {
            success: true,
            status: result
        }
    } catch (err) {
        return {
            success: false,
            status: err.message
        }
    }
}

export const fetchUnstakedInfo = async (provider, account) => {

    const web3 = new Web3(provider);
    let contract = await new web3.eth.Contract(SnRContractABI, Constants.SnRAddress)

    let data = {
        balances: 0,
        tokenIds: [],
        metadatas: []
    }

    try {
        const balance = await contract.methods.balanceOf(account).call()
        for (let i = 0; i < balance; i++) {
            const tokenId = await contract.methods.tokenOfOwnerByIndex(account, i).call()
            const metadata = await contract.methods.tokenTraits(tokenId).call()
            data.tokenIds.push(tokenId)
            data.metadatas.push(metadata)
        }

        data.balances = balance;
        return {
            success: true,
            status: data
        }

    } catch (err) {
        return {
            success: false,
            status: err.message
        }
    }
}

export const fetchStakedInfo = async (provider, account) => {

    const web3 = new Web3(provider);
    let lordContract = await new web3.eth.Contract(LordContractABI, Constants.LordAddress)
    let snrContract = await new web3.eth.Contract(SnRContractABI, Constants.SnRAddress)

    let data = {
        balances: 0,
        tokenIds: [],
        metadatas: [],
        stakeInfo: [],
    }

    try {
        const tokenIds = await lordContract.methods.getStakeUserInfo(account).call()
        let i = 0;
        for (i = 0; i < tokenIds.length; i++) {
            const tokenInfo = await snrContract.methods.tokenTraits(tokenIds[i]).call();
            const reward = await lordContract.methods.pendingTokenReward(tokenIds[i]).call();
            const depositTime = await lordContract.methods.lord(tokenIds[i]).call();
            data.stakeInfo.push({
                depositTime: depositTime.value,
                reward: reward
            })
            data.tokenIds.push(tokenIds[i])
            data.metadatas.push(tokenInfo)
        }

        data.balances = tokenIds.length;

        return {
            success: true,
            status: data
        }

    } catch (err) {
        return {
            success: false,
            status: err.message
        }
    }
}

export const setApprovalForAllToStake = async (provider, account) => {
    const web3 = new Web3(provider);
    let snrContract = await new web3.eth.Contract(SnRContractABI, Constants.SnRAddress)

    try {
        await snrContract.methods.setApprovalForAll(Constants.LordAddress, true).send({ from: account });
        return {
            success: true,
            status: "success"
        }
    } catch (err) {
        return {
            success: false,
            status: "fail"
        }
    }
}

export const stake = async (provider, account, tokenIds) => {
    const web3 = new Web3(provider);
    let lordContract = await new web3.eth.Contract(LordContractABI, Constants.LordAddress)

    try {
        await lordContract.methods.addManyToLord(account, tokenIds).send({ from: account });
        return {
            success: true,
            status: "success"
        }
    } catch (err) {
        return {
            success: false,
            status: err.message
        }
    }
}

export const unStake = async (provider, account, tokenIds, usePortion, useCrossBow, isUnstake) => {
    const web3 = new Web3(provider);
    let lordContract = await new web3.eth.Contract(LordContractABI, Constants.LordAddress)

    try {
        await lordContract.methods.claimManyFromLord(tokenIds, isUnstake, usePortion, useCrossBow).send({ from: account });
        return {
            success: true,
            status: "success"
        }
    } catch (err) {
        return {
            success: false,
            status: err.message
        }
    }
}

export const isApprovedForAllToStake = async (provider, account) => {
    const web3 = new Web3(provider);
    let contract = await new web3.eth.Contract(SnRContractABI, Constants.SnRAddress);

    try {
        let res = await contract.methods.isApprovedForAll(account, Constants.LordAddress).call();
        return {
            success: res,
            status: res
        }
    } catch (err) {
        return {
            success: false,
            status: err.message
        }
    }
}

//#endregion

//#region marketplace

export const isApprovedForAllToMarket = async (provider, account) => {
    const web3 = new Web3(provider);
    let contract = await new web3.eth.Contract(SnRContractABI, Constants.SnRAddress);

    try {
        let res = await contract.methods.isApprovedForAll(account, Constants.MarketPlaceAddress).call();
        return {
            success: res,
            status: res
        }
    } catch (err) {
        return {
            success: false,
            status: err.message
        }
    }
}

export const setApprovalForAllToMarket = async (provider, account) => {
    const web3 = new Web3(provider);
    let snrContract = await new web3.eth.Contract(SnRContractABI, Constants.SnRAddress)

    try {
        await snrContract.methods.setApprovalForAll(Constants.MarketPlaceAddress, true).send({ from: account });
        return {
            success: true,
            status: "success"
        }
    } catch (err) {
        return {
            success: false,
            status: "fail"
        }
    }
}

export const onSale = async (provider, account, tokenId, startPrice) => {
    const web3 = new Web3(provider);
    let contract = await new web3.eth.Contract(MarketplaceContractABI, Constants.MarketPlaceAddress);

    try {
        let price = web3.utils.toWei("" + startPrice);
        console.log('[kg] => price: ', price);
        await contract.methods.createSale(tokenId, price).send({ from: account });
        return {
            success: true,
            status: "success"
        }
    } catch (err) {
        return {
            success: false,
            status: err.message
        }
    }
}

export const fetchMarketplaceInfo = async (provider) => {

    const web3 = new Web3(provider);
    let contract = await new web3.eth.Contract(SnRContractABI, Constants.SnRAddress);
    let marketplaceContract = await new web3.eth.Contract(MarketplaceContractABI, Constants.MarketPlaceAddress)

    try {
        let data = {
            balances: 0,
            tokenIds: [],
            saleInfo: [],
            nftInfo: [],
            floorPrice: 10000000,
            highPrice: 0
        }

        const balance = await contract.methods.balanceOf(Constants.MarketPlaceAddress).call()

        for (let i = 0; i < balance; i++) {
            const tokenId = await contract.methods.tokenOfOwnerByIndex(Constants.MarketPlaceAddress, i).call()
            const nftInfo = await contract.methods.tokenTraits(tokenId).call()
            let saleInfo = await marketplaceContract.methods.getSaleInfo(tokenId).call()

            data.tokenIds.push(tokenId);
            data.nftInfo.push(nftInfo);
            data.saleInfo.push(saleInfo);
            let price = web3.utils.fromWei("" + saleInfo.startPrice);
            if (data.floorPrice > price) data.floorPrice = price;
            if (data.highPrice < price) data.highPrice = price;
        }
        data.balances = balance;
        return {
            success: true,
            status: data
        }
    } catch (err) {
        return {
            success: false,
            status: err.message
        }
    }
}

export const destroySale = async (provider, account, tokenId) => {
    const web3 = new Web3(provider);
    let contract = await new web3.eth.Contract(MarketplaceContractABI, Constants.MarketPlaceAddress);

    try {
        await contract.methods.destroySale(tokenId).send({ from: account });
        return {
            success: true,
            status: "success"
        }
    } catch (err) {
        return {
            success: false,
            status: err.message
        }
    }
}

export const auction = async (provider, account, tokenId, bidPrice) => {
    const web3 = new Web3(provider);
    let contract = await new web3.eth.Contract(MarketplaceContractABI, Constants.MarketPlaceAddress);

    try {
        let price = web3.utils.toWei("" + bidPrice);
        await contract.methods.placeBid(tokenId, price).send({ from: account });
        return {
            success: true,
            status: "success"
        }
    } catch (err) {
        return {
            success: false,
            status: err.message
        }
    }
}

export const confirm = async (provider, account, tokenId) => {
    const web3 = new Web3(provider);
    let contract = await new web3.eth.Contract(MarketplaceContractABI, Constants.MarketPlaceAddress);

    try {
        await contract.methods.performBid(tokenId).send({ from: account });
        return {
            success: true,
            status: "success"
        }
    } catch (err) {
        return {
            success: false,
            status: err.message
        }
    }
}

//#endregion
export const withdraw = async (provider) => {

    const web3 = new Web3(provider);
    let contract = await new web3.eth.Contract(SnRContractABI, Constants.SnRAddress)
    try {
        await contract.methods.withdraw().send();
        return {
            success: true,
        }
    } catch (err) {
        return {
            success: false,
            status: err.message
        }
    }
}

export const setApprovalForYENToMarketplace = async (provider, account) => {
    const web3 = new Web3(provider);
    let yenContract = await new web3.eth.Contract(YenContractABI, Constants.YENAddress)

    try {
        await yenContract.methods.approve(Constants.MarketPlaceAddress, web3.utils.toWei("1000000000")).send({ from: account });
        return {
            success: true,
            status: "success"
        }
    } catch (err) {
        return {
            success: false,
            status: err.message
        }
    }
}

export const isApprovedForYENToMarketplace = async (provider, account) => {
    const web3 = new Web3(provider);
    let yenContract = await new web3.eth.Contract(YenContractABI, Constants.YENAddress)

    try {
        let res = await yenContract.methods.allowance(account, Constants.MarketPlaceAddress).call();
        if (res > 0) {
            return {
                success: true,
                status: true
            }
        } else {
            return {
                success: false,
                status: false
            }
        }
    } catch (err) {
        return {
            success: false,
            status: err.message
        }
    }
}


// #region MCB

export const buyPortions = async (provider, account, amount) => {
    const web3 = new Web3(provider);
    let lordContract = await new web3.eth.Contract(LordContractABI, Constants.LordAddress);

    try {
        console.log("buy portions");
        let res = await lordContract.methods.buyPortions(amount).send({ from: account });
        return {
            success: true,
            status: true
        }
    } catch (err) {
        return {
            success: false,
            status: err.message
        }
    }
}

export const buyCrossbows = async (provider, account, amount, forRonin) => {
    const web3 = new Web3(provider);
    let lordContract = await new web3.eth.Contract(LordContractABI, Constants.LordAddress);

    try {
        console.log("buy crossbow");
        let res = await lordContract.methods.buyCrossBows(amount, forRonin).send({ from: account });
        return {
            success: true,
            status: true
        }
    } catch (err) {
        return {
            success: false,
            status: err.message
        }
    }
}

export const buyShields = async (provider, account, amount) => {
    const web3 = new Web3(provider);
    let snrContract = await new web3.eth.Contract(SnRContractABI, Constants.SnRAddress)

    try {
        console.log("buy shield");
        let res = await snrContract.methods.buyShields(amount).send({ from: account });
        return {
            success: true,
            status: true
        }
    } catch (err) {
        return {
            success: false,
            status: err.message
        }
    }
}

export const setApprovalForYENToStaking = async (provider, account) => {
    const web3 = new Web3(provider);
    let yenContract = await new web3.eth.Contract(YenContractABI, Constants.YENAddress)

    try {
        await yenContract.methods.approve(Constants.LordAddress, web3.utils.fromWei("1000000000")).send({ from: account });
        return {
            success: true,
            status: "success"
        }
    } catch (err) {
        return {
            success: false,
            status: "fail"
        }
    }
}

export const isApprovedForYENToStaking = async (provider, account) => {
    const web3 = new Web3(provider);
    let yenContract = await new web3.eth.Contract(YenContractABI, Constants.YENAddress)

    try {
        let res = await yenContract.methods.allowance(account, Constants.LordAddress).call();
        if (res > 0) {
            return {
                success: true,
                status: true
            }
        } else {
            return {
                success: false,
                status: true
            }
        }
    } catch (err) {
        return {
            success: false,
            status: err.message
        }
    }
}

export const getMerchantInfo = async (provider) => {
    const web3 = new Web3(provider);
    console.log('web3 eth = ', web3.eth)
    let snrContract = await new web3.eth.Contract(SnRContractABI, Constants.SnRAddress);
    let lordContract = await new web3.eth.Contract(LordContractABI, Constants.LordAddress);
    console.log('web3 eth2 = ', lordContract);
    try {
        console.log("getMerchantInfo try");
        let data = {
            portionPrice: 0,
            totalPortions: 0,
            remainPortions: 0,

            crossbowPrice_Ronin: 0,
            totalCrossbows_Ronin: 0,
            remainCrossbows_Ronin: 0,

            crossbowPrice_SM: 0,
            totalCrossbows_SM: 0,
            remainCrossbows_SM: 0,

            shieldPrice: 0,
            totalShields: 0,
            remainShields: 0
        }
       
        const portionPrice = await lordContract.methods.PORTION_PRICE().call();
        const totalPortions = await lordContract.methods.TOTAL_PORTION().call();
        const remainPortions = await lordContract.methods.remainPortions().call();

        data.portionPrice = getBalanceNumber(portionPrice);
        data.totalPortions = totalPortions;
        data.remainPortions = remainPortions;

        const crossbowPrice_Ronin = await lordContract.methods.CROSSBOW_PRICE_RONIN().call();
        const totalCrossbows_Ronin = await lordContract.methods.TOTAL_CROSSBOW_RONIN().call();
        const remainCrossbows_Ronin = await lordContract.methods.remainCrossbows_Ronin().call();

        data.crossbowPrice_Ronin = getBalanceNumber(crossbowPrice_Ronin);
        data.totalCrossbows_Ronin = totalCrossbows_Ronin;
        data.remainCrossbows_Ronin = remainCrossbows_Ronin;

        const crossbowPrice_SM = await lordContract.methods.CROSSBOW_PRICE_SAMURAI().call();
        const totalCrossbows_SM = await lordContract.methods.TOTAL_CROSSBOW_SM().call();
        const remainCrossbows_SM = await lordContract.methods.remainCrossbows_SM().call();

        data.crossbowPrice_SM = getBalanceNumber(crossbowPrice_SM);
        data.totalCrossbows_SM = totalCrossbows_SM;;
        data.remainCrossbows_SM = remainCrossbows_SM;

        const shieldPrice = await snrContract.methods.SHIELD_PRICE().call();
        const totalShields = await snrContract.methods.TOTAL_SHIELD().call();
        const remainShields = await snrContract.methods.remainShields().call();

        data.shieldPrice = getBalanceNumber(shieldPrice);
        data.totalShields = totalShields;
        data.remainShields = remainShields;

        return {
            success: true,
            status: data
        }
    } catch (err) {
        console.log("getMerchantInfo false");
        return {
            success: false,
            status: err.message
        }
    }
}

export const DepositYEN = async (provider, account, poolId, amount) => {
    const web3 = new Web3(provider);
    let bankContract = await new web3.eth.Contract(BankContractABI, Constants.BankAddress);

    try {
        await bankContract.methods.deposit(amount).send({ from: account });
        return {
            success: true,
            status: "success"
        }
    } catch (err) {
        return {
            success: false,
            status: "fail"
        }
    }
}

export const HarvestRewards = async (provider, account) => {
    const web3 = new Web3(provider);
    let bankContract = await new web3.eth.Contract(BankContractABI, Constants.BankAddress);

    try {
        await bankContract.methods.withdraw(0).send({ from: account });
        return {
            success: true,
            status: "success"
        }
    } catch (err) {
        return {
            success: false,
            status: "fail"
        }
    }
    
}

export const WithdrawYEN = async (provider, account, amount) => {
    const web3 = new Web3(provider);
    let bankContract = await new web3.eth.Contract(BankContractABI, Constants.BankAddress);

    try {
        await bankContract.methods.withdraw(amount).send({ from: account });
        return {
            success: true,
            status: "success"
        }
    } catch (err) {
        return {
            success: false,
            status: "fail"
        }
    }
}

// #endregion

const ContractUtils = {
    getBNBDecimals,
    mintNFT,
    getAssetInfo,
    getMintInfo,
    withdraw,

    // MCB
    buyPortions,
    buyCrossbows,
    buyShields,
    isApprovedForYENToStaking,
    setApprovalForYENToStaking,
    getMerchantInfo,
    DepositYEN,
    HarvestRewards,
    WithdrawYEN,
    //

    fetchStakingReward,
    fetchStakedInfo,
    fetchUnstakedInfo,
    setApprovalForAllToStake,
    stake,
    unStake,
    isApprovedForAllToStake,

    setApprovalForAllToMarket,
    isApprovedForAllToMarket,
    isApprovedForYENToMarketplace,
    setApprovalForYENToMarketplace,
    onSale,
    fetchMarketplaceInfo,
    destroySale,
    auction,
    confirm
};

export default ContractUtils;