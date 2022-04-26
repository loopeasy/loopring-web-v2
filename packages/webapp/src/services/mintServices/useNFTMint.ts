import React from "react";
import { MintCommands, mintService } from "./mintService";
import { useModalData } from "stores/router";
import {
  AccountStep,
  NFTMintProps,
  useOpenModals,
} from "@loopring-web/component-lib";
import * as sdk from "@loopring-web/loopring-sdk";
import { useTokenMap } from "stores/token";
import { useAccount } from "stores/account";
import { useTranslation } from "react-i18next";
import { useBtnStatus } from "hooks/common/useBtnStatus";
import { useSystem } from "stores/system";
import { useWalletInfo } from "stores/localStore/walletInfo";
import { useWalletLayer2NFT } from "stores/walletLayer2NFT";
import { LoopringAPI } from "api_wrapper";
import {
  AccountStatus,
  ErrorType,
  Explorer,
  FeeInfo,
  MINT_LIMIT,
  MintReadTradeNFT,
  MintTradeNFT,
  myLog,
  NFTMETA,
  TOAST_TIME,
  UIERROR_CODE,
} from "@loopring-web/common-resources";
import { useWalletLayer2Socket, walletLayer2Service } from "services/socket";
import { connectProvides } from "@loopring-web/web3-provider";
import { checkErrorInfo } from "hooks/useractions/utils";
import { ActionResult, ActionResultCode, DAYS } from "../../defs/common_defs";
import { getTimestampDaysLater } from "../../utils/dt_tools";
import store from "../../stores";

export function useNFTMint<
  Me extends NFTMETA,
  Mi extends MintTradeNFT<I>,
  I,
  C extends FeeInfo
