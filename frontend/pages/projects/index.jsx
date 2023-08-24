import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { RiAddLine, RiEyeLine } from "react-icons/ri";
import { useContractRead } from "wagmi";
import { readContracts } from "@wagmi/core";
import { formatEther } from "viem";

import SidebarLayout from "../../layout/SidebarLayout";
import { tojuConfig } from "../../components/contract";
import StatusBadge from "../../components/StatusBadge";

export default function Dashboard() {
  const isWideVersion = useBreakpointValue({
    base: false,
    lg: true,
  });

  const router = useRouter();
  const [projects, setProjects] = useState([]);

  const { data: counter } = useContractRead({
    ...tojuConfig,
    functionName: "counter",
    watch: true,
  });

  useEffect(() => {
    const getProjects = async () => {
      let contracts = [];
      for (let index = 1; index < parseInt(counter); index++) {
        contracts.push({
          ...tojuConfig,
          functionName: "queryProjectProto",
          args: [index],
        });
      }
      const data = await readContracts({
        contracts,
      });
      const filteredData = data.filter(
        (project) => project.result.description !== ""
      );
      setProjects(filteredData);
    };

    getProjects();
  }, [counter]);

  return (
    <SidebarLayout>
      <Box flex="1" borderRadius={8} bg="gray.800" p="8">
        <Flex mb="8" justify="space-between" align="center">
          <Heading size="lg" fontWeight="normal">
            Projects
          </Heading>
          <Button
            size="sm"
            onClick={() => router.push("/projects/declare")}
            fontSize="sm"
            colorScheme="green"
            leftIcon={<Icon as={RiAddLine} fontSize="20" />}
          >
            Add projects
          </Button>
        </Flex>

        <Table colorScheme="whiteAlpha">
          <Thead>
            <Tr>
              <Th>ID / TOJU remaining</Th>
              <Th>Status</Th>
              {isWideVersion && <Th>Creator</Th>}
              <Th width="8"></Th>
            </Tr>
          </Thead>
          <Tbody>
            {projects?.map((project, index) => (
              <Tr>
                <Td>
                  <Box>
                    <Text fontWeight="bold">{index + 1}</Text>
                    <Text fontSize="sm" color="gray.300">
                      {formatEther(project.result.remainTokenCount)}
                    </Text>
                  </Box>
                </Td>
                <Td>
                  <StatusBadge status={project.result.status} />
                </Td>
                {isWideVersion && <Td>{project.result.ownerAddress}</Td>}
                <Td>
                  <Button
                    onClick={() => router.push(`/projects/${index + 1}`)}
                    size="sm"
                    fontSize="sm"
                    colorScheme="facebook"
                    leftIcon={<Icon as={RiEyeLine} fontSize="16" />}
                  >
                    {isWideVersion ? "View" : ""}
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </SidebarLayout>
  );
}
