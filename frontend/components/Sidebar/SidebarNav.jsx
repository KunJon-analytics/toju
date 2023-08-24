import React from "react";

import { Stack } from "@chakra-ui/react";
import { RiCoinsLine } from "react-icons/ri";
import { AiFillProject } from "react-icons/ai";

import { NavLink } from "./NavLink";
import { NavSection } from "./NavSection";

export function SidebarNav() {
  return (
    <Stack spacing="12" align="flex-start">
      <NavSection title="GENERAL">
        <NavLink icon={AiFillProject} href="/projects">
          Projects
        </NavLink>
      </NavSection>

      <NavSection title="TOJU Token">
        <NavLink icon={RiCoinsLine} href="/mint">
          Mint
        </NavLink>
      </NavSection>
    </Stack>
  );
}
