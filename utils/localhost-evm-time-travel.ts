import { ethers } from "hardhat";

export const timeTravel = async (seconds: number): Promise<void> => {
    await ethers.provider.send("evm_increaseTime", [seconds]);
    await ethers.provider.send("evm_mine", []);
}
