import { DateTime } from "luxon";

import TojuAbi from "../artifacts/contracts/Toju.sol/Toju.json";
import TokenAbi from "../artifacts/contracts/TojuToken.sol/TojuToken.json";

export const tojuConfig = {
  address: "0xC7857Bd19b0D2b6b6CD343c104E56b15e6cE2031",
  abi: TojuAbi.abi,
};

export const tokenConfig = {
  address: "0xa65545Ea70Be846a6C782CA9dAFd5f8658ad1744",
  abi: TokenAbi.abi,
};

export const deployBlock = 4108026n;

export const checkIfReadyToFinish = (project) => {
  if (project?.status !== "ONGOING") {
    return false;
  }
  const lastMilestonePassed =
    !!project?.milestones[project?.milestonesCount - 1].proofOfWork;

  const lastMilestoneExpiredTime = parseInt(
    project?.milestones[project?.milestonesCount - 1].endTimestamp
  );

  const isLastExpired = lastMilestoneExpiredTime <= DateTime.now().toSeconds();

  return lastMilestonePassed || isLastExpired;
};
