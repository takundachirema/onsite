"use client";

import { Button, Card, Link } from "@nextui-org/react";
import { FaDiscord, FaGithub, FaTwitter } from "react-icons/fa";
import { siteConfig } from "../config/site";

export const Footer = () => {
  return (
    <Card className="fixed bottom-0 flex w-full flex-row items-center justify-between rounded-none px-20 py-4">
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
    </Card>
  );
};
