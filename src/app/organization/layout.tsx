"use client";

import { Card } from "@nextui-org/react";
import { Sidebar, Menu } from "react-pro-sidebar";
import SidebarMenuItem from "$/src/components/Sidebar/sidebarMenuItem";
import { IoMdAdd } from "react-icons/io";
import { BiSolidBuildingHouse } from "react-icons/bi";
import { MdBedroomParent, MdSpaceDashboard, MdTask } from "react-icons/md";

const OrganizationLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex !h-[100%] flex-row justify-between">
      <div className="m-4 overflow-clip">
        <Sidebar
          className="!h-[100%] !border-transparent"
          backgroundColor="transparent"
        >
          <Card shadow="sm" className="flex h-[100%] flex-col">
            <Menu>
              <SidebarMenuItem
                active={false}
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
              <SidebarMenuItem
                label={"Projects"}
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
              ></SidebarMenuItem>
              <SidebarMenuItem
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
              ></SidebarMenuItem>
              <SidebarMenuItem
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
              ></SidebarMenuItem>
            </Menu>
          </Card>
        </Sidebar>
      </div>
      <div className="m-4 flex w-full gap-x-7">{children}</div>
    </main>
  );
};

export default OrganizationLayout;
