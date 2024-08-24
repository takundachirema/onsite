import { type Project } from "@prisma/client";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const projectsAtom = atom<Project[]>([]);
export const selectedProjectAtom = atomWithStorage<Project | undefined>(
  "project",
  undefined,
);
