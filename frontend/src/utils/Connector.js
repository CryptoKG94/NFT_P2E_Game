import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";

export const injected = new InjectedConnector({
    supportedChainIds: [1, 2, 3, 4, 5, 56, 97, 250, 4002],
});

export const walletconnect = new WalletConnectConnector({
    rpc: {
        56: "https://bsc-dataseed4.binance.org/",
        4002: "https://rpc.testnet.fantom.network/",
        250: "https://rpcapi.fantom.network/"
    },
    qrcode: true,
    pollingInterval: 12000,
});
