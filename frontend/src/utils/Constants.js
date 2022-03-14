export const ContractAddress = "0x181aB2d2F0143cd2046253c56379f7eDb1E9C133";
export const SnRAddress = "0x7fc0E8dD367E927b7D5Cdf9B329F39766F768f8f";
export const YENAddress = "0xbdBC5b6007F510CDB71DA07089E4d0A898AA44Ee";
export const TraitsAddress = "0x8DEC21F34F9cEdD1538327b64121425F1F7061D4";
export const LordAddress = "0x1A67ACD12327B274baE5d874cb8Bbb6B12DeE7E1";

const MAINNET = 250
const TESTNET = 4002

const POLYGON = 137
const MUMBAI = 80001

export const ChainID = 4002

export const CHAIN_NAME = {
    [MAINNET] : 'Fantom Mainnet',
    [TESTNET] : 'Fantom Testnet',
    [MUMBAI] : 'Polygon Testnet',
    [POLYGON] : 'Polgyon Mainnet'
}

export const BASE_BSC_SCAN_URLS = {
    [MAINNET] : 'https://bscscan.com',
    [TESTNET] : 'https://testnet.bscscan.com',
    [MUMBAI] : 'https://mumbai.polygonscan.com',
    [POLYGON] : 'https://polygonscan.com'
}

export const NODE = {
    [TESTNET]: "https://rpc.testnet.fantom.network/",
    [MAINNET]: "https://rpcapi.fantom.network/",
    [MUMBAI] : 'https://matic-mumbai.chainstacklabs.com',
    [POLYGON] : 'https://polygon-rpc.com/'
}

export const NATIVE_CURRENCY = {
    [MAINNET]: {
        name: 'FTM',
        symbol: 'ftm',
        decimals: 18,
    },
    [TESTNET]: {
        name: 'FTM',
        symbol: 'tfm',
        decimals: 18,
    },
    [MUMBAI]: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18,
    },
    [POLYGON]: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18,
    }
}