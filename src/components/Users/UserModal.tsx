/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import {
  type UserRole,
  type KanbanCardAction,
  type UserRoleCode,
} from "$/src/utils/types";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Input,
  ModalFooter,
  Button,
  useDisclosure,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { type User } from "@prisma/client";
import { api } from "$/src/trpc/react";
import { useEffect, useState } from "react";
import { useOrganization } from "@clerk/nextjs";
import { roleDataMap } from "$/src/utils/utils";

interface Props {
  openModal: boolean;
  onClose: () => void;
  callback: (data: any) => void;
  action: KanbanCardAction;
  user?: User;
}

const UserModal = ({
  openModal = false,
  callback,
  onClose,
  action,
  user,
}: Props) => {
  /** react hooks */
  const [users, setUsers] = useState<User[]>([]);

  /** lib hooks */
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { organization } = useOrganization();

  /** api hooks */
  const createUserMutation = api.users.createUser.useMutation();
  const updateUserMutation = api.users.updateUser.useMutation();
  const deleteUserMutation = api.users.deleteUser.useMutation();
  const getUsersQuery = api.users.get.useQuery(
    { organizationId: organization?.id },
    { enabled: false },
  );

  /** useeffect hooks */
  useEffect(() => {
    if (openModal) onOpen();
  }, [openModal]);

  useEffect(() => {
    getUsersQuery
      .refetch()
      .then((response) => {
        setUsers(response.data ? response.data.data : []);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const roles: UserRole[] = Object.values(roleDataMap);
  /**
   * Sends the form data to the server to create the user
   * It calls the callback function with the results
   * @param formData
   */
  const createUser = async (formData: FormData) => {
    const userData = {
      id: user ? user.id : "",
      name: formData.get("name")?.toString() ?? "",
      email: formData.get("email")?.toString() ?? "",
      role: (formData.get("role")?.toString() ?? "employee") as UserRoleCode,
    };

    const createUserResponse = await createUserMutation.mutateAsync(userData);

    callback(createUserResponse);
  };

  /**
   * Sends the form data to the server to update the user
   * It calls the callback function with the results
   * @param formData
   */
  const updateUser = async (formData: FormData) => {
    const userData = {
      id: user ? user.id : "",
      name: formData.get("name")?.toString() ?? "",
      email: formData.get("email")?.toString() ?? "",
      role: formData.get("role")?.toString() ?? "",
    };

    const updateUserResponse = await updateUserMutation.mutateAsync(userData);

    callback(updateUserResponse);
  };

  const deleteUser = async () => {
    const deleteUserResponse = await deleteUserMutation.mutateAsync({
      id: user ? user.id : "",
    });

    callback(deleteUserResponse);
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
              ? updateUser
              : action === "delete"
                ? deleteUser
                : createUser
          }
        >
          <ModalHeader className="flex flex-col gap-1">
            {action === "update"
              ? "Update User"
              : action === "delete"
                ? "Delete User"
                : "Create User"}
          </ModalHeader>
          <ModalBody>
            <Input
              name="name"
              label="name"
              placeholder="Enter user name"
              defaultValue={user ? user.name : ""}
              disabled={action === "delete" ? true : false}
              required
            />
            <div className="flex w-full flex-wrap gap-4 md:flex-nowrap">
              <Input
                name="email"
                type="email"
                label="email"
                defaultValue={user ? user.email ?? "" : ""}
                placeholder="Enter user email"
              />
            </div>
            <Select
              name="role"
              label="User Role"
              placeholder="Select a role"
              className="w-full"
              defaultSelectedKeys={user ? [user.role] : []}
              isRequired
            >
              {roles.map((role) => (
                <SelectItem key={role.code} textValue={role.label}>
                  <Button
                    color={role.color}
                    radius="full"
                    size="sm"
                    className="w-full"
                  >
                    {role.label}
                  </Button>
                </SelectItem>
              ))}
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

export default UserModal;
