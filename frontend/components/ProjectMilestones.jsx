import React from "react";
import { DateTime } from "luxon";
import {
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
} from "@chakra-ui/react";
import FinishMilestone from "./Actions/FinishMilestone";

const ProjectMilestones = ({ project, isOwner, id }) => {
  // show header for only owner
  // show button for owner && unfinished milestone
  const isWideVersion = useBreakpointValue({
    base: false,
    lg: true,
  });
  const onGoing = project.status === "ONGOING";
  const coolDownIntervalMet =
    DateTime.now().toSeconds() >
    parseInt(project.coolDownInterval) + parseInt(project.lastUpdateTimestamp);
  const showFinishMilestone = isOwner && onGoing && coolDownIntervalMet;
  const isExpired = (time) => {
    return DateTime.now().toSeconds() > parseInt(time);
  };
  return (
    <Table colorScheme="whiteAlpha" mt={10}>
      <Thead>
        <Tr>
          <Th px={["4", "4", "6"]} color="gray.300" width="8">
            Threshold
          </Th>
          <Th>Title / Description</Th>
          {isWideVersion && <Th>Deadline</Th>}
          {showFinishMilestone && <Th>Actions</Th>}
        </Tr>
      </Thead>
      <Tbody>
        {project.milestones?.map((milestone, index) => (
          <Tr
            key={milestone.endTimestamp}
            bg={!milestone.proofOfWork ? "gray.800" : "green.900"}
          >
            <Td px={["4", "4", "6"]}>
              <Checkbox
                name={index}
                isChecked={index === project.thresholdMilestoneIndex}
                colorScheme="green"
                isDisabled
              />
            </Td>
            <Td>
              <Box>
                <Text fontWeight="bold">{milestone.title}</Text>
                <Text fontSize="sm" color="gray.300">
                  {milestone.description}
                </Text>
              </Box>
            </Td>
            {isWideVersion && (
              <Td>
                {DateTime.fromSeconds(
                  parseInt(milestone.endTimestamp)
                ).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)}
              </Td>
            )}
            {showFinishMilestone &&
              index === parseInt(project.nextMilestone) &&
              !isExpired(milestone.endTimestamp) && (
                <Td>
                  <FinishMilestone id={id} milestoneIndex={index} />
                </Td>
              )}
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default ProjectMilestones;
