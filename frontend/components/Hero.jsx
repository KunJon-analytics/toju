import {
  Box,
  Heading,
  Container,
  Text,
  Stack,
  Button,
  Icon,
} from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { AiFillProject } from "react-icons/ai";

import useConnected from "../hooks/useConnected";
import { useRouter } from "next/router";

export default function Hero() {
  const { toShow } = useConnected();
  const router = useRouter();
  return (
    <>
      <Container maxW={"3xl"}>
        <Stack
          as={Box}
          textAlign={"center"}
          spacing={{ base: 8, md: 14 }}
          py={{ base: 20, md: 30 }}
        >
          <Heading
            fontWeight={600}
            fontSize={{ base: "2xl", sm: "4xl", md: "6xl" }}
            lineHeight={"110%"}
          >
            Redefining risk, fostering innovation <br />
            <Text as={"span"} color={"green.400"}>
              uniting ambitions
            </Text>
          </Heading>
          <Text color={"gray.500"}>
            A platform where creators fuel their passions with TOJU, their
            commitment backed by stakes. As a devoted supporter, you become the
            wind beneath their wings, ushering dreams into reality.
          </Text>
          <Stack
            direction={"column"}
            spacing={3}
            align={"center"}
            alignSelf={"center"}
            position={"relative"}
          >
            {toShow ? (
              <Button
                size="md"
                onClick={() => router.push("/projects")}
                fontSize="sm"
                colorScheme="green"
                leftIcon={<Icon as={AiFillProject} fontSize="20" />}
              >
                See Projects
              </Button>
            ) : (
              <ConnectButton label="Get Started" />
            )}
          </Stack>
        </Stack>
      </Container>
    </>
  );
}
