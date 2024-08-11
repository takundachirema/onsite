"use client";

import KanbanBoard from "$/src/components/Kanban/KanbanBoard";
import { useEffect, useState } from "react";
import { KanbanContext } from "../../context";
import { FaPlusCircle } from "react-icons/fa";
import { api } from "$/src/trpc/react";
import React from "react";
import { DatePicker } from "@nextui-org/react";
import { parseDate } from "@internationalized/date";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Input,
  Card,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import { type StatusCode, type KanbanCardData } from "$/src/utils/types";
import { type Project } from "@prisma/client";

const OrganizationIdPage = () => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const createProjectMutation = api.projects.createProject.useMutation();
  const updateProjectMutation = api.projects.updateProject.useMutation();
  const deleteProjectMutation = api.projects.deleteProject.useMutation();

  const getProjectsQuery = api.projects.get.useQuery({}, { enabled: false });

  /** Temporary variables to hold cards shown in modal before being edited or deleted */
  const [cardToEdit, setCardToEdit] = useState<KanbanCardData | undefined>(
    undefined,
  );
  const [cardToDelete, setCardToDelete] = useState<KanbanCardData | undefined>(
    undefined,
  );

  /** board items */
  const [todoItems, setTodoItems] = useState<KanbanCardData[]>([]);
  const [inProgressItems, setInProgressItems] = useState<KanbanCardData[]>([]);
  const [doneItems, setDoneItems] = useState<KanbanCardData[]>([]);
  const [approvedItems, setApprovedItems] = useState<KanbanCardData[]>([]);
  /** */

  useEffect(() => {
    getProjectsQuery
      .refetch()
      .then((response: unknown) => {
        const typedResponse = response as { data: { data: Project[] } };
        const projects = typedResponse.data.data;

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

  const createProject = async (formData: FormData) => {
    const projectData = {
      name: formData.get("name")?.toString() ?? "",
      dueDate: formData.get("dueDate") as unknown as Date,
    };

    const createProjectResponse =
      await createProjectMutation.mutateAsync(projectData);

    const createdProject = await createProjectResponse.data;

    if (createProjectResponse.success) {
      addToKanbanLaneItems(createdProject);
    }
  };

  const deleteProject = async () => {
    const deleteProjectResponse = await deleteProjectMutation.mutateAsync({
      id: cardToDelete ? cardToDelete.id : "",
    });
    const deletedProject = await deleteProjectResponse.data;

    if (deleteProjectResponse.success) {
      deleteFromKanbanLaneItems(deletedProject);
    }
  };

  /**
   * Sends the form data to the server to update the project
   * When successful, it updates the kanban lane item card
   * @param formData
   */
  const updateProject = async (formData: FormData) => {
    const projectData = {
      id: cardToEdit ? cardToEdit.id : "",
      name: formData.get("name")?.toString() ?? "",
      dueDate: formData.get("dueDate") as unknown as Date,
    };

    const updateProjectResponse =
      await updateProjectMutation.mutateAsync(projectData);
    const updatedProject = await updateProjectResponse.data;

    if (updateProjectResponse.success) {
      switch (updatedProject.status) {
        case "todo": {
          const updatedItems = updateKanbanLaneItems(updatedProject, todoItems);
          setTodoItems(updatedItems);
          break;
        }
        case "inprogress": {
          const updatedItems = updateKanbanLaneItems(
            updatedProject,
            inProgressItems,
          );
          setInProgressItems(updatedItems);
          break;
        }
        case "done": {
          const updatedItems = updateKanbanLaneItems(updatedProject, doneItems);
          setDoneItems(updatedItems);
          break;
        }
        case "approved": {
          const updatedItems = updateKanbanLaneItems(
            updatedProject,
            approvedItems,
          );
          setApprovedItems(updatedItems);
          break;
        }
      }
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
    const updatedProject = await updateProjectResponse.data;

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

  const kanbanCard = (project: Project) => {
    return {
      id: project.id,
      title: project.name,
      status: project.status,
      progress: 90,
      actions: [
        {
          label: "Create Project",
          icon: <FaPlusCircle />,
          callback: onOpen,
        },
      ],
      object: project,
    } as KanbanCardData;
  };

  const createCard = () => {
    onOpen();
  };

  const editCard = (cardData: KanbanCardData) => {
    setCardToEdit(cardData);
    onOpen();
  };

  const deleteCard = (cardData: KanbanCardData) => {
    setCardToDelete(cardData);
    onOpen();
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

  const clearModalData = () => {
    setCardToDelete(undefined);
    setCardToEdit(undefined);
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
        editCard: editCard,
        deleteCard: deleteCard,
        moveCard: moveCard,
      }}
    >
      <KanbanBoard />
      <Modal
        onClose={clearModalData}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          <form
            action={
              cardToEdit
                ? updateProject
                : cardToDelete
                  ? deleteProject
                  : createProject
            }
          >
            <ModalHeader className="flex flex-col gap-1">
              {cardToEdit
                ? "Edit Project"
                : cardToDelete
                  ? "Delete Project"
                  : "New Project"}
            </ModalHeader>
            <ModalBody>
              <Input
                name="name"
                label="name"
                placeholder="Enter project name"
                defaultValue={
                  cardToEdit
                    ? cardToEdit.title
                    : cardToDelete
                      ? cardToDelete.title
                      : ""
                }
                disabled={cardToDelete ? true : false}
                required
              />
              <DatePicker
                defaultValue={
                  cardToEdit
                    ? parseDate(
                        (cardToEdit.object as Project).dueDate
                          .toISOString()
                          .split("T")[0],
                      )
                    : cardToDelete
                      ? parseDate(
                          (cardToDelete.object as Project).dueDate
                            .toISOString()
                            .split("T")[0],
                        )
                      : undefined
                }
                name="dueDate"
                label="Due Date"
                isDisabled={cardToDelete ? true : false}
                isRequired
              />
            </ModalBody>
            <ModalFooter>
              <Button
                onPress={onClose}
                type="submit"
                color={cardToDelete ? "danger" : "default"}
              >
                {cardToEdit ? "Edit" : cardToDelete ? "Delete" : "Create"}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </KanbanContext.Provider>
  );
};

export default OrganizationIdPage;
