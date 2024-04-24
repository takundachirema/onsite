/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useOrganizationList } from "@clerk/nextjs";

export const OrgControl = () => {
  const params = useParams();
  const { setActive } = useOrganizationList();

  const activate = async () => {
    if (!setActive) return;

    await setActive({
      organization: params.organizationId as string,
    });
  };

  useEffect(() => {
    activate();
  }, [setActive, params.organizationId]);

  return null;
};
