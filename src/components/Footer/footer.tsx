import { Button, Link, Navbar as NextUINavbar } from "@nextui-org/react";
import { FaDiscord, FaGithub, FaTwitter } from "react-icons/fa";
import { siteConfig } from "../../config/site";
import { Logo } from "../Icons/icons";

export const Footer = () => {
  return (
    <NextUINavbar maxWidth="xl">
      <div className="mx-auto flex w-full items-center justify-between md:max-w-screen-2xl">
        <div className="flex w-full items-center justify-start space-x-4 md:block md:w-auto">
          <Link isExternal href={siteConfig.links.twitter} aria-label="Twitter">
            <FaTwitter className="text-default-900" />
          </Link>
          <Link isExternal href={siteConfig.links.discord} aria-label="Discord">
            <FaDiscord className="text-default-900" />
          </Link>
          <Link isExternal href={siteConfig.links.github} aria-label="Github">
            <FaGithub className="text-default-900" />
          </Link>
        </div>
        <div className="flex w-full items-center justify-end space-x-4 md:block md:w-auto">
          <Button color="primary" size="md" variant="flat">
            Privacy Policy
          </Button>
          <Button color="primary" size="md" variant="flat">
            Terms of Service
          </Button>
        </div>
      </div>
    </NextUINavbar>
  );
};
