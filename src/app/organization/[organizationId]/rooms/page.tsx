"use client";

import KanbanBoard from "$/src/components/Kanban/KanbanBoard";
import { useEffect, useState } from "react";
import { FaCheck, FaList, FaPlusCircle, FaUsers } from "react-icons/fa";
import { api } from "$/src/trpc/react";
import React from "react";

import {
  type StatusCode,
  type KanbanCardData,
  type KanbanCardAction,
} from "$/src/utils/types";
import { type Room } from "@prisma/client";
import RoomModal from "$/src/components/Rooms/RoomModal";
import { KanbanContext } from "$/src/context/KanbanContext";
import { useAtomValue } from "jotai";
import { selectedProjectAtom } from "$/src/context/JotaiContext";

const OrganizationIdPage = () => {
  /** react hooks */

  //Temporary variables to hold cards shown in modal before being edited or deleted
  const [modalCard, setModalCard] = useState<KanbanCardData>({
    title: "",
    id: "",
    object: {},
    status: "todo",
    progress: 0,
    actions: [],
  });
  const [modalAction, setModalAction] = useState<KanbanCardAction>("create");
  const [openModal, setOpenModal] = useState(false);

  // board items
  const [todoItems, setTodoItems] = useState<KanbanCardData[]>([]);
  const [inProgressItems, setInProgressItems] = useState<KanbanCardData[]>([]);
  const [doneItems, setDoneItems] = useState<KanbanCardData[]>([]);
  const [approvedItems, setApprovedItems] = useState<KanbanCardData[]>([]);

  /** lib hooks */
  const selectedProject = useAtomValue(selectedProjectAtom);

  /** api hooks */
  const updateRoomMutation = api.rooms.updateRoom.useMutation();
  const getRoomsQuery = api.rooms.get.useQuery(
    { projectId: selectedProject?.id },
    { enabled: false },
  );

  useEffect(() => {
    getRoomsQuery
      .refetch()
      .then((response) => {
        const rooms = response.data ? response.data.data : [];

        const todoCards: KanbanCardData[] = [];
        const inProgressCards: KanbanCardData[] = [];
        const doneCards: KanbanCardData[] = [];
        const approvedCards: KanbanCardData[] = [];

        rooms.map((room) => {
          switch (room.status) {
            case "todo": {
              todoCards.push(kanbanCard(room));
              break;
            }
            case "inprogress": {
              inProgressCards.push(kanbanCard(room));
              break;
            }
            case "done": {
              doneCards.push(kanbanCard(room));
              break;
            }
            case "approved": {
              approvedCards.push(kanbanCard(room));
              break;
            }
          }
        });

        setTodoItems(todoCards);
        setInProgressItems(inProgressCards);
        setDoneItems(doneCards);
        setApprovedItems(approvedCards);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [selectedProject]);

  const onCreate = (response: { success: boolean; data: Room }) => {
    const room = response.data;
    if (response.success) {
      addToKanbanLaneItems(room);
    }
  };

  const onUpdate = (response: { success: boolean; data: Room }) => {
    const room = response.data;
    if (response.success) {
      switch (response.data.status) {
        case "todo": {
          const updatedItems = updateKanbanLaneItems(room, todoItems);
          setTodoItems(updatedItems);
          break;
        }
        case "inprogress": {
          const updatedItems = updateKanbanLaneItems(room, inProgressItems);
          setInProgressItems(updatedItems);
          break;
        }
        case "done": {
          const updatedItems = updateKanbanLaneItems(room, doneItems);
          setDoneItems(updatedItems);
          break;
        }
        case "approved": {
          const updatedItems = updateKanbanLaneItems(room, approvedItems);
          setApprovedItems(updatedItems);
          break;
        }
      }
    }
  };

  const onDelete = (response: { success: boolean; data: Room }) => {
    const room = response.data;
    if (response.success) {
      deleteFromKanbanLaneItems(room);
    }
  };

  const updateRoomStatus = async (
    cardData: KanbanCardData,
    status: StatusCode,
  ) => {
    const roomData = {
      id: cardData.id,
      status: status,
    };

    const updateRoomResponse = await updateRoomMutation.mutateAsync(roomData);
    const updatedRoom = updateRoomResponse.data;

    deleteFromKanbanLaneItems(cardData.object as Room);
    addToKanbanLaneItems(updatedRoom);
  };

  const addToKanbanLaneItems = (room: Room) => {
    switch (room.status) {
      case "todo": {
        setTodoItems([...todoItems, kanbanCard(room)]);
        break;
      }
      case "inprogress": {
        setInProgressItems([...inProgressItems, kanbanCard(room)]);
        break;
      }
      case "done": {
        setDoneItems([...doneItems, kanbanCard(room)]);
        break;
      }
      case "approved": {
        setApprovedItems([...approvedItems, kanbanCard(room)]);
        break;
      }
    }
  };

  const deleteFromKanbanLaneItems = (room: Room) => {
    switch (room.status) {
      case "todo": {
        const updatedItems = todoItems.filter((item) => {
          if (item.id === room.id) return false;
          return true;
        });
        setTodoItems(updatedItems);
        break;
      }
      case "inprogress": {
        const updatedItems = inProgressItems.filter((item) => {
          if (item.id === room.id) return false;
          return true;
        });
        setInProgressItems(updatedItems);
        break;
      }
      case "done": {
        const updatedItems = doneItems.filter((item) => {
          if (item.id === room.id) return false;
          return true;
        });
        setDoneItems(updatedItems);
        break;
      }
      case "approved": {
        const updatedItems = approvedItems.filter((item) => {
          if (item.id === room.id) return false;
          return true;
        });
        setApprovedItems(updatedItems);
        break;
      }
    }
  };

  const updateKanbanLaneItems = (
    updatedRoom: Room,
    items: KanbanCardData[],
  ) => {
    const updatedItems = items.map((room) => {
      if (room.id === updatedRoom.id) {
        return kanbanCard(updatedRoom);
      }
      return room;
    });

    return updatedItems;
  };

  const kanbanCard = (room: Room & { tasks?: { id: string }[] }) => {
    return {
      id: room.id,
      title: room.name,
      progress: room.progress,
      status: room.status,
      info: { icon: <FaList />, quantity: room.tasks ? room.tasks.length : 0 },
      actions: [
        {
          label: "Create Room",
          icon: <FaPlusCircle />,
          callback: open,
        },
      ],
      object: room,
    } as KanbanCardData;
  };

  const createCard = () => {
    setOpenModal(true);
  };

  const editCard = (cardData: KanbanCardData) => {
    setModalCard(cardData);
    setModalAction("update");
    setOpenModal(true);
  };

  const deleteCard = (cardData: KanbanCardData) => {
    setModalCard(cardData);
    setModalAction("delete");
    setOpenModal(true);
  };

  const moveCard = (cardData: KanbanCardData, status: StatusCode) => {
    updateRoomStatus(cardData, status)
      .then(() => {
        console.log("card moved");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const onClose = () => {
    setOpenModal(false);
  };

  return (
    <KanbanContext.Provider
      value={{
        todoItems: todoItems,
        inProgressItems: inProgressItems,
        doneItems: doneItems,
        approvedItems: approvedItems,
        actionBarItems: [
          {
            label: "Create Room",
            icon: <FaPlusCircle />,
            callback: createCard,
          },
        ],
        createCard: createCard,
        updateCard: editCard,
        deleteCard: deleteCard,
        moveCard: moveCard,
        onCreate: onCreate,
        onUpdate: onUpdate,
        onDelete: onDelete,
      }}
    >
      <KanbanBoard />
      <RoomModal
        onClose={onClose}
        openModal={openModal}
        action={modalAction}
        kanbanCard={modalCard}
      />
    </KanbanContext.Provider>
  );
};

export default OrganizationIdPage;
