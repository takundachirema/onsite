/* eslint-disable react-hooks/exhaustive-deps */
import {
  type RoomTypeCode,
  type KanbanCardAction,
  type KanbanCardData,
} from "$/src/utils/types";
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
import { type Task, type Room } from "@prisma/client";
import { api } from "$/src/trpc/react";
import { useContext, useEffect, useState } from "react";
import { FaCheckSquare } from "react-icons/fa";
import { KanbanContext } from "$/src/context/KanbanContext";
import { useAtomValue } from "jotai";
import { selectedProjectAtom } from "$/src/context/JotaiContext";
import { roomTypes } from "$/src/utils/utils";

interface Props {
  openModal: boolean;
  onClose: () => void;
  action: KanbanCardAction;
  kanbanCard: KanbanCardData;
}

const RoomModal = ({
  openModal = false,
  onClose,
  action,
  kanbanCard,
}: Props) => {
  /** react hooks */
  const { onCreate, onUpdate, onDelete } = useContext(KanbanContext)!;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [roomTeam, setRoomTeam] = useState<string[]>([]);

  /** lib hooks */
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const selectedProject = useAtomValue(selectedProjectAtom);

  /** api hooks */
  const createRoomMutation = api.rooms.createRoom.useMutation();
  const updateRoomMutation = api.rooms.updateRoom.useMutation();
  const deleteRoomMutation = api.rooms.deleteRoom.useMutation();
  const getTasksQuery = api.tasks.get.useQuery(
    { projectId: selectedProject?.id },
    { enabled: false },
  );

  /** useeffect hooks */
  useEffect(() => {
    if (openModal) {
      onOpen();
      initRoomTeam();
      if (!getTasksQuery.isFetched) {
        fetchTasks();
      } else {
        setTasks(getTasksQuery.data?.data ?? []);
      }
    }
  }, [openModal]);

  const fetchTasks = () => {
    getTasksQuery
      .refetch()
      .then((response) => {
        setTasks(response.data ? response.data.data : []);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  /** sets the room team ids from the room tasks */
  const initRoomTeam = () => {
    if (!kanbanCard) return;

    const roomTasks = (kanbanCard.object as { tasks: { id: string }[] }).tasks;

    if (!roomTasks) return;

    const taskIds = roomTasks.map((roomTask) => {
      return roomTask.id;
    });

    setRoomTeam(taskIds);
  };

  /**
   * Sends the form data to the server to create the room
   * It calls the callback function with the results
   * @param formData
   */
  const createRoom = async (formData: FormData) => {
    const roomData = {
      projectId: selectedProject?.id ?? "",
      name: formData.get("name")?.toString() ?? "",
      type: (formData.get("type")?.toString() ?? "other") as RoomTypeCode,
      dueDate: formData.get("dueDate") as unknown as Date,
      taskIds: formData.getAll("tasks") as string[],
    };

    const createRoomResponse = await createRoomMutation.mutateAsync(roomData);

    onCreate(createRoomResponse);
  };

  /**
   * Sends the form data to the server to update the room
   * It calls the callback function with the results
   * @param formData
   */
  const updateRoom = async (formData: FormData) => {
    const roomData = {
      id: kanbanCard ? kanbanCard.id : "",
      name: formData.get("name")?.toString() ?? "",
      description: formData.get("description")?.toString() ?? "",
      dueDate: formData.get("dueDate") as unknown as Date,
      taskIds: formData.getAll("tasks") as string[],
    };

    const updateRoomResponse = await updateRoomMutation.mutateAsync(roomData);

    onUpdate(updateRoomResponse);
  };

  const deleteRoom = async () => {
    const deleteRoomResponse = await deleteRoomMutation.mutateAsync({
      id: kanbanCard ? kanbanCard.id : "",
    });

    onDelete(deleteRoomResponse);
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
              ? updateRoom
              : action === "delete"
                ? deleteRoom
                : createRoom
          }
        >
          <ModalHeader className="flex flex-col gap-1">
            {action === "update"
              ? "Update Room"
              : action === "delete"
                ? "Delete Room"
                : "Create Room"}
          </ModalHeader>
          <ModalBody>
            <Input
              name="name"
              label="name"
              placeholder="Enter room name"
              defaultValue={kanbanCard ? kanbanCard.title : ""}
              disabled={action === "delete" ? true : false}
              required
            />
            <Select
              name="type"
              label="Room Type"
              placeholder="Select a room type"
              className="w-full"
              defaultSelectedKeys={[(kanbanCard.object as Room).type]}
              isRequired
            >
              {roomTypes.map((roomType) => (
                <SelectItem key={roomType} textValue={roomType}>
                  <Button radius="full" size="sm" className="w-full">
                    {roomType}
                  </Button>
                </SelectItem>
              ))}
            </Select>
            <DatePicker
              defaultValue={
                (kanbanCard.object as Room).dueDate
                  ? parseDate(
                      (kanbanCard.object as Room).dueDate
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
              name="tasks"
              items={tasks}
              labelPlacement="outside"
              label="Assign Tasks"
              variant="flat"
              isMultiline={false}
              selectionMode="multiple"
              placeholder="Assign Tasks"
              defaultSelectedKeys={roomTeam}
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
              {(task) => (
                <SelectItem key={task.id} textValue={task.name}>
                  <div className="flex items-center gap-2">
                    <FaCheckSquare />
                    <div className="flex flex-col">
                      <span className="text-small">{task.name}</span>
                      <p className="line-clamp-1 text-tiny text-default-400">
                        {task.description}
                      </p>
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

export default RoomModal;
