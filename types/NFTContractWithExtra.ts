/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PayableOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import { Listener, Provider } from "@ethersproject/providers";
import { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "./common";

export declare namespace ERC721ExtraData {
  export type DataStruct = {
    mintPaused: boolean;
    frozenURI: boolean;
    presaleStart: BigNumberish;
    presaleEnd: BigNumberish;
    maxSupply: BigNumberish;
    presalePrice: BigNumberish;
    salePrice: BigNumberish;
    maxMintTx: BigNumberish;
    maxMintPresale: BigNumberish;
    maxMintSale: BigNumberish;
  };

  export type DataStructOutput = [
    boolean,
    boolean,
    number,
    number,
    number,
    BigNumber,
    BigNumber,
    number,
    number,
    number
  ] & {
    mintPaused: boolean;
    frozenURI: boolean;
    presaleStart: number;
    presaleEnd: number;
    maxSupply: number;
    presalePrice: BigNumber;
    salePrice: BigNumber;
    maxMintTx: number;
    maxMintPresale: number;
    maxMintSale: number;
  };
}

export interface NFTContractWithExtraInterface extends utils.Interface {
  contractName: "NFTContractWithExtra";
  functions: {
    "approve(address,uint256)": FunctionFragment;
    "balanceOf(address)": FunctionFragment;
    "baseURI()": FunctionFragment;
    "burn(uint256)": FunctionFragment;
    "callers(address)": FunctionFragment;
    "extraDataToUint256((bool,bool,uint32,uint32,uint32,uint64,uint64,uint8,uint8,uint8))": FunctionFragment;
    "getApproved(uint256)": FunctionFragment;
    "getExtraData()": FunctionFragment;
    "isApprovedForAll(address,address)": FunctionFragment;
    "merkleRoot()": FunctionFragment;
    "name()": FunctionFragment;
    "numberMinted(address)": FunctionFragment;
    "owner()": FunctionFragment;
    "ownerOf(uint256)": FunctionFragment;
    "parts(uint256)": FunctionFragment;
    "presaleMint(uint256,address,bytes32[])": FunctionFragment;
    "renounceOwnership()": FunctionFragment;
    "safeTransferFrom(address,address,uint256)": FunctionFragment;
    "saleMint(uint256,address)": FunctionFragment;
    "setApprovalForAll(address,bool)": FunctionFragment;
    "setBaseURI(string)": FunctionFragment;
    "setConfig(uint256)": FunctionFragment;
    "setMerkleRoot(bytes32)": FunctionFragment;
    "setUnrevealURI(string)": FunctionFragment;
    "shareETHPart(bool)": FunctionFragment;
    "shareTokenPart(bool,address)": FunctionFragment;
    "supportsInterface(bytes4)": FunctionFragment;
    "symbol()": FunctionFragment;
    "tokenURI(uint256)": FunctionFragment;
    "totalMinted()": FunctionFragment;
    "totalSupply()": FunctionFragment;
    "transferFrom(address,address,uint256)": FunctionFragment;
    "transferOwnership(address)": FunctionFragment;
    "unrevealURI()": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "approve",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "balanceOf", values: [string]): string;
  encodeFunctionData(functionFragment: "baseURI", values?: undefined): string;
  encodeFunctionData(functionFragment: "burn", values: [BigNumberish]): string;
  encodeFunctionData(functionFragment: "callers", values: [string]): string;
  encodeFunctionData(
    functionFragment: "extraDataToUint256",
    values: [ERC721ExtraData.DataStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "getApproved",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getExtraData",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "isApprovedForAll",
    values: [string, string]
  ): string;
  encodeFunctionData(
    functionFragment: "merkleRoot",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "name", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "numberMinted",
    values: [string]
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "ownerOf",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "parts", values: [BigNumberish]): string;
  encodeFunctionData(
    functionFragment: "presaleMint",
    values: [BigNumberish, string, BytesLike[]]
  ): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "safeTransferFrom",
    values: [string, string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "saleMint",
    values: [BigNumberish, string]
  ): string;
  encodeFunctionData(
    functionFragment: "setApprovalForAll",
    values: [string, boolean]
  ): string;
  encodeFunctionData(functionFragment: "setBaseURI", values: [string]): string;
  encodeFunctionData(
    functionFragment: "setConfig",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setMerkleRoot",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "setUnrevealURI",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "shareETHPart",
    values: [boolean]
  ): string;
  encodeFunctionData(
    functionFragment: "shareTokenPart",
    values: [boolean, string]
  ): string;
  encodeFunctionData(
    functionFragment: "supportsInterface",
    values: [BytesLike]
  ): string;
  encodeFunctionData(functionFragment: "symbol", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "tokenURI",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "totalMinted",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "totalSupply",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "transferFrom",
    values: [string, string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "unrevealURI",
    values?: undefined
  ): string;

  decodeFunctionResult(functionFragment: "approve", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "balanceOf", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "baseURI", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "burn", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "callers", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "extraDataToUint256",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getApproved",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getExtraData",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isApprovedForAll",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "merkleRoot", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "name", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "numberMinted",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "ownerOf", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "parts", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "presaleMint",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "safeTransferFrom",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "saleMint", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "setApprovalForAll",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "setBaseURI", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "setConfig", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "setMerkleRoot",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setUnrevealURI",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "shareETHPart",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "shareTokenPart",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "supportsInterface",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "symbol", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "tokenURI", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "totalMinted",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "totalSupply",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferFrom",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "unrevealURI",
    data: BytesLike
  ): Result;

  events: {
    "Approval(address,address,uint256)": EventFragment;
    "ApprovalForAll(address,address,bool)": EventFragment;
    "BaseURIUpdated(string)": EventFragment;
    "ConfigUpdated(uint256)": EventFragment;
    "ConsecutiveTransfer(uint256,uint256,address,address)": EventFragment;
    "MerkleRootUpdated(bytes32)": EventFragment;
    "OwnershipTransferred(address,address)": EventFragment;
    "SharedETHPart(bool)": EventFragment;
    "SharedTokenPart(bool)": EventFragment;
    "Transfer(address,address,uint256)": EventFragment;
    "UnrevealURIUpdated(string)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "Approval"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "ApprovalForAll"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "BaseURIUpdated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "ConfigUpdated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "ConsecutiveTransfer"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "MerkleRootUpdated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "OwnershipTransferred"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "SharedETHPart"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "SharedTokenPart"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Transfer"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "UnrevealURIUpdated"): EventFragment;
}

export type ApprovalEvent = TypedEvent<
  [string, string, BigNumber],
  { owner: string; approved: string; tokenId: BigNumber }
>;

export type ApprovalEventFilter = TypedEventFilter<ApprovalEvent>;

export type ApprovalForAllEvent = TypedEvent<
  [string, string, boolean],
  { owner: string; operator: string; approved: boolean }
>;

export type ApprovalForAllEventFilter = TypedEventFilter<ApprovalForAllEvent>;

export type BaseURIUpdatedEvent = TypedEvent<[string], { uri: string }>;

export type BaseURIUpdatedEventFilter = TypedEventFilter<BaseURIUpdatedEvent>;

export type ConfigUpdatedEvent = TypedEvent<[BigNumber], { conf: BigNumber }>;

export type ConfigUpdatedEventFilter = TypedEventFilter<ConfigUpdatedEvent>;

export type ConsecutiveTransferEvent = TypedEvent<
  [BigNumber, BigNumber, string, string],
  { fromTokenId: BigNumber; toTokenId: BigNumber; from: string; to: string }
>;

export type ConsecutiveTransferEventFilter =
  TypedEventFilter<ConsecutiveTransferEvent>;

export type MerkleRootUpdatedEvent = TypedEvent<[string], { root: string }>;

export type MerkleRootUpdatedEventFilter =
  TypedEventFilter<MerkleRootUpdatedEvent>;

export type OwnershipTransferredEvent = TypedEvent<
  [string, string],
  { previousOwner: string; newOwner: string }
>;

export type OwnershipTransferredEventFilter =
  TypedEventFilter<OwnershipTransferredEvent>;

export type SharedETHPartEvent = TypedEvent<[boolean], { isSalePart: boolean }>;

export type SharedETHPartEventFilter = TypedEventFilter<SharedETHPartEvent>;

export type SharedTokenPartEvent = TypedEvent<
  [boolean],
  { isSalePart: boolean }
>;

export type SharedTokenPartEventFilter = TypedEventFilter<SharedTokenPartEvent>;

export type TransferEvent = TypedEvent<
  [string, string, BigNumber],
  { from: string; to: string; tokenId: BigNumber }
>;

export type TransferEventFilter = TypedEventFilter<TransferEvent>;

export type UnrevealURIUpdatedEvent = TypedEvent<[string], { uri: string }>;

export type UnrevealURIUpdatedEventFilter =
  TypedEventFilter<UnrevealURIUpdatedEvent>;

export interface NFTContractWithExtra extends BaseContract {
  contractName: "NFTContractWithExtra";
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: NFTContractWithExtraInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    approve(
      to: string,
      tokenId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    balanceOf(owner: string, overrides?: CallOverrides): Promise<[BigNumber]>;

    baseURI(overrides?: CallOverrides): Promise<[string]>;

    burn(
      tokenId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    callers(arg0: string, overrides?: CallOverrides): Promise<[boolean]>;

    extraDataToUint256(
      arg0: ERC721ExtraData.DataStruct,
      overrides?: CallOverrides
    ): Promise<[BigNumber] & { packedData: BigNumber }>;

    getApproved(
      tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[string]>;

    getExtraData(
      overrides?: CallOverrides
    ): Promise<[ERC721ExtraData.DataStructOutput]>;

    isApprovedForAll(
      owner: string,
      operator: string,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    merkleRoot(overrides?: CallOverrides): Promise<[string]>;

    name(overrides?: CallOverrides): Promise<[string]>;

    numberMinted(
      _owner: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    ownerOf(
      tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[string]>;

    parts(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [string, number, number] & {
        wallet: string;
        salesPart: number;
        royaltiesPart: number;
      }
    >;

    presaleMint(
      amount: BigNumberish,
      recipient: string,
      proof: BytesLike[],
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    "safeTransferFrom(address,address,uint256)"(
      from: string,
      to: string,
      tokenId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    "safeTransferFrom(address,address,uint256,bytes)"(
      from: string,
      to: string,
      tokenId: BigNumberish,
      _data: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    saleMint(
      amount: BigNumberish,
      recipient: string,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setApprovalForAll(
      operator: string,
      approved: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setBaseURI(
      uri: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setConfig(
      next: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setMerkleRoot(
      root: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setUnrevealURI(
      uri: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    shareETHPart(
      isSalePart: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    shareTokenPart(
      isSalePart: boolean,
      token: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    supportsInterface(
      interfaceId: BytesLike,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    symbol(overrides?: CallOverrides): Promise<[string]>;

    tokenURI(
      _nftId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[string]>;

    totalMinted(overrides?: CallOverrides): Promise<[BigNumber]>;

    totalSupply(overrides?: CallOverrides): Promise<[BigNumber]>;

    transferFrom(
      from: string,
      to: string,
      tokenId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    unrevealURI(overrides?: CallOverrides): Promise<[string]>;
  };

  approve(
    to: string,
    tokenId: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  balanceOf(owner: string, overrides?: CallOverrides): Promise<BigNumber>;

  baseURI(overrides?: CallOverrides): Promise<string>;

  burn(
    tokenId: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callers(arg0: string, overrides?: CallOverrides): Promise<boolean>;

  extraDataToUint256(
    arg0: ERC721ExtraData.DataStruct,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getApproved(
    tokenId: BigNumberish,
    overrides?: CallOverrides
  ): Promise<string>;

  getExtraData(
    overrides?: CallOverrides
  ): Promise<ERC721ExtraData.DataStructOutput>;

  isApprovedForAll(
    owner: string,
    operator: string,
    overrides?: CallOverrides
  ): Promise<boolean>;

  merkleRoot(overrides?: CallOverrides): Promise<string>;

  name(overrides?: CallOverrides): Promise<string>;

  numberMinted(_owner: string, overrides?: CallOverrides): Promise<BigNumber>;

  owner(overrides?: CallOverrides): Promise<string>;

  ownerOf(tokenId: BigNumberish, overrides?: CallOverrides): Promise<string>;

  parts(
    arg0: BigNumberish,
    overrides?: CallOverrides
  ): Promise<
    [string, number, number] & {
      wallet: string;
      salesPart: number;
      royaltiesPart: number;
    }
  >;

  presaleMint(
    amount: BigNumberish,
    recipient: string,
    proof: BytesLike[],
    overrides?: PayableOverrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  renounceOwnership(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  "safeTransferFrom(address,address,uint256)"(
    from: string,
    to: string,
    tokenId: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  "safeTransferFrom(address,address,uint256,bytes)"(
    from: string,
    to: string,
    tokenId: BigNumberish,
    _data: BytesLike,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  saleMint(
    amount: BigNumberish,
    recipient: string,
    overrides?: PayableOverrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setApprovalForAll(
    operator: string,
    approved: boolean,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setBaseURI(
    uri: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setConfig(
    next: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setMerkleRoot(
    root: BytesLike,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setUnrevealURI(
    uri: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  shareETHPart(
    isSalePart: boolean,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  shareTokenPart(
    isSalePart: boolean,
    token: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  supportsInterface(
    interfaceId: BytesLike,
    overrides?: CallOverrides
  ): Promise<boolean>;

  symbol(overrides?: CallOverrides): Promise<string>;

  tokenURI(_nftId: BigNumberish, overrides?: CallOverrides): Promise<string>;

  totalMinted(overrides?: CallOverrides): Promise<BigNumber>;

  totalSupply(overrides?: CallOverrides): Promise<BigNumber>;

  transferFrom(
    from: string,
    to: string,
    tokenId: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  transferOwnership(
    newOwner: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  unrevealURI(overrides?: CallOverrides): Promise<string>;

  callStatic: {
    approve(
      to: string,
      tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    balanceOf(owner: string, overrides?: CallOverrides): Promise<BigNumber>;

    baseURI(overrides?: CallOverrides): Promise<string>;

    burn(tokenId: BigNumberish, overrides?: CallOverrides): Promise<void>;

    callers(arg0: string, overrides?: CallOverrides): Promise<boolean>;

    extraDataToUint256(
      arg0: ERC721ExtraData.DataStruct,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getApproved(
      tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string>;

    getExtraData(
      overrides?: CallOverrides
    ): Promise<ERC721ExtraData.DataStructOutput>;

    isApprovedForAll(
      owner: string,
      operator: string,
      overrides?: CallOverrides
    ): Promise<boolean>;

    merkleRoot(overrides?: CallOverrides): Promise<string>;

    name(overrides?: CallOverrides): Promise<string>;

    numberMinted(_owner: string, overrides?: CallOverrides): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<string>;

    ownerOf(tokenId: BigNumberish, overrides?: CallOverrides): Promise<string>;

    parts(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [string, number, number] & {
        wallet: string;
        salesPart: number;
        royaltiesPart: number;
      }
    >;

    presaleMint(
      amount: BigNumberish,
      recipient: string,
      proof: BytesLike[],
      overrides?: CallOverrides
    ): Promise<void>;

    renounceOwnership(overrides?: CallOverrides): Promise<void>;

    "safeTransferFrom(address,address,uint256)"(
      from: string,
      to: string,
      tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    "safeTransferFrom(address,address,uint256,bytes)"(
      from: string,
      to: string,
      tokenId: BigNumberish,
      _data: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    saleMint(
      amount: BigNumberish,
      recipient: string,
      overrides?: CallOverrides
    ): Promise<void>;

    setApprovalForAll(
      operator: string,
      approved: boolean,
      overrides?: CallOverrides
    ): Promise<void>;

    setBaseURI(uri: string, overrides?: CallOverrides): Promise<void>;

    setConfig(next: BigNumberish, overrides?: CallOverrides): Promise<void>;

    setMerkleRoot(root: BytesLike, overrides?: CallOverrides): Promise<void>;

    setUnrevealURI(uri: string, overrides?: CallOverrides): Promise<void>;

    shareETHPart(isSalePart: boolean, overrides?: CallOverrides): Promise<void>;

    shareTokenPart(
      isSalePart: boolean,
      token: string,
      overrides?: CallOverrides
    ): Promise<void>;

    supportsInterface(
      interfaceId: BytesLike,
      overrides?: CallOverrides
    ): Promise<boolean>;

    symbol(overrides?: CallOverrides): Promise<string>;

    tokenURI(_nftId: BigNumberish, overrides?: CallOverrides): Promise<string>;

    totalMinted(overrides?: CallOverrides): Promise<BigNumber>;

    totalSupply(overrides?: CallOverrides): Promise<BigNumber>;

    transferFrom(
      from: string,
      to: string,
      tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    transferOwnership(
      newOwner: string,
      overrides?: CallOverrides
    ): Promise<void>;

    unrevealURI(overrides?: CallOverrides): Promise<string>;
  };

  filters: {
    "Approval(address,address,uint256)"(
      owner?: string | null,
      approved?: string | null,
      tokenId?: BigNumberish | null
    ): ApprovalEventFilter;
    Approval(
      owner?: string | null,
      approved?: string | null,
      tokenId?: BigNumberish | null
    ): ApprovalEventFilter;

    "ApprovalForAll(address,address,bool)"(
      owner?: string | null,
      operator?: string | null,
      approved?: null
    ): ApprovalForAllEventFilter;
    ApprovalForAll(
      owner?: string | null,
      operator?: string | null,
      approved?: null
    ): ApprovalForAllEventFilter;

    "BaseURIUpdated(string)"(uri?: null): BaseURIUpdatedEventFilter;
    BaseURIUpdated(uri?: null): BaseURIUpdatedEventFilter;

    "ConfigUpdated(uint256)"(conf?: null): ConfigUpdatedEventFilter;
    ConfigUpdated(conf?: null): ConfigUpdatedEventFilter;

    "ConsecutiveTransfer(uint256,uint256,address,address)"(
      fromTokenId?: BigNumberish | null,
      toTokenId?: null,
      from?: string | null,
      to?: string | null
    ): ConsecutiveTransferEventFilter;
    ConsecutiveTransfer(
      fromTokenId?: BigNumberish | null,
      toTokenId?: null,
      from?: string | null,
      to?: string | null
    ): ConsecutiveTransferEventFilter;

    "MerkleRootUpdated(bytes32)"(root?: null): MerkleRootUpdatedEventFilter;
    MerkleRootUpdated(root?: null): MerkleRootUpdatedEventFilter;

    "OwnershipTransferred(address,address)"(
      previousOwner?: string | null,
      newOwner?: string | null
    ): OwnershipTransferredEventFilter;
    OwnershipTransferred(
      previousOwner?: string | null,
      newOwner?: string | null
    ): OwnershipTransferredEventFilter;

    "SharedETHPart(bool)"(isSalePart?: null): SharedETHPartEventFilter;
    SharedETHPart(isSalePart?: null): SharedETHPartEventFilter;

    "SharedTokenPart(bool)"(isSalePart?: null): SharedTokenPartEventFilter;
    SharedTokenPart(isSalePart?: null): SharedTokenPartEventFilter;

    "Transfer(address,address,uint256)"(
      from?: string | null,
      to?: string | null,
      tokenId?: BigNumberish | null
    ): TransferEventFilter;
    Transfer(
      from?: string | null,
      to?: string | null,
      tokenId?: BigNumberish | null
    ): TransferEventFilter;

    "UnrevealURIUpdated(string)"(uri?: null): UnrevealURIUpdatedEventFilter;
    UnrevealURIUpdated(uri?: null): UnrevealURIUpdatedEventFilter;
  };

  estimateGas: {
    approve(
      to: string,
      tokenId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    balanceOf(owner: string, overrides?: CallOverrides): Promise<BigNumber>;

    baseURI(overrides?: CallOverrides): Promise<BigNumber>;

    burn(
      tokenId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    callers(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

    extraDataToUint256(
      arg0: ERC721ExtraData.DataStruct,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getApproved(
      tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getExtraData(overrides?: CallOverrides): Promise<BigNumber>;

    isApprovedForAll(
      owner: string,
      operator: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    merkleRoot(overrides?: CallOverrides): Promise<BigNumber>;

    name(overrides?: CallOverrides): Promise<BigNumber>;

    numberMinted(_owner: string, overrides?: CallOverrides): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    ownerOf(
      tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    parts(arg0: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;

    presaleMint(
      amount: BigNumberish,
      recipient: string,
      proof: BytesLike[],
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    "safeTransferFrom(address,address,uint256)"(
      from: string,
      to: string,
      tokenId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    "safeTransferFrom(address,address,uint256,bytes)"(
      from: string,
      to: string,
      tokenId: BigNumberish,
      _data: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    saleMint(
      amount: BigNumberish,
      recipient: string,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setApprovalForAll(
      operator: string,
      approved: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setBaseURI(
      uri: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setConfig(
      next: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setMerkleRoot(
      root: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setUnrevealURI(
      uri: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    shareETHPart(
      isSalePart: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    shareTokenPart(
      isSalePart: boolean,
      token: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    supportsInterface(
      interfaceId: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    symbol(overrides?: CallOverrides): Promise<BigNumber>;

    tokenURI(
      _nftId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    totalMinted(overrides?: CallOverrides): Promise<BigNumber>;

    totalSupply(overrides?: CallOverrides): Promise<BigNumber>;

    transferFrom(
      from: string,
      to: string,
      tokenId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    unrevealURI(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    approve(
      to: string,
      tokenId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    balanceOf(
      owner: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    baseURI(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    burn(
      tokenId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    callers(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    extraDataToUint256(
      arg0: ERC721ExtraData.DataStruct,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getApproved(
      tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getExtraData(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    isApprovedForAll(
      owner: string,
      operator: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    merkleRoot(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    name(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    numberMinted(
      _owner: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    ownerOf(
      tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    parts(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    presaleMint(
      amount: BigNumberish,
      recipient: string,
      proof: BytesLike[],
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    "safeTransferFrom(address,address,uint256)"(
      from: string,
      to: string,
      tokenId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    "safeTransferFrom(address,address,uint256,bytes)"(
      from: string,
      to: string,
      tokenId: BigNumberish,
      _data: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    saleMint(
      amount: BigNumberish,
      recipient: string,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setApprovalForAll(
      operator: string,
      approved: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setBaseURI(
      uri: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setConfig(
      next: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setMerkleRoot(
      root: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setUnrevealURI(
      uri: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    shareETHPart(
      isSalePart: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    shareTokenPart(
      isSalePart: boolean,
      token: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    supportsInterface(
      interfaceId: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    symbol(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    tokenURI(
      _nftId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    totalMinted(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    totalSupply(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    transferFrom(
      from: string,
      to: string,
      tokenId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    unrevealURI(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
