import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
  Button,
  Kbd,
  Link,
  Input,
  link as linkStyles,
} from "@nextui-org/react";

import {
  FaDiscord,
  FaGithub,
  FaHeart,
  FaSearch,
  FaTwitter,
} from "react-icons/fa";
import { siteConfig } from "$/src/config/site";
import NextLink from "next/link";
import { clsx } from "clsx";

import { ThemeSwitch } from "$/src/components/theme-switch";

import { Logo } from "$/src/components/icons";

export const Navbar = () => {
  const searchInput = (
    <Input
      aria-label="Search"
      classNames={{
        inputWrapper: "bg-default-100",
        input: "text-sm",
      }}
      endContent={
        <Kbd className="hidden lg:inline-block" keys={["command"]}>
          K
        </Kbd>
      }
      labelPlacement="outside"
      placeholder="Search..."
      startContent={
        <FaSearch className="pointer-events-none flex-shrink-0 text-base text-default-400" />
      }
      type="search"
    />
  );

  return (
    <NextUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="max-w-fit gap-3">
          <NextLink className="flex items-center justify-start gap-1" href="/">
            <Logo />
            <p className="font-bold text-inherit">ONSITE</p>
          </NextLink>
        </NavbarBrand>
        <ul className="ml-2 hidden justify-start gap-4 lg:flex">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:font-medium data-[active=true]:text-primary",
                )}
                color="foreground"
                href={item.href}
              >
                {item.label}
              </NextLink>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      <NavbarContent
        className="hidden basis-1/5 sm:flex sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden gap-2 sm:flex">
          <Link isExternal href={siteConfig.links.twitter} aria-label="Twitter">
            <FaTwitter className="text-default-500" />
          </Link>
          <Link isExternal href={siteConfig.links.discord} aria-label="Discord">
            <FaDiscord className="text-default-500" />
          </Link>
          <Link isExternal href={siteConfig.links.github} aria-label="Github">
            <FaGithub className="text-default-500" />
          </Link>
          <ThemeSwitch />
        </NavbarItem>
        <NavbarItem className="hidden lg:flex">{searchInput}</NavbarItem>
        <NavbarItem className="hidden md:flex">
          <Button
            isExternal
            as={Link}
            className="bg-default-100 text-sm font-normal text-default-600"
            href={siteConfig.links.sponsor}
            startContent={<FaHeart className="text-danger" />}
            variant="flat"
          >
            Sponsor
          </Button>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="basis-1 pl-4 sm:hidden" justify="end">
        <Link isExternal href={siteConfig.links.github} aria-label="Github">
          <FaGithub className="text-default-500" />
        </Link>
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        {searchInput}
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item.label}-${index}`}>
              <Link
                color={
                  index === 2
                    ? "primary"
                    : index === siteConfig.navMenuItems.length - 1
                      ? "danger"
                      : "foreground"
                }
                href="#"
                size="lg"
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </NextUINavbar>
  );
};