"use client";

import { KanbanContext } from "$/src/context/KanbanContext";
import { type KanbanCardData } from "$/src/utils/types";
import { statusDataMap } from "$/src/utils/utils";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Progress,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { useContext } from "react";
import { FaEdit, FaEllipsisV, FaTrash, FaUsers } from "react-icons/fa";

const KanbanCard = ({
  cardData,
}: {
  cardData: KanbanCardData;
  index: number;
  parent: string;
}) => {
  const {
    updateCard: editCard,
    deleteCard,
    moveCard,
  } = useContext(KanbanContext)!;

  return (
    <Card className="max-w-[400px]">
      <CardHeader className="p-2">
        <div className="flex w-full flex-row items-center justify-between">
          <p className="text-small font-bold">{cardData.title}</p>
          <Dropdown>
            <DropdownTrigger>
              <Button variant="light" isIconOnly>
                <FaEllipsisV />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Static Actions">
              <DropdownItem key="edit">
                <Button
                  className="w-full justify-start"
                  variant="light"
                  startContent={<FaEdit />}
                  onClick={() => editCard(cardData)}
                >
                  Edit
                </Button>
              </DropdownItem>
              <DropdownItem key="delete" className="bg-none">
                <Button
                  className="w-full justify-start text-danger"
                  variant="light"
                  startContent={<FaTrash />}
                  onClick={() => deleteCard(cardData)}
                >
                  Delete
                </Button>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </CardHeader>
      <CardBody className="gap-1 px-2 py-0 text-small text-default-400">
        {cardData.description && (
          <p className="line-clamp-2">{cardData.description}</p>
        )}
        {cardData.progress && (
          <Progress
            size="sm"
            value={cardData.progress}
            color="primary"
            classNames={{
              value: "text-xs",
            }}
            showValueLabel={true}
            className="max-w-md !p-0"
          />
        )}
      </CardBody>
      <CardFooter className="justify-between p-2">
        <Dropdown>
          <DropdownTrigger>
            <Button
              color={statusDataMap[cardData.status].color}
              radius="full"
              size="sm"
            >
              {cardData.status}
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Static Actions">
            <DropdownItem key="todo">
              <Button
                color={statusDataMap.todo.color}
                radius="full"
                size="sm"
                className="w-full"
                onClick={() => moveCard(cardData, statusDataMap.todo.code)}
              >
                {statusDataMap.todo.label}
              </Button>
            </DropdownItem>
            <DropdownItem key="inprogress">
              <Button
                color={statusDataMap.inprogress.color}
                radius="full"
                size="sm"
                className="w-full"
                onClick={() =>
                  moveCard(cardData, statusDataMap.inprogress.code)
                }
              >
                {statusDataMap.inprogress.label}
              </Button>
            </DropdownItem>
            <DropdownItem key="done">
              <Button
                color={statusDataMap.done.color}
                radius="full"
                size="sm"
                className="w-full"
                onClick={() => moveCard(cardData, statusDataMap.done.code)}
              >
                {statusDataMap.done.label}
              </Button>
            </DropdownItem>
            <DropdownItem key="approve">
              <Button
                color={statusDataMap.approved.color}
                radius="full"
                size="sm"
                className="w-full"
                onClick={() => moveCard(cardData, statusDataMap.approved.code)}
              >
                {statusDataMap.approved.label}
              </Button>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
        {cardData.users !== undefined && (
          <Chip>
            <div className="flex flex-row items-center gap-4 rounded-full">
              <FaUsers />
              <p>{cardData.users}</p>
            </div>
          </Chip>
        )}
      </CardFooter>
    </Card>
  );
};

export default KanbanCard;
