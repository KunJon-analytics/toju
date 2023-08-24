import React from "react";
import { DateTime } from "luxon";
import { toast } from "react-toastify";
import {
  Box,
  Button,
  HStack,
  Flex,
  Checkbox,
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
import { RiDeleteBin3Line } from "react-icons/ri";

const Milestones = ({ setProject, project, setStage }) => {
  const {
    milestoneTitles,
    milestoneDescriptions,
    endTimestamps,
    thresholdIndex,
  } = project;
  const isWideVersion = useBreakpointValue({
    base: false,
    lg: true,
  });

  const setThreshold = (event) => {
    const { checked, name } = event.target;
    if (checked) {
      setProject((project) => {
        return { ...project, thresholdIndex: parseInt(name) };
      });
    } else {
      setProject((project) => {
        return { ...project, thresholdIndex: -1 };
      });
    }
  };

  const handleSubmit = (e) => {
    console.log("Clicked");
    if (thresholdIndex === -1) {
      toast.error(
        "Please select the milestone beyond which users cannot withdraw 100% of their tokens",
        {
          position: "top-right",
          autoClose: 7000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        }
      );
      return;
    }
    setStage(2);
  };

  const DeleteMileStone = (index) => {
    const milestones = endTimestamps.filter((val, i) => {
      return i !== index;
    });
    const titles = milestoneTitles.filter((val, i) => {
      return i !== index;
    });
    const descriptions = milestoneDescriptions.filter((val, i) => {
      return i !== index;
    });
    setProject((project) => {
      return {
        ...project,
        thresholdIndex: -1,
        endTimestamps: milestones,
        milestoneTitles: titles,
        milestoneDescriptions: descriptions,
      };
    });
  };

  return (
    <>
      <Table colorScheme="whiteAlpha" mt={10}>
        <Thead>
          <Tr>
            <Th px={["4", "4", "6"]} color="gray.300" width="8">
              Threshold
            </Th>
            <Th>Title / Description</Th>
            {isWideVersion && <Th>Deadline</Th>}
            <Th width="8"></Th>
          </Tr>
        </Thead>
        <Tbody>
          {milestoneTitles?.map((title, index) => (
            <Tr key={title}>
              <Td px={["4", "4", "6"]}>
                <Checkbox
                  name={index}
                  isChecked={index === thresholdIndex}
                  colorScheme="green"
                  onChange={setThreshold}
                />
              </Td>
              <Td>
                <Box>
                  <Text fontWeight="bold">{title}</Text>
                  <Text fontSize="sm" color="gray.300">
                    {milestoneDescriptions[index]}
                  </Text>
                </Box>
              </Td>
              {isWideVersion && (
                <Td>
                  {DateTime.fromSeconds(endTimestamps[index]).toISODate()}
                </Td>
              )}
              <Td>
                <Button
                  size="sm"
                  fontSize="sm"
                  colorScheme="red"
                  leftIcon={<Icon as={RiDeleteBin3Line} fontSize="16" />}
                  onClick={() => DeleteMileStone(index)}
                >
                  {isWideVersion ? "Delete" : ""}
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <Flex mt="8" justify="flex-end">
        <HStack>
          <Button
            onClick={() => {
              setStage(0);
            }}
            colorScheme="whiteAlpha"
          >
            Back
          </Button>
          <Button
            colorScheme="green"
            isDisabled={thresholdIndex === -1}
            onClick={handleSubmit}
          >
            Save
          </Button>
        </HStack>
      </Flex>
    </>
  );
};

export default Milestones;
