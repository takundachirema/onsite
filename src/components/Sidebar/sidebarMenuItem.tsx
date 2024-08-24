import { type SidebarItem } from "$/src/utils/types";
import {
  Button,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { IoMdMore } from "react-icons/io";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface Props {
  link: string;
  label: string;
  icon: React.ReactNode;
  menuItems: SidebarItem[];
  disabled?: boolean;
  className?: string;
}

export default function SidebarMenuItem({
  link,
  label,
  icon,
  menuItems,
  disabled = false,
  className = "",
}: Props) {
  /** react hooks */
  const [active, setActive] = useState(false);
  /** lib hooks */
  /** api hooks */
  const pathname = usePathname();

  useEffect(() => {
    // alert(pathname);
    if (link && pathname.split("/").pop() === link.split("/").pop()) {
      setActive(true);
    } else {
      setActive(false);
    }
  }, [pathname]);

  return (
    <div className="flex flex-row items-center">
      <Divider
        className="mr-2 !h-12 w-2 rounded-r-md bg-primary-300"
        orientation="vertical"
        hidden={!active}
      />
      <div
        className={`flex w-full flex-row items-center justify-between p-3 ${className}`}
      >
        <Link
          href={disabled ? "" : link}
          className={`flex w-full flex-row items-center gap-4 ${disabled ? "text-default-200" : ""}`}
        >
          {icon}
          {label}
        </Link>

        {menuItems.length > 0 && (
          <Dropdown>
            <DropdownTrigger>
              <Button variant="light" isIconOnly>
                <IoMdMore />
              </Button>
            </DropdownTrigger>
            <DropdownMenu className="rounded-none">
              {menuItems.map((menuItem) => (
                <DropdownItem
                  onClick={() => {
                    menuItem.callback();
                  }}
                  key={menuItem.label}
                >
                  <div className="flex flex-row items-center gap-2">
                    {menuItem.icon}
                    {menuItem.label}
                  </div>
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        )}
      </div>
    </div>
  );
}
