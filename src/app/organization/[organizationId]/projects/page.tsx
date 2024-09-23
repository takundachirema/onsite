"use client";

import KanbanBoard from "$/src/components/Kanban/KanbanBoard";
import { useEffect, useState } from "react";
import { FaPlusCircle, FaUsers } from "react-icons/fa";
import { api } from "$/src/trpc/react";
import React from "react";

import {
  type StatusCode,
  type KanbanCardData,
  type KanbanCardAction,
} from "$/src/utils/types";
import { type Project } from "@prisma/client";
import ProjectModal from "$/src/components/Projects/ProjectModal";
import { KanbanContext } from "$/src/context/KanbanContext";
import { useSetAtom, useAtom } from "jotai";
import { projectsAtom, selectedProjectAtom } from "$/src/context/JotaiContext";

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
  const [todoItems, setTodoItems] = useState<KanbanCardData[]>([]);
  const [inProgressItems, setInProgressItems] = useState<KanbanCardData[]>([]);
  const [doneItems, setDoneItems] = useState<KanbanCardData[]>([]);
  const [approvedItems, setApprovedItems] = useState<KanbanCardData[]>([]);

  /** lib hooks */
  const setProjects = useSetAtom(projectsAtom);
  const [selectedProject, setSelectedProject] = useAtom(selectedProjectAtom);

  /** api hooks */
  const updateProjectMutation = api.projects.updateProject.useMutation();
  const getProjectsQuery = api.projects.get.useQuery({}, { enabled: false });

  useEffect(() => {
    getProjectsQuery
      .refetch()
      .then((response) => {
        const projects = response.data ? response.data.data : [];

        setProjects(projects);
        if (projects.length === 0) {
          setSelectedProject(undefined);
        } else if (!selectedProject) {
          setSelectedProject(projects[0]);
        }

        const todoCards: KanbanCardData[] = [];
        const inProgressCards: KanbanCardData[] = [];
        const doneCards: KanbanCardData[] = [];
        const approvedCards: KanbanCardData[] = [];

        projects.map((project) => {
          switch (project.status) {
            case "todo": {
              todoCards.push(kanbanCard(project));
              break;
            }
            case "inprogress": {
              inProgressCards.push(kanbanCard(project));
              break;
            }
            case "done": {
              doneCards.push(kanbanCard(project));
              break;
            }
            case "approved": {
              approvedCards.push(kanbanCard(project));
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
  }, []);

  const onCreate = (response: { success: boolean; data: Project }) => {
    const project = response.data;
    if (response.success) {
      addToKanbanLaneItems(project);
      if (!selectedProject) {
        setSelectedProject(project);
      }
    }
  };

  const onUpdate = (response: { success: boolean; data: Project }) => {
    const project = response.data;
    if (response.success) {
      switch (response.data.status) {
        case "todo": {
          const updatedItems = updateKanbanLaneItems(project, todoItems);
          setTodoItems(updatedItems);
          break;
        }
        case "inprogress": {
          const updatedItems = updateKanbanLaneItems(project, inProgressItems);
          setInProgressItems(updatedItems);
          break;
        }
        case "done": {
          const updatedItems = updateKanbanLaneItems(project, doneItems);
          setDoneItems(updatedItems);
          break;
        }
        case "approved": {
          const updatedItems = updateKanbanLaneItems(project, approvedItems);
          setApprovedItems(updatedItems);
          break;
        }
      }
    }
  };

  const onDelete = (response: { success: boolean; data: Project }) => {
    const project = response.data;
    if (response.success) {
      deleteFromKanbanLaneItems(project);
    }
  };

  const updateProjectStatus = async (
    cardData: KanbanCardData,
    status: StatusCode,
  ) => {
    const projectData = {
      id: cardData.id,
      status: status,
    };

    const updateProjectResponse =
      await updateProjectMutation.mutateAsync(projectData);
    const updatedProject = updateProjectResponse.data;

    deleteFromKanbanLaneItems(cardData.object as Project);
    addToKanbanLaneItems(updatedProject);
  };

  const addToKanbanLaneItems = (project: Project) => {
    switch (project.status) {
      case "todo": {
        setTodoItems([...todoItems, kanbanCard(project)]);
        break;
      }
      case "inprogress": {
        setInProgressItems([...inProgressItems, kanbanCard(project)]);
        break;
      }
      case "done": {
        setDoneItems([...doneItems, kanbanCard(project)]);
        break;
      }
      case "approved": {
        setApprovedItems([...approvedItems, kanbanCard(project)]);
        break;
      }
    }
  };

  const deleteFromKanbanLaneItems = (project: Project) => {
    switch (project.status) {
      case "todo": {
        const updatedItems = todoItems.filter((item) => {
          if (item.id === project.id) return false;
          return true;
        });
        setTodoItems(updatedItems);
        break;
      }
      case "inprogress": {
        const updatedItems = inProgressItems.filter((item) => {
          if (item.id === project.id) return false;
          return true;
        });
        setInProgressItems(updatedItems);
        break;
      }
      case "done": {
        const updatedItems = doneItems.filter((item) => {
          if (item.id === project.id) return false;
          return true;
        });
        setDoneItems(updatedItems);
        break;
      }
      case "approved": {
        const updatedItems = approvedItems.filter((item) => {
          if (item.id === project.id) return false;
          return true;
        });
        setApprovedItems(updatedItems);
        break;
      }
    }
  };

  const updateKanbanLaneItems = (
    updatedProject: Project,
    items: KanbanCardData[],
  ) => {
    const updatedItems = items.map((project) => {
      if (project.id === updatedProject.id) {
        return kanbanCard(updatedProject);
      }
      return project;
    });

    return updatedItems;
  };

  const kanbanCard = (project: Project & { users?: { id: string }[] }) => {
    return {
      id: project.id,
      title: project.name,
      status: project.status,
      progress: project.progress,
      info: {
        icon: <FaUsers />,
        quantity: project.users ? project.users.length : 0,
      },
      actions: [
        {
          label: "Create Project",
          icon: <FaPlusCircle />,
          callback: open,
        },
      ],
      object: project,
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
    updateProjectStatus(cardData, status)
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
            label: "Create Project",
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
      <ProjectModal
        onClose={onClose}
        openModal={openModal}
        action={modalAction}
        kanbanCard={modalCard}
      />
    </KanbanContext.Provider>
  );
};

export default OrganizationIdPage;
