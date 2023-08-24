import React from "react";
import { DateTime } from "luxon";
import {
  List,
  ListItem,
  ListIcon,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useBreakpointValue,
  Checkbox,
  Box,
  Flex,
  HStack,
  Button,
} from "@chakra-ui/react";
import {
  AiFillBulb,
  AiOutlineFieldTime,
  AiTwotoneInfoCircle,
  AiOutlinePercentage,
} from "react-icons/ai";
import { BsCoin } from "react-icons/bs";
import { formatEther } from "viem";

const Create = ({ project, write, setStage, isPending }) => {
  const isWideVersion = useBreakpointValue({
    base: false,
    lg: true,
  });
  return (
    <>
      <List spacing={3}>
        <ListItem>
          <ListIcon as={AiTwotoneInfoCircle} color="green.500" />
          Identifier: {project.identifier}
        </ListItem>
        <ListItem>
          <ListIcon as={AiFillBulb} color="green.500" />
          Description: {project.projectDescription}
        </ListItem>
        <ListItem>
          <ListIcon as={AiOutlinePercentage} color="green.500" />
          Percentage Stake:
          {project.stakeRate100}%
        </ListItem>
        <ListItem>
          <ListIcon as={BsCoin} color="green.500" />
          Available tokens:
          {formatEther(project.maxTokenSoldCount)}
        </ListItem>
        <ListItem>
          <ListIcon as={AiOutlineFieldTime} color="green.500" />
          Cooldown Interval:
          {project.coolDownInterval}
        </ListItem>
      </List>
      <Table colorScheme="whiteAlpha" mt={10}>
        <Thead>
          <Tr>
            <Th px={["4", "4", "6"]} color="gray.300" width="8">
              Threshold
            </Th>
            <Th>Title / Description</Th>
            {isWideVersion && <Th>Deadline</Th>}
          </Tr>
        </Thead>
        <Tbody>
          {project.milestoneTitles?.map((title, index) => (
            <Tr key={title}>
              <Td px={["4", "4", "6"]}>
                <Checkbox
                  name={index}
                  isChecked={index === project.thresholdIndex}
                  colorScheme="green"
                  isDisabled
                />
              </Td>
              <Td>
                <Box>
                  <Text fontWeight="bold">{title}</Text>
                  <Text fontSize="sm" color="gray.300">
                    {project.milestoneDescriptions[index]}
                  </Text>
                </Box>
              </Td>
              {isWideVersion && (
                <Td>
                  {DateTime.fromSeconds(
                    project.endTimestamps[index]
                  ).toISODate()}
                </Td>
              )}
            </Tr>
          ))}
        </Tbody>
      </Table>
      <Flex mt="8" justify="flex-end">
        <HStack>
          <Button
            onClick={() => {
              setStage(1);
            }}
            colorScheme="whiteAlpha"
          >
            Back
          </Button>
          <Button
            colorScheme="green"
            isDisabled={!write || isPending}
            onClick={write}
          >
            {isPending ? "Declaring..." : "Declare"}
          </Button>
        </HStack>
      </Flex>
    </>
  );
};

export default Create;
