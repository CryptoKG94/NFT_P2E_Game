import ContractUtils from '../../../utils/contractUtils';
import * as actions from '../../actions';

export const getNFTInfo = (provider) => async (dispatch) => {

  dispatch(actions.getNFTInfo.request(true));
  try {
    const nftInfo = await ContractUtils.getMintInfo(provider);
    if (nftInfo.success ) {
      dispatch(actions.getNFTInfo.success(nftInfo.status));
    } else {
      dispatch(actions.getNFTInfo.failure(nftInfo.status));
    }
  } catch (err) {
    dispatch(actions.getNFTInfo.failure(err));
  }
};