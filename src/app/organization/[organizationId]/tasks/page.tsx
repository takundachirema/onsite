"use client";

import KanbanBoard from "$/src/components/Kanban/KanbanBoard";
import { useEffect, useState } from "react";
import { FaPlusCircle } from "react-icons/fa";
import { api } from "$/src/trpc/react";
import React from "react";

import {
  type StatusCode,
  type KanbanCardData,
  type KanbanCardAction,
} from "$/src/utils/types";
import { type Task } from "@prisma/client";
import TaskModal from "$/src/components/Tasks/TaskModal";
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
  const updateTaskMutation = api.tasks.updateTask.useMutation();
  const getTasksQuery = api.tasks.get.useQuery(
    { projectId: selectedProject?.id },
    { enabled: false },
  );

  useEffect(() => {
    getTasksQuery
      .refetch()
      .then((response) => {
        const tasks = response.data ? response.data.data : [];

        const todoCards: KanbanCardData[] = [];
        const inProgressCards: KanbanCardData[] = [];
        const doneCards: KanbanCardData[] = [];
        const approvedCards: KanbanCardData[] = [];

        tasks.map((task) => {
          switch (task.status) {
            case "todo": {
              todoCards.push(kanbanCard(task));
              break;
            }
            case "inprogress": {
              inProgressCards.push(kanbanCard(task));
              break;
            }
            case "done": {
              doneCards.push(kanbanCard(task));
              break;
            }
            case "approved": {
              approvedCards.push(kanbanCard(task));
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

  const onCreate = (response: { success: boolean; data: Task }) => {
    const task = response.data;
    if (response.success) {
      addToKanbanLaneItems(task);
    }
  };

  const onUpdate = (response: { success: boolean; data: Task }) => {
    const task = response.data;
    if (response.success) {
      switch (response.data.status) {
        case "todo": {
          const updatedItems = updateKanbanLaneItems(task, todoItems);
          setTodoItems(updatedItems);
          break;
        }
        case "inprogress": {
          const updatedItems = updateKanbanLaneItems(task, inProgressItems);
          setInProgressItems(updatedItems);
          break;
        }
        case "done": {
          const updatedItems = updateKanbanLaneItems(task, doneItems);
          setDoneItems(updatedItems);
          break;
        }
        case "approved": {
          const updatedItems = updateKanbanLaneItems(task, approvedItems);
          setApprovedItems(updatedItems);
          break;
        }
      }
    }
  };

  const onDelete = (response: { success: boolean; data: Task }) => {
    const task = response.data;
    if (response.success) {
      deleteFromKanbanLaneItems(task);
    }
  };

  const updateTaskStatus = async (
    cardData: KanbanCardData,
    status: StatusCode,
  ) => {
    const taskData = {
      id: cardData.id,
      status: status,
    };

    const updateTaskResponse = await updateTaskMutation.mutateAsync(taskData);
    const updatedTask = updateTaskResponse.data;

    deleteFromKanbanLaneItems(cardData.object as Task);
    addToKanbanLaneItems(updatedTask);
  };

  const addToKanbanLaneItems = (task: Task) => {
    switch (task.status) {
      case "todo": {
        setTodoItems([...todoItems, kanbanCard(task)]);
        break;
      }
      case "inprogress": {
        setInProgressItems([...inProgressItems, kanbanCard(task)]);
        break;
      }
      case "done": {
        setDoneItems([...doneItems, kanbanCard(task)]);
        break;
      }
      case "approved": {
        setApprovedItems([...approvedItems, kanbanCard(task)]);
        break;
      }
    }
  };

  const deleteFromKanbanLaneItems = (task: Task) => {
    switch (task.status) {
      case "todo": {
        const updatedItems = todoItems.filter((item) => {
          if (item.id === task.id) return false;
          return true;
        });
        setTodoItems(updatedItems);
        break;
      }
      case "inprogress": {
        const updatedItems = inProgressItems.filter((item) => {
          if (item.id === task.id) return false;
          return true;
        });
        setInProgressItems(updatedItems);
        break;
      }
      case "done": {
        const updatedItems = doneItems.filter((item) => {
          if (item.id === task.id) return false;
          return true;
        });
        setDoneItems(updatedItems);
        break;
      }
      case "approved": {
        const updatedItems = approvedItems.filter((item) => {
          if (item.id === task.id) return false;
          return true;
        });
        setApprovedItems(updatedItems);
        break;
      }
    }
  };

  const updateKanbanLaneItems = (
    updatedTask: Task,
    items: KanbanCardData[],
  ) => {
    const updatedItems = items.map((task) => {
      if (task.id === updatedTask.id) {
        return kanbanCard(updatedTask);
      }
      return task;
    });

    return updatedItems;
  };

  const kanbanCard = (task: Task & { users?: { id: string }[] }) => {
    return {
      id: task.id,
      title: task.name,
      description: task.description,
      status: task.status,
      users: task.users ? task.users.length : 0,
      actions: [
        {
          label: "Create Task",
          icon: <FaPlusCircle />,
          callback: open,
        },
      ],
      object: task,
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
    updateTaskStatus(cardData, status)
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
            label: "Create Task",
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
      <TaskModal
        onClose={onClose}
        openModal={openModal}
        action={modalAction}
        kanbanCard={modalCard}
      />
    </KanbanContext.Provider>
  );
};

export default OrganizationIdPage;
