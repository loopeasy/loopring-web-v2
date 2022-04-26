import { Subject } from "rxjs";
import { create, IPFSHTTPClient } from "ipfs-http-client";
import { IPFSCommands } from "../account/command";
import {
  CustomError,
  ErrorMap,
  IPFS_LOOPRING_SITE,
  UIERROR_CODE,
} from "@loopring-web/common-resources";
import { AddResult } from "ipfs-core-types/types/src/root";
import * as sdk from "@loopring-web/loopring-sdk";

export class IpfsProvides {
  get ipfs(): IPFSHTTPClient | undefined {
    return this._ipfs;
  }
  private _ipfs: IPFSHTTPClient | undefined = undefined;
  async init() {
    try {
      this._ipfs = await create({
        url: `${IPFS_LOOPRING_SITE}`,
      });
      // this._ipfs = await create({
      //   protocol: "https",
      //   host: "ipfs.infura.io",
      //   port: 5001,
      //   headers: {
      //     authorization:
      //       "Basic " +
      //       btoa(
      //         process.env.REACT_APP_INFURA_PROJECT_ID +
      //           ":" +
      //           process.env.REACT_APP_INFURA_PROJECT_SECRET
      //       ),
      //   },
      // });
    } catch (error) {
      console.error("IPFSHTTPClient ERROR ON INIT:", error);
      ipfsService.sendError(new CustomError(ErrorMap.CREATE_IPFS_ERROR));
      // setIpfsInitError(error);
    }
    return this._ipfs;
  }
  stop() {
    if (this._ipfs) {
      try {
        this._ipfs = undefined;
        // this._ipfs
        //   .stop()
        //   .catch((err) => console.error("IPFSHTTPClient ERROR ON STOP:", err));
      } catch (err) {
        console.error("IPFSHTTPClient ERROR ON STOP:", err as any);
      }
    }
  }
}

const subject = new Subject<{
  status: keyof typeof IPFSCommands;
  data?: {
    uniqueId?: string;
    [key: string]: any;
  };
}>();

export const ipfsService = {
  sendError: (error: CustomError) => {
    subject.next({
      status: IPFSCommands.ErrorGetIpfs,
      data: {
        error: error,
      },
    });
  },
  addJSONStringify: async ({
    ipfs,
    str,
    uniqueId,
  }: {
    ipfs: IPFSHTTPClient;
    str: string;
    uniqueId: string;
  }) => {
    if (ipfs) {
      try {
        const data = await ipfs.add(str); //callIpfs({ ipfs, cmd, opts });
        subject.next({
          status: IPFSCommands.IpfsResult,
          data: { ...data, uniqueId },
        });
      } catch (error) {
        subject.next({
          status: IPFSCommands.IpfsResult,
          data: {
            code: UIERROR_CODE.ADD_IPFS_ERROR,
            ...(error as any),
            uniqueId,
          },
        });
      }
    } else {
      subject.next({
        status: IPFSCommands.ErrorGetIpfs,
        data: {
          uniqueId,
          error: {
            code: UIERROR_CODE.NO_IPFS_INSTANCE,
            message: "IPFSHTTPClient is undefined",
          } as sdk.RESULT_INFO,
        },
      });
    }
  },
  addFile: async ({
    ipfs,
    file,
    uniqueId,
  }: {
    ipfs: IPFSHTTPClient | undefined;
    file: File;
    uniqueId: string;
  }) => {
    if (ipfs) {
      try {
        const data: AddResult = await ipfs.add({ content: file.stream() }); //callIpfs({ ipfs, cmd, opts });
        subject.next({
          status: IPFSCommands.IpfsResult,
          data: { ...data, uniqueId, file },
        });
      } catch (error) {
        subject.next({
          status: IPFSCommands.ErrorGetIpfs,
          data: {
            error: {
              code: UIERROR_CODE.ADD_IPFS_ERROR,
              ...(error as any),
            },
            uniqueId,
          },
        });
      }
    } else {
      subject.next({
        status: IPFSCommands.ErrorGetIpfs,
        data: {
          uniqueId,
          error: {
            code: UIERROR_CODE.NO_IPFS_INSTANCE,
            message: "IPFSHTTPClient is undefined",
          },
        },
      });
    }
  },
  addJSON: async ({
    ipfs,
    json,
    uniqueId,
  }: {
    ipfs: IPFSHTTPClient | undefined;
    json: string;
    uniqueId: string;
  }) => {
    if (ipfs) {
      try {
        const data: AddResult = await ipfs.add(json); //callIpfs({ ipfs, cmd, opts });
        subject.next({
          status: IPFSCommands.IpfsResult,
          data: { ...data, uniqueId },
        });
      } catch (error) {
        subject.next({
          status: IPFSCommands.ErrorGetIpfs,
          data: {
            error: {
              code: UIERROR_CODE.ADD_IPFS_ERROR,
              ...(error as any),
            },
            uniqueId,
          },
        });
      }
    } else {
      subject.next({
        status: IPFSCommands.ErrorGetIpfs,
        data: {
          uniqueId,
          error: {
            code: UIERROR_CODE.NO_IPFS_INSTANCE,
            message: "IPFSHTTPClient is undefined",
          },
        },
      });
    }
  },

  // clearMessages: () => subject.next(),
  onSocket: () => subject.asObservable(),
};
// port: 5001,
// protocol: "https",
// headers: {
//   authorization:
//     "Basic " +
//     btoa(
//       process.env.REACT_APP_INFURA_PROJECT_ID +
//         ":" +
//         process.env.REACT_APP_INFURA_PROJECT_SECRET
//     ),
// },