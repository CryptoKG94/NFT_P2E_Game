import { 
    createAction as action, 
    createAsyncAction as asyncAction 
} from 'typesafe-actions';

export const getNFTInfo = asyncAction(
    'GET_NFT_INFO',
    'GET_NFT_INFO_SUCCESS',
    'GET_NFT_INFO_FAIL'
)();

export const mintNFT = asyncAction(
    'MINT_NFT',
    'MINT_NFT_SUCCESS',
    'MINT_NFT_FAIL'
)();