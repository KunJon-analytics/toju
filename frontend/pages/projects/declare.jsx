import React, { useState } from "react";
import {
  useContractWrite,
  useWaitForTransaction,
  usePrepareContractWrite,
} from "wagmi";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Box,
  Link,
  Divider,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  TabPanel,
} from "@chakra-ui/react";

import SidebarLayout from "../../layout/SidebarLayout";
import DeclareProject from "../../components/DeclareProject";
import AddMilestone from "../../components/AddMilestone";
import Milestones from "../../components/Milestones";
import Create from "../../components/Create";
import { tojuConfig } from "../../components/contract";
import { useDebounce } from "../../hooks/useDebounce";

const initialState = {
  projectDescription: "",
  stakeRate100: 0.01,
  maxTokenSoldCount: 1,
  milestoneTitles: [],
  milestoneDescriptions: [],
  endTimestamps: [],
  thresholdIndex: -1,
  coolDownInterval: 1,
};

const Declare = () => {
  const [project, setProject] = useState(initialState);
  const [stage, setStage] = useState(0);
  const debouncedMilestoneLength = useDebounce(
    project.milestoneDescriptions.length,
    500
  );

  const handleTabsChange = (index) => {
    setStage(index);
  };

  const {
    config,
    error: prepareError,
    isError: isPrepareError,
  } = usePrepareContractWrite({
    ...tojuConfig,
    functionName: "declareProject",
    args: [project],
    enabled: Boolean(debouncedMilestoneLength),
  });

  const { write, error, isError, data } = useContractWrite(config);

  const { isLoading: isPending, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  return (
    <SidebarLayout>
      <Box flex="1" borderRadius={8} bg="gray.800" p={["6", "8"]}>
        <Heading size="lg" fontWeight="normal">
          Declare Project
        </Heading>

        <Divider my="6" borderColor="gray.700" />

        <Tabs index={stage} onChange={handleTabsChange}>
          <TabList>
            <Tab _selected={{ color: "white", bg: "green.500" }}>
              Informations
            </Tab>
            <Tab
              _selected={{ color: "white", bg: "green.500" }}
              isDisabled={!project.projectDescription}
            >
              Milestones
            </Tab>
            <Tab
              _selected={{ color: "white", bg: "green.500" }}
              isDisabled={project.thresholdIndex === -1}
            >
              Create
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <DeclareProject setProject={setProject} setStage={setStage} />
            </TabPanel>
            <TabPanel>
              <AddMilestone setProject={setProject} project={project} />
              <Milestones
                setProject={setProject}
                setStage={setStage}
                project={project}
              />
            </TabPanel>
            <TabPanel>
              <Create
                project={project}
                write={write}
                setStage={setStage}
                isPending={isPending}
                data={data}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
        {isSuccess && (
          <Alert status="success">
            <AlertIcon />
            <AlertTitle color={"gray.700"}>
              Successfully declared your Project!
            </AlertTitle>
            <AlertDescription color={"gray.700"}>
              <Link
                href={`https://sepolia.etherscan.io/tx/${data?.hash}`}
                isExternal
              >
                Etherscan <ExternalLinkIcon mx="2px" />
              </Link>
            </AlertDescription>
          </Alert>
        )}
        {(isPrepareError || isError) && (
          <Alert status={isPrepareError ? "warning" : "error"}>
            <AlertIcon />
            <AlertTitle color={"gray.700"}>Error!</AlertTitle>
            <AlertDescription color={"gray.700"}>
              {(prepareError || error)?.message}
            </AlertDescription>
          </Alert>
        )}
      </Box>
    </SidebarLayout>
  );
};

export default Declare;
