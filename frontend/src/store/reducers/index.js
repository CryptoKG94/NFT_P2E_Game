import { combineReducers } from 'redux';
import recruitReducer from './recruit';

export const rootReducer = combineReducers({
  recruit: recruitReducer,
});

const reducers = (state, action) => rootReducer(state, action);

export default reducers;