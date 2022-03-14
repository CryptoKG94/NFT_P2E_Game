import { 
    createAction as action, 
    createAsyncAction as asyncAction 
} from 'typesafe-actions';

export const getZombieInfo = asyncAction(
    'GET_ZOMBIE_INFO',
    'GET_ZOMBIE_INFO_SUCCESS',
    'GET_ZOMBIE_INFO_FAIL'
)();

export const mintNFT = asyncAction(
    'MINT_NFT',
    'MINT_NFT_SUCCESS',
    'MINT_NFT_FAIL'
)();