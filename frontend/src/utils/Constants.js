export const ContractAddress = "0x181aB2d2F0143cd2046253c56379f7eDb1E9C133";
export const YENAddress = "0xB6e19D30bB42C28B925d67F3cb1dD65312547A01";
export const TraitsAddress = "0xcfB16c186f95A4495d8924492b78b551A949005C";
export const SnRAddress = "0x8A2e48e4201b31D35FC410C063917E41890cAfC9";
export const LordAddress = "0x8C6C7D628DbF631523B33634E8668e0EE20D6FCA";

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