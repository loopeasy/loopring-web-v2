import Web3 from "web3";
import { walletServices } from "./walletServices";

export enum Commands {
  ConnectWallet = "ConnectWallet",
  DisConnect = "DisConnect",
  ChangeNetwork = "ChangeNetwork",
  Processing = "Processing",
  Error = "Error",
}
export enum ErrorType {
  FailedConnect = "FailedConnect",
}

export enum ProcessingType {
  waiting = "waiting",
  nextStep = "nextStep",
}

export const ExtensionSubscribe = (provider: any, web3: Web3) => {
  if (provider) {
    provider.on("accountsChanged", (accounts: Array<string>) => {
      if (accounts.length) {
        walletServices.sendConnect(web3, provider);
      } else {
        walletServices.sendDisconnect(-1, "disconnect for no account");
      }
    });
    provider.on("chainChanged", (chainId: number) => {
      walletServices.sendConnect(web3, provider);
    });
    provider.on("disconnect", (code: number, reason: string) => {
      walletServices.sendDisconnect(code, reason);
    });
  }
};

export const ExtensionUnsubscribe = async (provider: any) => {
  if (provider && typeof provider.removeAllListeners === "function") {
    // provider.removeAllListeners('accountsChanged');
    // provider.removeAllListeners('chainChanged');
    // provider.removeAllListeners('disconnect');
    await provider.removeAllListeners();
  }
};
