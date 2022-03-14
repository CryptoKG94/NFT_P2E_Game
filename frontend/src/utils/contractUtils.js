import Contract from 'web3-eth-contract';
import * as Constants from './Constants';
import BigNumber from "bignumber.js";
import { constants } from 'buffer';

const Web3 = require('web3');
const SnRContract = require("../contracts/SnRContract.json");
const SnRContractABI = SnRContract["abi"];
const LordContract = require("../contracts/LordContract.json");
const LordContractABI = LordContract["abi"];

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

const ContractUtils = {
    getBNBDecimals,
    mintNFT,
    getAssetInfo,
    getNFTPrice,
    withdraw
};

export default ContractUtils;