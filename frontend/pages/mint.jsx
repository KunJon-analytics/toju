import {
  Box,
  Heading,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  Flex,
} from "@chakra-ui/react";
import { useContractRead, useAccount } from "wagmi";

import SidebarLayout from "../layout/SidebarLayout";
import { tokenConfig } from "../components/contract";
import MintToken from "../components/Actions/MintToken";
import { formatEther } from "viem";

export default function Mint() {
  const { address } = useAccount();
  const { data: balance, isLoading } = useContractRead({
    ...tokenConfig,
    functionName: "balanceOf",
    args: [address],
    watch: true,
  });
  return (
    <SidebarLayout>
      <Box flex="1" borderRadius={8} bg="gray.800" p={["6", "8"]}>
        <Flex mb="8" justify="space-between" align="center">
          <Heading size="lg" fontWeight="normal">
            Mint TOJU
          </Heading>
          <MintToken />
        </Flex>

        <Divider my="6" borderColor="gray.700" />
        {!isLoading && (
          <Stat>
            <StatLabel>Balance</StatLabel>
            <StatNumber>{`${formatEther(balance)} TOJU`}</StatNumber>
          </Stat>
        )}
      </Box>
    </SidebarLayout>
  );
}
