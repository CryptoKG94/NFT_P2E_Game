import { getType } from 'typesafe-actions';
import * as actions from '../actions';
import { initEntityState, entityLoadingStarted, entityLoadingSucceeded, entityLoadingFailed } from '../utils';

const initMintInfo = {
    price: 0,
    mintCount: 0
}

export const defaultState = {
    mintInfo: initEntityState(initMintInfo),
};

const states = (state = defaultState, action) => {
    switch (action.type) {

        case getType(actions.getNFTInfo.request):
            return { ...state, mintInfo: entityLoadingStarted(state.mintInfo, action.payload) };
        case getType(actions.getNFTInfo.success):
            return { ...state, mintInfo: entityLoadingSucceeded(state.mintInfo, action.payload) };
        case getType(actions.getNFTInfo.failure):
            return { ...state, mintInfo: entityLoadingFailed(state.mintInfo) };

        default:
            return state;
    }
};

export default states;