>({
  chargeFeeTokenList,
  isFeeNotEnough,
  checkFeeIsEnough,
  handleFeeChange,
  feeInfo,
  handleTabChange,
  tokenAddress,
}: {
  chargeFeeTokenList: FeeInfo[];
  isFeeNotEnough: boolean;
  checkFeeIsEnough: (isRequiredAPI?: boolean) => void;
  handleFeeChange: (value: FeeInfo) => void;
  feeInfo: FeeInfo;
  tokenAddress: string | undefined;
  handleTabChange: (value: 0 | 1) => void;
}) {
  const subject = React.useMemo(() => mintService.onSocket(), []);
  const { tokenMap, totalCoinMap } = useTokenMap();
  const { exchangeInfo, chainId } = useSystem();
  const { account } = useAccount();
  const { nftMintValue, updateNFTMintData } = useModalData();
  const {
    btnStatus,
    btnInfo,
    enableBtn,
    disableBtn,
    setLabelAndParams,
    resetBtnInfo,
  } = useBtnStatus();
  const { t } = useTranslation("common");
  const [lastRequest, setLastRequest] = React.useState<any>({});
  const { checkHWAddr, updateHW } = useWalletInfo();
  const { page, updateWalletLayer2NFT } = useWalletLayer2NFT();
  const { setShowAccount, setShowNFTMint } = useOpenModals();

  const updateBtnStatus = React.useCallback(
    (error?: ErrorType & any) => {
      resetBtnInfo();
      if (
        !error &&
        nftMintValue.nftMETA.royaltyPercentage !== undefined &&
        Number.isInteger(nftMintValue.nftMETA.royaltyPercentage / 1) &&
        nftMintValue.nftMETA.royaltyPercentage >= 0 &&
        nftMintValue.nftMETA.royaltyPercentage <= 10 &&
        nftMintValue &&
        tokenAddress &&
        nftMintValue.mintData.tradeValue &&
        Number(nftMintValue.mintData.tradeValue) > 0 &&
        Number(nftMintValue.mintData.tradeValue) <= MINT_LIMIT &&
        // (nftMintValue.mintData.image !== undefined ||
        //   nftMintValue.mintData.name !== undefined) &&
        nftMintValue.mintData.fee &&
        nftMintValue.mintData.fee.belong &&
        nftMintValue.mintData.fee.__raw__ &&
        !isFeeNotEnough
      ) {
        enableBtn();
        return;
      }
      if (
        !(
          nftMintValue.nftMETA.royaltyPercentage !== undefined &&
          Number.isInteger(nftMintValue.nftMETA.royaltyPercentage / 1) &&
          nftMintValue.nftMETA.royaltyPercentage >= 0 &&
          nftMintValue.nftMETA.royaltyPercentage <= 10
        )
      ) {
        setLabelAndParams("labelNFTMintNoMetaBtn", {});
      }
      disableBtn();
      myLog("try to disable nftMint btn!");
    },
    [
      isFeeNotEnough,
      resetBtnInfo,
      nftMintValue,
      tokenAddress,
      enableBtn,
      setLabelAndParams,
      disableBtn,
    ]
  );

  React.useEffect(() => {
    updateBtnStatus();
  }, [isFeeNotEnough, nftMintValue, feeInfo]);
  useWalletLayer2Socket({});

  const handleMintDataChange = React.useCallback(
    async (data: Partial<MintReadTradeNFT<I>>) => {
      const { nftMETA, mintData } =
        store.getState()._router_modalData.nftMintValue;
      const buildNFTMeta = { ...nftMETA };
      const buildMint = { ...mintData };
      Reflect.ownKeys(data).map((key) => {
        switch (key) {
          case "tradeValue":
            buildMint.tradeValue = data.tradeValue;
            break;
          case "fee":
            buildMint.fee = data.fee;
            break;
          case "tokenAddress":
            buildMint.tokenAddress = data.tokenAddress;
            break;
        }
      });
      updateNFTMintData({
        mintData: buildMint,
        nftMETA: buildNFTMeta,
      });
    },
    [nftMintValue]
  );
  const resetNFTMINT = React.useCallback(() => {
    checkFeeIsEnough();
    handleMintDataChange({
      fee: feeInfo,
      tokenAddress,
    });
  }, [checkFeeIsEnough, tokenAddress, handleMintDataChange, nftMintValue]);
  const processRequest = React.useCallback(
    async (request: sdk.NFTMintRequestV3, isNotHardwareWallet: boolean) => {
      const { apiKey, connectName, eddsaKey } = account;
      try {
        if (connectProvides.usedWeb3 && LoopringAPI.userAPI) {
          let isHWAddr = checkHWAddr(account.accAddress);

          if (!isHWAddr && !isNotHardwareWallet) {
            isHWAddr = true;
          }
          setLastRequest({ request });
          setShowAccount({
            isShow: true,
            step: AccountStep.NFTMint_In_Progress,
          });
          const response = await LoopringAPI.userAPI?.submitNFTMint(
            {
              request,
              web3: connectProvides.usedWeb3,
              chainId:
                chainId !== sdk.ChainId.GOERLI ? sdk.ChainId.MAINNET : chainId,
              walletType: connectName as sdk.ConnectorNames,
              eddsaKey: eddsaKey.sk,
              apiKey,
              isHWAddr,
            },
            {
              accountId: account.accountId,
              counterFactualInfo: eddsaKey.counterFactualInfo,
            }
          );

          myLog("submitNFTMint:", response);

          if (
            (response as sdk.RESULT_INFO).code ||
            (response as sdk.RESULT_INFO).message
          ) {
            throw response;
          } else if ((response as sdk.TX_HASH_API)?.hash) {
            // Withdraw success
            await sdk.sleep(TOAST_TIME);
            setShowAccount({
              isShow: true,
              step: AccountStep.NFTMint_Success,
              info: {
                hash:
                  Explorer +
                  `tx/${(response as sdk.TX_HASH_API)?.hash}-nftMint`,
              },
            });
            if (isHWAddr) {
              myLog("......try to set isHWAddr", isHWAddr);
              updateHW({ wallet: account.accAddress, isHWAddr });
            }
            walletLayer2Service.sendUserUpdate();
            updateWalletLayer2NFT({ page });
            mintService.emptyData();
            // checkFeeIsEnough();
          }
        }
      } catch (reason: any) {
        const code = checkErrorInfo(reason, isNotHardwareWallet);
        if (code === sdk.ConnectorError.USER_DENIED) {
          setShowAccount({
            isShow: true,
            step: AccountStep.NFTMint_Denied,
          });
          mintService.goMintConfirm();
        } else if (code === sdk.ConnectorError.NOT_SUPPORT_ERROR) {
          setShowAccount({
            isShow: true,
            step: AccountStep.NFTMint_First_Method_Denied,
          });
          mintService.signatureMint(true);
        } else {
          if (
            [102024, 102025, 114001, 114002].includes(
              (reason as sdk.RESULT_INFO)?.code || 0
            )
          ) {
            checkFeeIsEnough(true);
          }

          setShowAccount({
            isShow: true,
            step: AccountStep.NFTMint_Failed,
            error: {
              code: UIERROR_CODE.UNKNOWN,
              msg: reason?.message,
              ...reason,
            },
          });
          mintService.goMintConfirm();
        }
      }
    },
    [
      account,
      checkHWAddr,
      chainId,
      setShowAccount,
      resetNFTMINT,
      updateHW,
      checkFeeIsEnough,
    ]
  );

  const onNFTMintClick = React.useCallback(
    async (_nftMintValue: Partial<Mi>, isFirstTime: boolean = true) => {
      let result: ActionResult = { code: ActionResultCode.NoError };
      if (
        account.readyState === AccountStatus.ACTIVATED &&
        nftMintValue.mintData.tradeValue &&
        tokenAddress &&
        nftMintValue.mintData.nftId &&
        nftMintValue.mintData.fee &&
        nftMintValue.mintData.fee.belong &&
        nftMintValue.mintData.fee.__raw__ &&
        nftMintValue.nftMETA.royaltyPercentage !== undefined &&
        Number.isInteger(nftMintValue.nftMETA.royaltyPercentage / 1) &&
        nftMintValue.nftMETA.royaltyPercentage / 1 >= 0 &&
        nftMintValue.nftMETA.royaltyPercentage / 1 <= 10 &&
        LoopringAPI.userAPI &&
        LoopringAPI.nftAPI &&
        !isFeeNotEnough &&
        exchangeInfo
      ) {
        setShowNFTMint({ isShow: false });
        setShowAccount({
          isShow: true,
          step: AccountStep.NFTMint_WaitForAuth,
        });
        try {
          const { accountId, accAddress, apiKey } = account;
          const fee = sdk.toBig(nftMintValue.mintData.fee.__raw__?.feeRaw ?? 0);
          const feeToken = tokenMap[nftMintValue.mintData.fee.belong];
          const storageId = await LoopringAPI.userAPI.getNextStorageId(
            {
              accountId,
              sellTokenId: feeToken.tokenId,
            },
            apiKey
          );
          const req: sdk.NFTMintRequestV3 = {
            exchange: exchangeInfo.exchangeAddress,
            minterId: accountId,
            minterAddress: accAddress,
            toAccountId: accountId,
            toAddress: accAddress,
            nftType: 0,
            tokenAddress,
            nftId: nftMintValue.mintData.nftId,
            amount: nftMintValue.mintData.tradeValue.toString(),
            maxFee: {
              tokenId: feeToken.tokenId,
              amount: fee.toString(), // TEST: fee.toString(),
            },
            counterFactualNftInfo: {
              nftOwner: account.accAddress,
              nftFactory: sdk.NFTFactory[chainId],
              nftBaseUri: "",
            },
            royaltyPercentage: nftMintValue.nftMETA.royaltyPercentage ?? 0,
            forceToMint: false,
            validUntil: getTimestampDaysLater(DAYS),
            storageId: storageId?.offchainId,
          };
          myLog("onNFTMintClick req:", req);

          processRequest(req, isFirstTime);
        } catch (e: any) {
          // sdk.dumpError400(e);
          // transfer failed
          setShowAccount({
            isShow: true,
            step: AccountStep.NFTMint_Failed,
            error: { code: 400, message: e.message } as sdk.RESULT_INFO,
          });
        }
        return;
      } else {
        result.code = ActionResultCode.DataNotReady;
      }
    },
    [nftMintValue]
  );
  const retryBtn = React.useCallback(
    (isHardwareRetry: boolean = false) => {
      setShowAccount({
        isShow: true,
        step: AccountStep.NFTMint_WaitForAuth,
      });
      processRequest(lastRequest, !isHardwareRetry);
    },
    [lastRequest, processRequest, setShowAccount]
  );

  const nftMintProps: NFTMintProps<Me, Mi, I> = React.useMemo(() => {
    return {
      chargeFeeTokenList,
      isFeeNotEnough,
      handleFeeChange,
      feeInfo,
      metaData: nftMintValue.nftMETA as Me,
      handleMintDataChange,
      onNFTMintClick,
      walletMap: {} as any,
      coinMap: totalCoinMap as any,
      tradeData: nftMintValue.mintData as Mi,
      nftMintBtnStatus: btnStatus,
      btnInfo,
      mintService,
    };
  }, [
    btnInfo,
    btnStatus,
    chargeFeeTokenList,
    feeInfo,
    handleFeeChange,
    handleMintDataChange,
    isFeeNotEnough,
    nftMintValue,
    onNFTMintClick,
    totalCoinMap,
  ]);

  const commonSwitch = React.useCallback(
    async ({ data, status }: { status: MintCommands; data?: any }) => {
      switch (status) {
        // case MintCommands.CompleteIPFS:
        case MintCommands.MintConfirm:
          handleTabChange(1);
          break;
        case MintCommands.SignatureMint:
          handleTabChange(1);
          nftMintProps.onNFTMintClick(nftMintValue as any, data?.isHardware);
          break;
      }
    },
    [nftMintProps]
  );
  React.useEffect(() => {
    const subscription = subject.subscribe((props) => {
      commonSwitch(props);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  React.useEffect(() => {
    if (tokenAddress) {
      handleMintDataChange({ tokenAddress });
    }
  }, [tokenAddress]);

  return {
    nftMintProps,
    retryBtn,
  };
}