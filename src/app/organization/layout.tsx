"use client";

import { Card } from "@nextui-org/react";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { ThemeColors, commonColors, semanticColors } from "@nextui-org/theme";
import SidebarMenuItem from "$/src/components/Sidebar/sidebarMenuItem";
import { IoMdAdd } from "react-icons/io";
import SidebarSubMenu from "$/src/components/Sidebar/sidebarSubMenu";
import { BiSolidBuildingHouse } from "react-icons/bi";
import { MdBedroomParent, MdSpaceDashboard, MdTask } from "react-icons/md";

const OrganizationLayout = ({ children }: { children: React.ReactNode }) => {
  console.log("** sem col");
  console.log(semanticColors.dark.default[300]);
  return (
    <main className="flex flex-row justify-between">
      <div className=" mb-40">
        <Sidebar
          className="!fixed z-0 m-2 !mb-40 h-screen !border-transparent"
          backgroundColor="transparent"
        >
          <Card shadow="sm" className="m-2 flex h-[80%] flex-col">
            <Menu>
              <SidebarSubMenu
                label={"Choose Project"}
                icon={<BiSolidBuildingHouse />}
                menuItems={[
                  {
                    label: "Add Project",
                    icon: <IoMdAdd />,
                    callback: () => {
                      console.log("*** pressed");
                    },
                  },
                ]}
              >
                <MenuItem> Pie charts </MenuItem>
                <MenuItem> Line charts </MenuItem>
              </SidebarSubMenu>
              <SidebarMenuItem
                label={"Dashboard"}
                icon={<MdSpaceDashboard />}
                menuItems={[
                  {
                    label: "Add Project",
                    icon: <IoMdAdd />,
                    callback: () => {
                      console.log("*** pressed");
                    },
                  },
                ]}
              ></SidebarMenuItem>
              <SidebarSubMenu
                label={"Tasks"}
                icon={<MdTask />}
                menuItems={[
                  {
                    label: "Add Task",
                    icon: <IoMdAdd />,
                    callback: () => {
                      console.log("*** pressed");
                    },
                  },
                ]}
              >
                <MenuItem> Pie charts </MenuItem>
                <MenuItem> Line charts </MenuItem>
              </SidebarSubMenu>
              <SidebarSubMenu
                label={"Rooms"}
                icon={<MdBedroomParent />}
                menuItems={[
                  {
                    label: "Add Room",
                    icon: <IoMdAdd />,
                    callback: () => {
                      console.log("*** pressed");
                    },
                  },
                ]}
              >
                <MenuItem> Pie charts </MenuItem>
                <MenuItem> Line charts </MenuItem>
              </SidebarSubMenu>
            </Menu>
          </Card>
        </Sidebar>
      </div>
      <div className="m-4 flex w-full gap-x-7">
        <div className="hidden w-64 shrink-0 md:block"></div>
        {children}
      </div>
    </main>
  );
};

export default OrganizationLayout;
