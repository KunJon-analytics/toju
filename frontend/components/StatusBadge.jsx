import React from "react";
import { Badge } from "@chakra-ui/react";

const StatusBadge = ({ status }) => {
  const getColorScheme = () => {
    let color;
    if (status === "PENDING") {
      color = "purple";
    } else if (status === "ONGOING") {
      color = "green";
    } else {
      color = "blue";
    }
    return color;
  };
  return <Badge colorScheme={getColorScheme()}>{status}</Badge>;
};

export default StatusBadge;
