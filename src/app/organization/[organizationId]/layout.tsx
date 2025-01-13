"use client";

import { Card, Divider } from "@nextui-org/react";
import { Sidebar, Menu } from "react-pro-sidebar";
import SidebarMenuItem from "$/src/components/Sidebar/sidebarMenuItem";
import { IoMdAdd } from "react-icons/io";
import { BiSolidBuildingHouse } from "react-icons/bi";
import { MdBedroomParent, MdSpaceDashboard, MdTask } from "react-icons/md";
import { FaMoneyBill, FaUser } from "react-icons/fa";
import { useAtomValue, useAtom } from "jotai";
import { projectsAtom, selectedProjectAtom } from "$/src/context/JotaiContext";

const OrganizationLayout = ({ children }: { children: React.ReactNode }) => {
  /** react hooks */

  /** lib hooks */
  const projects = useAtomValue(projectsAtom);
  const [selectedProject, setSelectedProject] = useAtom(selectedProjectAtom);

  /** api hooks */

  const projectsMenu = projects.map((project) => {
    return {
      label: project.name,
      icon: <IoMdAdd />,
      callback: () => {
        setSelectedProject(project);
      },
    };
  });

  return (
    <main className="flex !h-[100%] flex-row justify-between">
      <div className="m-4 overflow-clip">
        <Sidebar
          className="!h-[100%] !border-transparent"
          backgroundColor="transparent"
        >
          <Card shadow="sm" className="flex h-[100%] flex-col">
            <Menu className="flex flex-col gap-2">
              <SidebarMenuItem
                link="./projects"
                label={
                  selectedProject ? selectedProject.name : "Select Project"
                }
                icon={<BiSolidBuildingHouse />}
                menuItems={projectsMenu}
              ></SidebarMenuItem>
              <Divider className="ms-6 w-[80%]" />
              <SidebarMenuItem
                link="./dashboard"
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
                disabled={selectedProject ? false : true}
              ></SidebarMenuItem>
              <SidebarMenuItem
                link="./tasks"
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
                disabled={selectedProject ? false : true}
              ></SidebarMenuItem>
              <SidebarMenuItem
                link="./rooms"
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
                disabled={selectedProject ? false : true}
              ></SidebarMenuItem>
              <Divider className="ms-6 w-[80%]" />
              <SidebarMenuItem
                link="./expenses"
                label={"Expenses"}
                icon={<FaMoneyBill />}
                menuItems={[
                  {
                    label: "Add Expense",
                    icon: <IoMdAdd />,
                    callback: () => {
                      console.log("*** pressed");
                    },
                  },
                ]}
                disabled={selectedProject ? false : true}
              ></SidebarMenuItem>
              <SidebarMenuItem
                link="./users"
                label={"Users"}
                icon={<FaUser />}
                menuItems={[
                  {
                    label: "Add User",
                    icon: <IoMdAdd />,
                    callback: () => {
                      console.log("*** pressed");
                    },
                  },
                ]}
                disabled={selectedProject ? false : true}
              ></SidebarMenuItem>
            </Menu>
          </Card>
        </Sidebar>
      </div>
      <div className="m-4 flex w-full gap-x-7 overflow-auto">{children}</div>
    </main>
  );
};

export default OrganizationLayout;
