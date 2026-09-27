"use client";

import NextLink from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

/**
 * Next.js adapter for the original `Link` API (`<Link href="...">`).
 * Internal links use next/link (fast client-side nav + prefetch),
 * external links render a plain anchor.
 */
interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  children?: ReactNode;
  prefetch?: boolean;
  scroll?: boolean;
}

const isExternal = (href: string) => /^(https?:|mailto:|tel:|#)/i.test(href);

export default function Link({ href, children, prefetch, scroll, ...rest }: LinkProps) {
  if (isExternal(href)) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <NextLink href={href} prefetch={prefetch} scroll={scroll} {...rest}>
      {children}
    </NextLink>
  );
}
