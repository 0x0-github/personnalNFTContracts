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
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import { Listener, Provider } from "@ethersproject/providers";
import { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "./common";

export interface MoonBaseInterface extends utils.Interface {
  contractName: "MoonBase";
  functions: {
    "canClaim(uint256)": FunctionFragment;
    "claim(uint256[])": FunctionFragment;
    "currentClaimId()": FunctionFragment;
    "mintBatches(uint256)": FunctionFragment;
    "mlz()": FunctionFragment;
    "owner()": FunctionFragment;
    "renounceOwnership()": FunctionFragment;
    "transferOwnership(address)": FunctionFragment;
    "updateCurrentClaimId(uint256)": FunctionFragment;
    "updateLastId(uint256)": FunctionFragment;
    "withdraw(address,uint256)": FunctionFragment;
    "withdrawNFT(uint256)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "canClaim",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "claim",
    values: [BigNumberish[]]
  ): string;
  encodeFunctionData(
    functionFragment: "currentClaimId",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "mintBatches",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "mlz", values?: undefined): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "updateCurrentClaimId",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "updateLastId",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "withdraw",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "withdrawNFT",
    values: [BigNumberish]
  ): string;

  decodeFunctionResult(functionFragment: "canClaim", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "claim", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "currentClaimId",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "mintBatches",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "mlz", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "updateCurrentClaimId",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "updateLastId",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "withdraw", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "withdrawNFT",
    data: BytesLike
  ): Result;

  events: {
    "Claimed(uint256)": EventFragment;
    "OwnershipTransferred(address,address)": EventFragment;
    "UpdatedCurrentClaimId(uint256)": EventFragment;
    "UpdatedLastId(uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "Claimed"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "OwnershipTransferred"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "UpdatedCurrentClaimId"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "UpdatedLastId"): EventFragment;
}

export type ClaimedEvent = TypedEvent<[BigNumber], { amount: BigNumber }>;

export type ClaimedEventFilter = TypedEventFilter<ClaimedEvent>;

export type OwnershipTransferredEvent = TypedEvent<
  [string, string],
  { previousOwner: string; newOwner: string }
>;

export type OwnershipTransferredEventFilter =
  TypedEventFilter<OwnershipTransferredEvent>;

export type UpdatedCurrentClaimIdEvent = TypedEvent<
  [BigNumber],
  { current: BigNumber }
>;

export type UpdatedCurrentClaimIdEventFilter =
  TypedEventFilter<UpdatedCurrentClaimIdEvent>;

export type UpdatedLastIdEvent = TypedEvent<[BigNumber], { last: BigNumber }>;

export type UpdatedLastIdEventFilter = TypedEventFilter<UpdatedLastIdEvent>;

export interface MoonBase extends BaseContract {
  contractName: "MoonBase";
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: MoonBaseInterface;

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
    canClaim(
      mlzId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    claim(
      tokenIds: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    currentClaimId(overrides?: CallOverrides): Promise<[BigNumber]>;

    mintBatches(
      batches: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    mlz(overrides?: CallOverrides): Promise<[string]>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    updateCurrentClaimId(
      id: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    updateLastId(
      id: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    withdraw(
      _address: string,
      _amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    withdrawNFT(
      id: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  canClaim(mlzId: BigNumberish, overrides?: CallOverrides): Promise<boolean>;

  claim(
    tokenIds: BigNumberish[],
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  currentClaimId(overrides?: CallOverrides): Promise<BigNumber>;

  mintBatches(
    batches: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  mlz(overrides?: CallOverrides): Promise<string>;

  owner(overrides?: CallOverrides): Promise<string>;

  renounceOwnership(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  transferOwnership(
    newOwner: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  updateCurrentClaimId(
    id: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  updateLastId(
    id: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  withdraw(
    _address: string,
    _amount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  withdrawNFT(
    id: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    canClaim(mlzId: BigNumberish, overrides?: CallOverrides): Promise<boolean>;

    claim(tokenIds: BigNumberish[], overrides?: CallOverrides): Promise<void>;

    currentClaimId(overrides?: CallOverrides): Promise<BigNumber>;

    mintBatches(
      batches: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    mlz(overrides?: CallOverrides): Promise<string>;

    owner(overrides?: CallOverrides): Promise<string>;

    renounceOwnership(overrides?: CallOverrides): Promise<void>;

    transferOwnership(
      newOwner: string,
      overrides?: CallOverrides
    ): Promise<void>;

    updateCurrentClaimId(
      id: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    updateLastId(id: BigNumberish, overrides?: CallOverrides): Promise<void>;

    withdraw(
      _address: string,
      _amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    withdrawNFT(id: BigNumberish, overrides?: CallOverrides): Promise<void>;
  };

  filters: {
    "Claimed(uint256)"(amount?: null): ClaimedEventFilter;
    Claimed(amount?: null): ClaimedEventFilter;

    "OwnershipTransferred(address,address)"(
      previousOwner?: string | null,
      newOwner?: string | null
    ): OwnershipTransferredEventFilter;
    OwnershipTransferred(
      previousOwner?: string | null,
      newOwner?: string | null
    ): OwnershipTransferredEventFilter;

    "UpdatedCurrentClaimId(uint256)"(
      current?: null
    ): UpdatedCurrentClaimIdEventFilter;
    UpdatedCurrentClaimId(current?: null): UpdatedCurrentClaimIdEventFilter;

    "UpdatedLastId(uint256)"(last?: null): UpdatedLastIdEventFilter;
    UpdatedLastId(last?: null): UpdatedLastIdEventFilter;
  };

  estimateGas: {
    canClaim(
      mlzId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    claim(
      tokenIds: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    currentClaimId(overrides?: CallOverrides): Promise<BigNumber>;

    mintBatches(
      batches: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    mlz(overrides?: CallOverrides): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    updateCurrentClaimId(
      id: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    updateLastId(
      id: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    withdraw(
      _address: string,
      _amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    withdrawNFT(
      id: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    canClaim(
      mlzId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    claim(
      tokenIds: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    currentClaimId(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    mintBatches(
      batches: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    mlz(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    updateCurrentClaimId(
      id: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    updateLastId(
      id: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    withdraw(
      _address: string,
      _amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    withdrawNFT(
      id: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}
