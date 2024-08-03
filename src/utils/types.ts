import { type SVGProps } from "react";
import { type IconType } from "react-icons/lib";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export interface SidebarItem {
  label: string;
  icon: React.ReactNode;
  callback(arg: any): void;
  class?: string;
}

export type Response = {
  message: string;
  success: boolean;
  data: unknown;
  cursor?: string | undefined;
};

type Period = {
  start: Date;
  end: Date;
};

export type ListingSummary = {
  suburbName?: string;
  suburbId?: number;
  period?: Period;
  averageListingPrice?: number;
  averageSoldPrice?: number;
  averageListingTime?: number;
};

export type Feature = {
  id: number;
  icon: React.ReactNode;
  title: string;
  paragraph: string;
};

export type Testimonial = {
  id: number;
  name: string;
  designation: string;
  content: string;
  image: string;
  star: number;
};
