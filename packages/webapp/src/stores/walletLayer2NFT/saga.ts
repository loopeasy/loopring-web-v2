import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import { getWalletLayer2NFTStatus, updateWalletLayer2NFT } from "./reducer";
import { LoopringAPI } from "api_wrapper";
import store from "../index";

export const NFTLimit = 12;

const getWalletLayer2NFTBalance = async <R extends { [key: string]: any }>({
  page,
}: {
  page: number;
}) => {
  const offset = (page - 1) * NFTLimit;
  const { accountId, apiKey } = store.getState().account;
  if (apiKey && accountId && LoopringAPI.userAPI) {
    let { userNFTBalances, totalNum } =
      await LoopringAPI.userAPI.getUserNFTBalances(
        {
          accountId: accountId,
          limit: NFTLimit,
          offset,
          // @ts-ignore
          metadata: true,
        },
        apiKey
      );
    return {
      walletLayer2NFT: userNFTBalances ?? [],
      total: totalNum,
      page,
    };
  }
  return {};
};

export function* getPostsSaga({ payload: { page = 1 } }: any) {
  try {
    // @ts-ignore
    const walletLayer2NFT: any = yield call(getWalletLayer2NFTBalance, {
      page,
    });
    yield put(getWalletLayer2NFTStatus({ ...walletLayer2NFT }));
  } catch (err) {
    yield put(getWalletLayer2NFTStatus(err));
  }
}

export function* walletLayer2NFTSaga() {
  yield all([takeLatest(updateWalletLayer2NFT, getPostsSaga)]);
}

export const walletLayer2NFTFork = [fork(walletLayer2NFTSaga)];
