import Contract from 'web3-eth-contract';
import * as Constants from './Constants';
import BigNumber from "bignumber.js";
import { constants } from 'buffer';

const Web3 = require('web3');
const SnRContract = require("../contracts/SnRContract.json");
const SnRContractABI = SnRContract["abi"];
const LordContract = require("../contracts/LordContract.json");
const LordContractABI = LordContract["abi"];
const YenContract = require("../contracts/YENContract.json");
const YenContractABI = YenContract["abi"];

// MCB

//

let walletProvider = null;
let walletAddress = "";

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

export const getNFTPrice = async (provider, address) => {

    try {
        const web3 = new Web3(provider);
        let contract = await new web3.eth.Contract(SnRContractABI, Constants.SnRAddress)

        let price = await contract.methods.MINT_PRICE().call();

        return {
            success: true,
            status: web3.utils.fromWei("" + price)
        }

    } catch (err) {
        return {
            success: false,
            status: err.message
        }
    }
}

export const mintNFT = async (provider, address, count) => {

    const web3 = new Web3(provider);
    let contract = await new web3.eth.Contract(SnRContractABI, Constants.SnRAddress)

    try {
        let nftPrice = await contract.methods.MINT_PRICE().call();

        let price = new BigNumber(nftPrice);
        let amount = price.multipliedBy(count);

        await contract.methods.mint(count, false).send({ from: address, value: amount });
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

export const fetchStakingReward = async (provider, account) => {

    const web3 = new Web3(provider);
    let contract = await new web3.eth.Contract(LordContractABI, Constants.LordAddress)

    try {
        const result = await contract.methods
            .pendingTotalReward(account)
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
        metadatas: []
    }

    try {
        const tokenIds = await lordContract.methods.getStakeUserInfo(account).call()
        let a = 0;
        for (a = 0; a < tokenIds.length; a++) {
            const tokenInfo = await snrContract.methods.tokenTraits(tokenIds[a]).call()
            data.tokenIds.push(tokenIds[a])
            data.metadatas.push(tokenInfo)
        }

        data.balances = tokenIds.length;

        return {
            success: true,
            status: data
        }

    } catch(err) {
        return {
            success: false,
            status: err.message
        }
    }
}

export const setApprovalForAll = async (provider, account) => {
    const web3 = new Web3(provider);
    let snrContract = await new web3.eth.Contract(SnRContractABI, Constants.SnRAddress)

    try {
        await snrContract.methods.setApprovalForAll(Constants.LordAddress, true);
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
        await lordContract.methods.addManyToLord(account, tokenIds).send({from: account});
        return {
            success: true,
            status: "success" 
        }
    } catch(err) {
        return {
            success: false,
            status: err.message
        }
    }
}

export const unStake = async (provider, account, tokenIds, isUnstake) => {
    const web3 = new Web3(provider);
    let lordContract = await new web3.eth.Contract(LordContractABI, Constants.LordAddress)

    try {
        await lordContract.methods.claimManyFromLord(tokenIds, isUnstake).send({from: account});
        return {
            success: true,
            status: "success" 
        }
    } catch(err) {
        return {
            success: false,
            status: err.message
        }
    }
}

export const isApprovedForAll = async (provider, account) => {
    const web3 = new Web3(provider);
    let lordContract = await new web3.eth.Contract(LordContractABI, Constants.LordAddress);

    try {
        let res = await lordContract.methods.isApprovedForAll(account, Constants.LordAddress);
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

// MCB

//

const ContractUtils = {
    getBNBDecimals,
    mintNFT,
    getAssetInfo,
    getNFTPrice,
    withdraw,

    fetchStakingReward,
    fetchStakedInfo,
    fetchUnstakedInfo,
    setApprovalForAll,
    stake,
    unStake,
    isApprovedForAll,
};

export default ContractUtils;