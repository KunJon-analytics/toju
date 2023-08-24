import {
  Box,
  Button,
  Checkbox,
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
import { RiAddLine, RiPencilLine } from "react-icons/ri";
import { Pagination } from "../components/Pagination";
import SidebarLayout from "../layout/SidebarLayout";

export default function Projects() {
  const isWideVersion = useBreakpointValue({
    base: false,
    lg: true,
  });

  const router = useRouter();

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
              <Th px={["4", "4", "6"]} color="gray.300" width="8">
                <Checkbox colorScheme="green" />
              </Th>
              <Th>Usuário</Th>
              {isWideVersion && <Th>Data de cadastro</Th>}
              <Th width="8"></Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td px={["4", "4", "6"]}>
                <Checkbox colorScheme="green" />
              </Td>
              <Td>
                <Box>
                  <Text fontWeight="bold">Eduardo Ferronato</Text>
                  <Text fontSize="sm" color="gray.300">
                    edu.fe.guin@gmail.com
                  </Text>
                </Box>
              </Td>
              {isWideVersion && <Td>04 de Fevereiro, 2022</Td>}
              <Td>
                <Button
                  as="a"
                  size="sm"
                  fontSize="sm"
                  colorScheme="facebook"
                  leftIcon={<Icon as={RiPencilLine} fontSize="16" />}
                >
                  {isWideVersion ? "Editar" : ""}
                </Button>
              </Td>
            </Tr>
            <Tr>
              <Td px={["4", "4", "6"]}>
                <Checkbox colorScheme="green" />
              </Td>
              <Td>
                <Box>
                  <Text fontWeight="bold">Eduardo Ferronato</Text>
                  <Text fontSize="sm" color="gray.300">
                    edu.fe.guin@gmail.com
                  </Text>
                </Box>
              </Td>
              {isWideVersion && <Td>04 de Fevereiro, 2022</Td>}
              <Td>
                <Button
                  as="a"
                  size="sm"
                  fontSize="sm"
                  colorScheme="facebook"
                  leftIcon={<Icon as={RiPencilLine} fontSize="16" />}
                >
                  {isWideVersion ? "Editar" : ""}
                </Button>
              </Td>
            </Tr>
            <Tr>
              <Td px={["4", "4", "6"]}>
                <Checkbox colorScheme="green" />
              </Td>
              <Td>
                <Box>
                  <Text fontWeight="bold">Eduardo Ferronato</Text>
                  <Text fontSize="sm" color="gray.300">
                    edu.fe.guin@gmail.com
                  </Text>
                </Box>
              </Td>
              {isWideVersion && <Td>04 de Fevereiro, 2022</Td>}
              <Td>
                <Button
                  as="a"
                  size="sm"
                  fontSize="sm"
                  colorScheme="facebook"
                  leftIcon={<Icon as={RiPencilLine} fontSize="16" />}
                >
                  {isWideVersion ? "Editar" : ""}
                </Button>
              </Td>
            </Tr>
          </Tbody>
        </Table>
        <Pagination />
      </Box>
    </SidebarLayout>
  );
}
