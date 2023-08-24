import { Box, Flex } from "@chakra-ui/react";

import { Sidebar } from "../components/Sidebar";
import useConnected from "../hooks/useConnected";

export default function SidebarLayout({ children }) {
  const { toShow } = useConnected();

  return (
    <Box>
      <Flex w="100%" my="6" maxWidth={1480} mx="auto" px="6">
        <Sidebar />

        {toShow && children}
      </Flex>
    </Box>
  );
}
