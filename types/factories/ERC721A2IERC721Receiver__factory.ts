/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import { Provider } from "@ethersproject/providers";
import type {
  ERC721A2IERC721Receiver,
  ERC721A2IERC721ReceiverInterface,
} from "../ERC721A2IERC721Receiver";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "onERC721Received",
    outputs: [
      {
        internalType: "bytes4",
        name: "",
        type: "bytes4",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export class ERC721A2IERC721Receiver__factory {
  static readonly abi = _abi;
  static createInterface(): ERC721A2IERC721ReceiverInterface {
    return new utils.Interface(_abi) as ERC721A2IERC721ReceiverInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ERC721A2IERC721Receiver {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as ERC721A2IERC721Receiver;
  }
}