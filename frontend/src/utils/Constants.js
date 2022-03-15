export const ContractAddress = "0x181aB2d2F0143cd2046253c56379f7eDb1E9C133";
export const YENAddress = "0x096E08a74FD4C72a7A1D1ed6e228307180a4cB00";
export const TraitsAddress = "0x9023A6A797AE09Ba7de65b3D7e5b53c2e67Fc75F";
export const SnRAddress = "0xe4068C127eB62554724211728652f84f128dA1A1";
export const LordAddress = "0x095E1B57f12e4935949f190808766D70365c8eab";

const MAINNET = 250
const TESTNET = 4002

const BSC = 56
const BSCTEST = 97
const POLYGON = 137
const MUMBAI = 80001

export const ChainID = BSCTEST

export const CHAIN_NAME = {
    [MAINNET] : 'Fantom Mainnet',
    [TESTNET] : 'Fantom Testnet',
    [MUMBAI] : 'Polygon Testnet',
    [POLYGON] : 'Polgyon Mainnet',
    [BSCTEST] : 'BSC Testnet',
    [BSC] : 'BSC Mainnet'
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
    [POLYGON] : 'https://polygon-rpc.com/',
    [BSC] : 'https://bsc-dataseed1.binance.org/',
    [BSCTEST] : 'https://data-seed-prebsc-1-s1.binance.org:8545/'
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
    },
    [BSCTEST]: {
        name: 'BNB',
        symbol: 'BNB',
        decimals: 18,
    }
}