import Web3 from "web3";

const AVAILABLE_RPC = process.env.RPC_URLS!;
const RPC_COUNT = AVAILABLE_RPC.length;
const MAX_DEPTH = RPC_COUNT * 2;

let currentRpcIndex = 0;
let currentDepth = 0;

export let web3 = new Web3(AVAILABLE_RPC[currentRpcIndex]);

export const wrapWeb3Call = (fn: any) => {
  try {
    const r = fn();

    currentDepth = 0;

    return r;
  } catch {
    if (currentDepth == MAX_DEPTH) {
      throw Error(`Max depth of ${MAX_DEPTH} reached... Exiting`);
    }

    currentRpcIndex = currentRpcIndex + 1 < RPC_COUNT ? currentRpcIndex + 1 : 0;
    currentDepth++;
    web3 = new Web3(AVAILABLE_RPC[currentRpcIndex]);

    return fn();
  }
}
