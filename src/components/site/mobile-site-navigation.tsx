"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";

type NavigationLink = {
  href: string;
  label: string;
};

export function MobileSiteNavigation({
  links,
  defaultOpen = false,
  labels,
  navigationLabel,
}: {
  links: readonly NavigationLink[];
  defaultOpen?: boolean;
  labels: { open: string; close: string };
  navigationLabel: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <div className="site-mobile-navigation">
      <button
        aria-controls="site-mobile-navigation-panel"
        aria-expanded={isOpen}
        aria-label={isOpen ? labels.close : labels.open}
        className="site-mobile-menu-button"
        onClick={() => setIsOpen((open) => !open)}
        ref={buttonRef}
        type="button"
      >
        <Menu
          aria-hidden="true"
          className={`site-mobile-menu-icon${isOpen ? "" : " site-mobile-menu-icon--visible"}`}
          size={20}
        />
        <X
          aria-hidden="true"
          className={`site-mobile-menu-icon${isOpen ? " site-mobile-menu-icon--visible" : ""}`}
          size={20}
        />
      </button>
      <div
        className="site-mobile-navigation-panel"
        data-open={isOpen}
        id="site-mobile-navigation-panel"
      >
        <nav
          aria-label={navigationLabel}
          className="site-mobile-navigation-list"
          inert={!isOpen}
        >
          {links.map(({ href, label }) => (
            <Link
              className={
                href === "/contact"
                  ? "button button--primary-outlined site-nav-cta"
                  : "site-mobile-nav-link"
              }
              href={href}
              key={href}
              onClick={() => setIsOpen(false)}
            >
              {label}
              {href === "/contact" && (
                <ArrowUpRight aria-hidden="true" size={14} />
              )}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
