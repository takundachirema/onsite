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
  Textarea,
} from "@nextui-org/react";
import { type User, type Task } from "@prisma/client";
import { api } from "$/src/trpc/react";
import { useContext, useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { useOrganization } from "@clerk/nextjs";
import { KanbanContext } from "$/src/context/KanbanContext";
import { useAtomValue } from "jotai";
import { selectedProjectAtom } from "$/src/context/JotaiContext";
import { describe } from "node:test";

interface Props {
  openModal: boolean;
  onClose: () => void;
  action: KanbanCardAction;
  kanbanCard: KanbanCardData;
}

const TaskModal = ({
  openModal = false,
  onClose,
  action,
  kanbanCard,
}: Props) => {
  /** react hooks */
  const { onCreate, onUpdate, onDelete } = useContext(KanbanContext)!;
  const [users, setUsers] = useState<User[]>([]);
  const [taskTeam, setTaskTeam] = useState<string[]>([]);

  /** lib hooks */
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { organization } = useOrganization();
  const selectedProject = useAtomValue(selectedProjectAtom);

  /** api hooks */
  const createTaskMutation = api.tasks.createTask.useMutation();
  const updateTaskMutation = api.tasks.updateTask.useMutation();
  const deleteTaskMutation = api.tasks.deleteTask.useMutation();
  const getUsersQuery = api.users.get.useQuery(
    { organizationId: organization?.id },
    { enabled: false },
  );

  /** useeffect hooks */
  useEffect(() => {
    if (openModal) {
      onOpen();
      initTaskTeam();
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

  /** sets the task team ids from the task users */
  const initTaskTeam = () => {
    if (!kanbanCard) return;

    const taskUsers = (kanbanCard.object as { users: { id: string }[] }).users;

    if (!taskUsers) return;

    const userIds = taskUsers.map((taskUser) => {
      return taskUser.id;
    });

    setTaskTeam(userIds);
  };
  /**
   * Sends the form data to the server to create the task
   * It calls the callback function with the results
   * @param formData
   */
  const createTask = async (formData: FormData) => {
    const taskData = {
      projectId: selectedProject?.id ?? "",
      name: formData.get("name")?.toString() ?? "",
      description: formData.get("description")?.toString() ?? "",
      dueDate: formData.get("dueDate") as unknown as Date,
      userIds: formData.getAll("assigned-to") as string[],
    };

    const createTaskResponse = await createTaskMutation.mutateAsync(taskData);

    onCreate(createTaskResponse);
  };

  /**
   * Sends the form data to the server to update the task
   * It calls the callback function with the results
   * @param formData
   */
  const updateTask = async (formData: FormData) => {
    const taskData = {
      id: kanbanCard ? kanbanCard.id : "",
      name: formData.get("name")?.toString() ?? "",
      description: formData.get("description")?.toString() ?? "",
      dueDate: formData.get("dueDate") as unknown as Date,
      userIds: formData.getAll("assigned-to") as string[],
    };

    const updateTaskResponse = await updateTaskMutation.mutateAsync(taskData);

    onUpdate(updateTaskResponse);
  };

  const deleteTask = async () => {
    const deleteTaskResponse = await deleteTaskMutation.mutateAsync({
      id: kanbanCard ? kanbanCard.id : "",
    });

    onDelete(deleteTaskResponse);
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
              ? updateTask
              : action === "delete"
                ? deleteTask
                : createTask
          }
        >
          <ModalHeader className="flex flex-col gap-1">
            {action === "update"
              ? "Update Task"
              : action === "delete"
                ? "Delete Task"
                : "Create Task"}
          </ModalHeader>
          <ModalBody>
            <Input
              name="name"
              label="name"
              placeholder="Enter task name"
              defaultValue={kanbanCard ? kanbanCard.title : ""}
              disabled={action === "delete" ? true : false}
              required
            />
            <Textarea
              name="description"
              label="Description"
              placeholder="Enter the task description"
              defaultValue={(kanbanCard.object as Task).description}
              className="w-full"
            />
            <DatePicker
              defaultValue={
                (kanbanCard.object as Task).dueDate
                  ? parseDate(
                      (kanbanCard.object as Task).dueDate
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
              name="assigned-to"
              items={users}
              labelPlacement="outside"
              label="Assigned To"
              variant="flat"
              isMultiline={false}
              selectionMode="multiple"
              placeholder="Assign Task"
              defaultSelectedKeys={taskTeam}
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

export default TaskModal;
