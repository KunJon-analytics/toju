import React from "react";
import { useRouter } from "next/router";
import { formatEther } from "viem";
import { DateTime } from "luxon";
import {
  Box,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Progress,
  Container,
  Stack,
  Text,
  VStack,
  Heading,
  SimpleGrid,
  StackDivider,
  useColorModeValue,
  List,
  ListItem,
} from "@chakra-ui/react";
import { useContractRead, useAccount } from "wagmi";

import SidebarLayout from "../../layout/SidebarLayout";
import {
  checkIfReadyToFinish,
  tojuConfig,
  tokenConfig,
} from "../../components/contract";
import ProjectMilestones from "../../components/ProjectMilestones";
import StatusBadge from "../../components/StatusBadge";
import PayStake from "../../components/Actions/PayStake";
import Commit from "../../components/Actions/Commit";
import Cancel from "../../components/Actions/Cancel";
import FinishProject from "../../components/Actions/FinishProject";
import Refund from "../../components/Actions/Refund";

const ProjectDetails = () => {
  const router = useRouter();
  const { address } = useAccount();
  const { data, isLoading, isError, error } = useContractRead({
    ...tojuConfig,
    functionName: "queryProjectProto",
    args: [parseInt(router.query.id)],
    enabled: !!router.query.id,
    watch: true,
  });

  const { data: purchase } = useContractRead({
    ...tojuConfig,
    functionName: "queryPurchase",
    args: [parseInt(router.query.id), address],
    enabled: !!router.query.id && !!address,
    watch: true,
  });

  const { data: allowance, isLoading: allowanceLoading } = useContractRead({
    ...tokenConfig,
    functionName: "allowance",
    args: [address, tojuConfig.address],
    watch: true,
  });

  const { data: balance, isLoading: balanceLoading } = useContractRead({
    ...tokenConfig,
    functionName: "balanceOf",
    args: [address],
    watch: true,
  });

  const showLoading =
    isLoading || isError || !data || balanceLoading || allowanceLoading;

  const isOwner = data?.ownerAddress === address;

  const showPaystake = isOwner && data?.status === "PENDING";

  const showCommit =
    !isOwner &&
    !checkIfReadyToFinish(data) &&
    data?.status !== "PENDING" &&
    data?.remainTokenCount !== 0;

  const showCancel =
    isOwner && data?.stage !== "Active" && data?.status !== "FINISHED";

  const userCanFinish = !isOwner && checkIfReadyToFinish(data);
  const ownerCanFinish = isOwner && data?.status === "ONGOING";

  const showFinish = userCanFinish || ownerCanFinish;
  const userCanRefund =
    !isOwner &&
    purchase > 0n &&
    data?.status === "ONGOING" &&
    !checkIfReadyToFinish(data);
  const ownerCanRefund =
    isOwner && data?.status === "ONGOING" && !checkIfReadyToFinish(data);
  const showRefund = userCanRefund || ownerCanRefund;

  if (showLoading) {
    return (
      <SidebarLayout>
        <Box flex="1" borderRadius={8} bg="gray.800" p="8">
          {isLoading ? (
            <Progress size="xs" isIndeterminate />
          ) : (
            <Alert status={"error"}>
              <AlertIcon />
              <AlertTitle color={"gray.700"}>Error!</AlertTitle>
              <AlertDescription color={"gray.700"}>
                {error?.message}
              </AlertDescription>
            </Alert>
          )}
        </Box>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <Box flex="1" borderRadius={8} bg="gray.800" p="8">
        <Container maxW={"7xl"}>
          <Stack spacing={{ base: 6, md: 10 }}>
            <Box as={"header"}>
              <Heading
                lineHeight={1.1}
                fontWeight={600}
                fontSize={{ base: "2xl", sm: "4xl", lg: "5xl" }}
              >
                {`Project Details: ${router.query.id}`}
              </Heading>
              <Text
                color={useColorModeValue("gray.100", "gray.400")}
                fontWeight={300}
                fontSize={"2xl"}
              >
                {`Needed: ${formatEther(data.remainTokenCount)} TOJU`}
              </Text>
            </Box>

            <Stack
              spacing={{ base: 4, sm: 6 }}
              direction={"column"}
              divider={
                <StackDivider
                  borderColor={useColorModeValue("gray.200", "gray.600")}
                />
              }
            >
              <VStack spacing={{ base: 4, sm: 6 }}>
                <Text
                  color={useColorModeValue("gray.500", "gray.400")}
                  fontSize={"2xl"}
                  fontWeight={"300"}
                >
                  {`Owner: ${data.ownerAddress}`}
                </Text>
                <Text fontSize={"lg"}>{data.description}</Text>
              </VStack>
              <Box>
                <Text
                  fontSize={{ base: "16px", lg: "18px" }}
                  color={useColorModeValue("yellow.500", "yellow.300")}
                  fontWeight={"500"}
                  textTransform={"uppercase"}
                  mb={"4"}
                >
                  Numbers
                </Text>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
                  <List spacing={2}>
                    <ListItem>{`Buyers: ${parseInt(
                      data.buyerCount
                    )}`}</ListItem>
                    <ListItem>{`Cool down Interval: ${parseInt(
                      data.coolDownInterval
                    )} seconds`}</ListItem>{" "}
                    <ListItem>{`Created: ${DateTime.fromSeconds(
                      parseInt(data.creationTimestamp)
                    ).toLocaleString(
                      DateTime.DATE_MED_WITH_WEEKDAY
                    )}`}</ListItem>
                    <ListItem>{`Last Update: ${
                      parseInt(data.lastUpdateTimestamp) !== 0
                        ? DateTime.fromSeconds(
                            parseInt(data.lastUpdateTimestamp)
                          ).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
                        : DateTime.fromSeconds(
                            parseInt(data.creationTimestamp)
                          ).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
                    }`}</ListItem>
                  </List>
                  <List spacing={2}>
                    <ListItem>{`Remaining: ${formatEther(
                      data.remainTokenCount
                    )} TOJU`}</ListItem>
                    <ListItem>{`Raised: ${
                      formatEther(data.maxTokenSoldCount) -
                      formatEther(data.remainTokenCount)
                    } TOJU`}</ListItem>
                    <ListItem>{`Owners Stake: ${data.stakeRate100} %`}</ListItem>
                    <ListItem>
                      {`Status:  `}
                      <StatusBadge status={data.status} />
                    </ListItem>
                  </List>
                </SimpleGrid>
              </Box>
              <Box>
                <Text
                  fontSize={{ base: "16px", lg: "18px" }}
                  color={useColorModeValue("yellow.500", "yellow.300")}
                  fontWeight={"500"}
                  textTransform={"uppercase"}
                  mb={"4"}
                >
                  Milestones
                </Text>

                <ProjectMilestones
                  project={data}
                  isOwner={isOwner}
                  id={router.query.id}
                />
              </Box>
            </Stack>

            {showPaystake && (
              <PayStake
                project={data}
                allowance={allowance}
                balance={balance}
                id={router.query.id}
              />
            )}

            {showCommit && (
              <Commit
                project={data}
                allowance={allowance}
                balance={balance}
                id={router.query.id}
              />
            )}

            {showCancel && <Cancel id={router.query.id} />}

            {showFinish && <FinishProject id={router.query.id} />}

            {showRefund && <Refund id={router.query.id} />}
          </Stack>
        </Container>
      </Box>
    </SidebarLayout>
  );
};

export default ProjectDetails;
