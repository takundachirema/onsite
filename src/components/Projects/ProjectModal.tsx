/* eslint-disable react-hooks/exhaustive-deps */
import { type KanbanCardAction, type KanbanCardData } from "$/src/utils/types";
import { parseDate } from "@internationalized/date";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Input,
  DatePicker,
  ModalFooter,
  Button,
  useDisclosure,
  Select,
  SelectItem,
  Chip,
} from "@nextui-org/react";
import { type User, type Project } from "@prisma/client";
import { api } from "$/src/trpc/react";
import { useContext, useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { useOrganization } from "@clerk/nextjs";
import { KanbanContext } from "$/src/context/KanbanContext";

interface Props {
  openModal: boolean;
  onClose: () => void;
  action: KanbanCardAction;
  kanbanCard: KanbanCardData;
}

const ProjectModal = ({
  openModal = false,
  onClose,
  action,
  kanbanCard,
}: Props) => {
  /** react hooks */
  const { onCreate, onUpdate, onDelete } = useContext(KanbanContext)!;
  const [users, setUsers] = useState<User[]>([]);
  const [projectTeam, setProjectTeam] = useState<string[]>([]);

  /** lib hooks */
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { organization } = useOrganization();

  /** api hooks */
  const createProjectMutation = api.projects.createProject.useMutation();
  const updateProjectMutation = api.projects.updateProject.useMutation();
  const deleteProjectMutation = api.projects.deleteProject.useMutation();
  const getUsersQuery = api.users.get.useQuery(
    { organizationId: organization?.id },
    { enabled: false },
  );

  /** useeffect hooks */
  useEffect(() => {
    if (openModal) {
      onOpen();
      initProjectTeam();
      if (!getUsersQuery.isFetched) {
        fetchUsers();
      } else {
        setUsers(getUsersQuery.data?.data ?? []);
      }
    }
  }, [openModal]);

  const fetchUsers = () => {
    getUsersQuery
      .refetch()
      .then((response) => {
        setUsers(response.data ? response.data.data : []);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  /** sets the project team ids from the project users */
  const initProjectTeam = () => {
    if (!kanbanCard) return;

    const projectUsers = (kanbanCard.object as { users: { id: string }[] })
      .users;

    if (!projectUsers) return;

    const userIds = projectUsers.map((projectUser) => {
      return projectUser.id;
    });

    setProjectTeam(userIds);
  };
  /**
   * Sends the form data to the server to create the project
   * It calls the callback function with the results
   * @param formData
   */
  const createProject = async (formData: FormData) => {
    const projectData = {
      name: formData.get("name")?.toString() ?? "",
      dueDate: formData.get("dueDate") as unknown as Date,
      userIds: formData.getAll("project-team") as string[],
    };

    const createProjectResponse =
      await createProjectMutation.mutateAsync(projectData);

    onCreate(createProjectResponse);
  };

  /**
   * Sends the form data to the server to update the project
   * It calls the callback function with the results
   * @param formData
   */
  const updateProject = async (formData: FormData) => {
    const projectData = {
      id: kanbanCard ? kanbanCard.id : "",
      name: formData.get("name")?.toString() ?? "",
      dueDate: formData.get("dueDate") as unknown as Date,
      userIds: formData.getAll("project-team") as string[],
    };

    const updateProjectResponse =
      await updateProjectMutation.mutateAsync(projectData);

    onUpdate(updateProjectResponse);
  };

  const deleteProject = async () => {
    const deleteProjectResponse = await deleteProjectMutation.mutateAsync({
      id: kanbanCard ? kanbanCard.id : "",
    });

    onDelete(deleteProjectResponse);
  };

  return (
    <Modal
      onClose={onClose}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="top-center"
    >
      <ModalContent>
        <form
          action={
            action === "update"
              ? updateProject
              : action === "delete"
                ? deleteProject
                : createProject
          }
        >
          <ModalHeader className="flex flex-col gap-1">
            {action === "update"
              ? "Update Project"
              : action === "delete"
                ? "Delete Project"
                : "Create Project"}
          </ModalHeader>
          <ModalBody>
            <Input
              name="name"
              label="name"
              placeholder="Enter project name"
              defaultValue={kanbanCard ? kanbanCard.title : ""}
              disabled={action === "delete" ? true : false}
              required
            />
            <DatePicker
              defaultValue={
                (kanbanCard.object as Project).dueDate
                  ? parseDate(
                      (kanbanCard.object as Project).dueDate
                        .toISOString()
                        .split("T")[0]!,
                    )
                  : undefined
              }
              name="dueDate"
              label="Due Date"
              isDisabled={action === "delete" ? true : false}
              isRequired
            />
            <Select
              name="project-team"
              items={users}
              labelPlacement="outside"
              label="Project Team"
              variant="flat"
              isMultiline={false}
              selectionMode="multiple"
              placeholder="Select Team"
              defaultSelectedKeys={projectTeam}
              classNames={{
                base: "w-full",
                trigger: "min-h-12 py-2",
              }}
              renderValue={(items) => {
                return (
                  <div className="flex flex-wrap gap-2">
                    {items.map((item) => (
                      <Chip key={item.key}>{item.data?.name}</Chip>
                    ))}
                  </div>
                );
              }}
            >
              {(user) => (
                <SelectItem key={user.id} textValue={user.name}>
                  <div className="flex items-center gap-2">
                    <FaUserCircle />
                    <div className="flex flex-col">
                      <span className="text-small">{user.name}</span>
                      <span className="text-tiny text-default-400">
                        {user.email}
                      </span>
                    </div>
                  </div>
                </SelectItem>
              )}
            </Select>
          </ModalBody>
          <ModalFooter>
            <Button
              onPress={onClose}
              type="submit"
              color={action === "delete" ? "danger" : "default"}
            >
              {action === "update"
                ? "Update"
                : action === "delete"
                  ? "Delete"
                  : "Create"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default ProjectModal;
