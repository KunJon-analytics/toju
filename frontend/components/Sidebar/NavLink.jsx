import { Icon, Link as ChakraLink, Text } from "@chakra-ui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ icon, children, href, ...rest }) {
  const pathname = usePathname();
  const isActive = pathname?.startsWith(href);
  return (
    <ChakraLink
      display="flex"
      as={Link}
      href={href}
      align="center"
      {...rest}
      color={isActive ? "green.400" : "gray.50"}
    >
      <Icon as={icon} fontSize="20" />
      <Text ml="4" fontWeight="medium">
        {children}
      </Text>
    </ChakraLink>
  );
}
