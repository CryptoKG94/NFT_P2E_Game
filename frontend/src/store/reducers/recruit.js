import { getType } from 'typesafe-actions';
import * as actions from '../actions';
import { initEntityState, entityLoadingStarted, entityLoadingSucceeded, entityLoadingFailed } from '../utils';

const initZombieInfo = {
    price: 0,
    genType: 0,
    total: 0,
    remain: 0
}

export const defaultState = {
    zombieInfo: initEntityState(initZombieInfo),
};

const states = (state = defaultState, action) => {
    switch (action.type) {

        case getType(actions.getZombieInfo.request):
            return { ...state, zombieInfo: entityLoadingStarted(state.zombieInfo, action.payload) };
        case getType(actions.getZombieInfo.success):
            return { ...state, zombieInfo: entityLoadingSucceeded(state.zombieInfo, action.payload) };
        case getType(actions.getZombieInfo.failure):
            return { ...state, zombieInfo: entityLoadingFailed(state.zombieInfo) };

        default:
            return state;
    }
};

export default states;
