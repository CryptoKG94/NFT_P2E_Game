import ContractUtils from '../../../utils/contractUtils';
import * as actions from '../../actions';

export const getNFTInfo = () => async (dispatch) => {

  dispatch(actions.getZombieInfo.request(true));
  try {
    const zombiePrice = await ContractUtils.getNFTPrice();
    if (zombiePrice.success) {
      dispatch(actions.getZombieInfo.success(zombiePrice.status));
    } else {
      dispatch(actions.getZombieInfo.failure(zombiePrice.status));
    }
  } catch (err) {
    dispatch(actions.getZombieInfo.failure(err));
  }
};