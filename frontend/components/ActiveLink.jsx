import React from "react";

import Link from "next/link";
import { useRouter } from "next/router";
import { cloneElement } from "react";

export function ActiveLink({
  children,
  shouldMatchExactHref = false,
  ...rest
}) {
  const { asPath } = useRouter();

  let isActive = false;

  if (shouldMatchExactHref && (asPath === rest.href || asPath === rest.as)) {
    isActive = true;
  }

  if (
    !shouldMatchExactHref &&
    (asPath.startsWith(String(rest.href)) || asPath.startsWith(String(rest.as)))
  ) {
    isActive = true;
  }

  return (
    <Link {...rest}>
      {cloneElement(children, {
        color: isActive ? "green.400" : "gray.50",
      })}
    </Link>
  );
}
