"use client";

import { KanbanContext } from "$/src/app/organization/context";
import { type KanbanCardData } from "$/src/utils/types";
import { statusData } from "$/src/utils/utils";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
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
  const { editCard, deleteCard, moveCard } = useContext(KanbanContext)!;

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
      <CardBody className="px-2 py-0">
        <Progress
          size="sm"
          value={cardData.progress}
          color={
            cardData.progress < 50
              ? "danger"
              : cardData.progress === 100
                ? "success"
                : "secondary"
          }
          classNames={{
            value: "text-xs",
          }}
          showValueLabel={true}
          className="max-w-md !p-0"
        />
      </CardBody>
      <CardFooter className="justify-between p-2">
        <Dropdown>
          <DropdownTrigger>
            <Button
              color={statusData[cardData.status].color}
              radius="full"
              size="sm"
            >
              {cardData.status}
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Static Actions">
            <DropdownItem key="todo">
              <Button
                color={statusData.todo.color}
                radius="full"
                size="sm"
                onClick={() => moveCard(cardData, statusData.todo.code)}
              >
                {statusData.todo.label}
              </Button>
            </DropdownItem>
            <DropdownItem key="inprogress">
              <Button
                color={statusData.inprogress.color}
                radius="full"
                size="sm"
                onClick={() => moveCard(cardData, statusData.inprogress.code)}
              >
                {statusData.inprogress.label}
              </Button>
            </DropdownItem>
            <DropdownItem key="done">
              <Button
                color={statusData.done.color}
                radius="full"
                size="sm"
                onClick={() => moveCard(cardData, statusData.done.code)}
              >
                {statusData.done.label}
              </Button>
            </DropdownItem>
            <DropdownItem key="approve">
              <Button
                color={statusData.approved.color}
                radius="full"
                size="sm"
                onClick={() => moveCard(cardData, statusData.approved.code)}
              >
                {statusData.approved.label}
              </Button>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <Chip>
          <div className="flex flex-row items-center gap-4 rounded-full">
            <FaUsers />
            <p>{7}</p>
          </div>
        </Chip>
      </CardFooter>
    </Card>
  );
};

export default KanbanCard;
