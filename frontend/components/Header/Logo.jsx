import { Text } from "@chakra-ui/react";
import Link from "next/link";

export function Logo() {
  return (
    <Link href={"/"}>
      <Text
        fontSize={["2xl", "3xl"]}
        fontWeight="bold"
        letterSpacing="tight"
        w="64"
      >
        Toju
        <Text as="span" ml="1" color="green.500">
          .
        </Text>
      </Text>
    </Link>
  );
}
