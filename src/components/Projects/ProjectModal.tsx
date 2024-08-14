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
} from "@nextui-org/react";
import { type Project } from "@prisma/client";
import { api } from "$/src/trpc/react";
import { useContext, useEffect } from "react";
import { KanbanContext } from "$/src/app/organization/context";

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
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { onCreate, onUpdate, onDelete } = useContext(KanbanContext)!;

  /** Hooks to update the project */
  const createProjectMutation = api.projects.createProject.useMutation();
  const updateProjectMutation = api.projects.updateProject.useMutation();
  const deleteProjectMutation = api.projects.deleteProject.useMutation();
  /** */

  useEffect(() => {
    if (openModal) onOpen();
  }, [openModal]);

  /**
   * Sends the form data to the server to create the project
   * It calls the callback function with the results
   * @param formData
   */
  const createProject = async (formData: FormData) => {
    const projectData = {
      name: formData.get("name")?.toString() ?? "",
      dueDate: formData.get("dueDate") as unknown as Date,
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
              defaultValue={
                action === "update"
                  ? kanbanCard.title
                  : action === "delete"
                    ? kanbanCard.title
                    : ""
              }
              disabled={action === "delete" ? true : false}
              required
            />
            <DatePicker
              defaultValue={
                action === "update"
                  ? parseDate(
                      (kanbanCard.object as Project).dueDate
                        .toISOString()
                        .split("T")[0]!,
                    )
                  : action === "delete"
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
