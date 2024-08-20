"use client";

import TableActionbar from "$/src/components/Table/TableActionbar";
import UserModal from "$/src/components/Users/UserModal";
import { api } from "$/src/trpc/react";
import { type KanbanCardAction } from "$/src/utils/types";
import { roleDataMap } from "$/src/utils/utils";
import { useOrganization } from "@clerk/nextjs";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  User as UserComponent,
  Tooltip,
  Button,
} from "@nextui-org/react";
import { type User } from "@prisma/client";
import React from "react";
import { useEffect, useState } from "react";
import { FaEdit, FaPlusCircle, FaTrash } from "react-icons/fa";

const columns = [
  { name: "Name", uid: "name" },
  { name: "Role", uid: "role" },
  { name: "Actions", uid: "actions" },
];

const UsersPage = () => {
  /** react hooks */
  const [users, setUsers] = useState<User[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [modalAction, setModalAction] = useState<KanbanCardAction>("create");
  const [user, setUser] = useState<User | undefined>(undefined);

  /** lib hooks */
  const { organization } = useOrganization();

  /** api hooks */
  const getUsersQuery = api.users.get.useQuery(
    { organizationId: organization?.id },
    { enabled: false },
  );

  /** useeffect hooks */
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

  const createUser = () => {
    setOpenModal(true);
    setModalAction("create");
  };

  const editUser = (user: User) => {
    setUser(user);
    setModalAction("update");
    setOpenModal(true);
  };

  const deleteUser = (user: User) => {
    setUser(user);
    setModalAction("delete");
    setOpenModal(true);
  };

  const postAction = (response: { success: boolean; data: User }) => {
    const postUser = response.data;

    let updatedUsers = [];
    switch (modalAction) {
      case "create":
        console.log(postUser);
        setUsers([...users, postUser]);
        break;
      case "update":
        updatedUsers = users.map((user) => {
          if (user.id === postUser.id) {
            return postUser;
          }
          return user;
        });
        setUsers(updatedUsers);
        break;
      case "delete":
        updatedUsers = users.filter((user) => {
          if (user.id === postUser.id) return false;
          return true;
        });
        setUsers(updatedUsers);
        break;
    }
  };

  const onClose = () => {
    setOpenModal(false);
  };
  const renderCell = React.useCallback((user: User, columnKey: string) => {
    switch (columnKey) {
      case "name":
        return (
          <UserComponent
            avatarProps={{ radius: "lg" }}
            description={user.email}
            name={user.name}
          >
            {user.email}
          </UserComponent>
        );
      case "role":
        return (
          <Chip
            className="capitalize"
            color={roleDataMap[user.role].color}
            size="sm"
            variant="flat"
          >
            {user.role}
          </Chip>
        );
      case "actions":
        return (
          <div className="flex flex-row justify-center gap-2">
            <Tooltip content="Edit user">
              <Button
                isIconOnly
                onClick={() => {
                  editUser(user);
                }}
                className="cursor-pointer"
              >
                <FaEdit />
              </Button>
            </Tooltip>
            <Tooltip color="danger" content="Delete user">
              <Button
                isIconOnly
                onClick={() => {
                  deleteUser(user);
                }}
                className="cursor-pointer text-danger"
              >
                <FaTrash />
              </Button>
            </Tooltip>
          </div>
        );
      default:
        return <div></div>;
    }
  }, []);

  return (
    <div className="flex w-full flex-col gap-4">
      <TableActionbar
        actionBarItems={[
          {
            label: "Create User",
            icon: <FaPlusCircle />,
            callback: createUser,
          },
        ]}
      />
      <div className="grid w-full space-x-4">
        <Table className="w-full">
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn
                className="text-sm"
                key={column.uid}
                align={column.uid === "actions" ? "center" : "start"}
              >
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody items={users}>
            {(item) => (
              <TableRow key={item.id}>
                {(columnKey) => (
                  <TableCell>{renderCell(item, columnKey as string)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
        <UserModal
          onClose={onClose}
          callback={postAction}
          openModal={openModal}
          action={modalAction}
          user={user}
        ></UserModal>
      </div>
    </div>
  );
};

export default UsersPage;
