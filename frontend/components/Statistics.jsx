import {
  Box,
  chakra,
  Flex,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
} from "@chakra-ui/react";
import { BsPerson } from "react-icons/bs";
import { FiServer } from "react-icons/fi";
import { MdCurrencyExchange } from "react-icons/md";
import { useContractRead } from "wagmi";

import { tojuConfig } from "./contract";

function StatsCard(props) {
  const { title, stat, icon } = props;
  return (
    <Stat
      px={{ base: 2, md: 4 }}
      py={"5"}
      shadow={"xl"}
      border={"1px solid"}
      borderColor={useColorModeValue("gray.800", "gray.500")}
      rounded={"lg"}
    >
      <Flex justifyContent={"space-between"}>
        <Box pl={{ base: 2, md: 4 }}>
          <StatLabel fontWeight={"medium"} isTruncated>
            {title}
          </StatLabel>
          <StatNumber fontSize={"2xl"} fontWeight={"medium"}>
            {stat}
          </StatNumber>
        </Box>
        <Box
          my={"auto"}
          color={useColorModeValue("gray.800", "gray.200")}
          alignContent={"center"}
        >
          {icon}
        </Box>
      </Flex>
    </Stat>
  );
}

export default function Statistics() {
  const { data: count, isLoading: countLoading } = useContractRead({
    ...tojuConfig,
    functionName: "counter",
  });
  return (
    <Box maxW="4xl" mx={"auto"} pt={5} px={{ base: 2, sm: 12, md: 17 }}>
      <chakra.h1
        textAlign={"center"}
        fontSize={"4xl"}
        py={10}
        fontWeight={"bold"}
      >
        Elevate Impact: By the Numbers.
      </chakra.h1>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 5, lg: 8 }}>
        <StatsCard
          title={"Users"}
          stat={"5,000"}
          icon={<BsPerson size={"3em"} />}
        />
        {!countLoading && (
          <StatsCard
            title={"Projects"}
            stat={parseInt(count)}
            icon={<FiServer size={"3em"} />}
          />
        )}
        <StatsCard
          title={"TOJU Exchanged"}
          stat={"1,000,000"}
          icon={<MdCurrencyExchange size={"3em"} />}
        />
      </SimpleGrid>
    </Box>
  );
}
