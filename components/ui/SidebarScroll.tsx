"use client";

import { useCallback, useRef, type HTMLAttributes, type ReactNode } from "react";

interface SidebarScrollProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

export function SidebarScroll({ children, className = "", ...rest }: SidebarScrollProps) {
  const navRef = useRef<HTMLElement | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleScroll = useCallback(() => {
    const el = navRef.current;
    if (!el) return;
    el.classList.add("is-scrolling");
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => el.classList.remove("is-scrolling"), 800);
  }, []);

  return (
    <nav ref={navRef} onScroll={handleScroll} className={`sidebar-scroll ${className}`} {...rest}>
      {children}
    </nav>
  );
}