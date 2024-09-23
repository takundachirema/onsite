"use client";

import TableActionbar from "$/src/components/Table/TableActionbar";
import ExpenseModal from "$/src/components/Expenses/ExpenseModal";
import { api } from "$/src/trpc/react";
import { type KanbanCardAction } from "$/src/utils/types";
import { expenseTypeDataMap } from "$/src/utils/utils";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableSlots,
  TableRow,
  TableCell,
  Chip,
  Tooltip,
  Button,
} from "@nextui-org/react";
import { type Expense } from "@prisma/client";
import React from "react";
import { useEffect, useState } from "react";
import { FaEdit, FaPlusCircle, FaTrash } from "react-icons/fa";
import { useAtomValue } from "jotai";
import { selectedProjectAtom } from "$/src/context/JotaiContext";

const expenseColumns = [
  { name: "Task", uid: "task" },
  { name: "Expense", uid: "expense" },
  { name: "Type", uid: "type" },
  { name: "Estimate Qty", uid: "estimate_qty" },
  { name: "Quantity", uid: "quantity" },
  { name: "Estimate Price", uid: "estimate_price" },
  { name: "Price", uid: "price" },
  { name: "Estimate Cost", uid: "estimate_cost" },
  { name: "Cost", uid: "cost" },
  { name: "Actions", uid: "actions" },
];

const ExpensesPage = () => {
  /** react hooks */
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [modalAction, setModalAction] = useState<KanbanCardAction>("create");
  const [expense, setExpense] = useState<Expense | undefined>(undefined);
  const [columns, setColumns] = useState(expenseColumns);
  const [totalExpense, setTotalExpense] = useState<Expense | undefined>(
    undefined,
  );

  /** lib hooks */
  const selectedProject = useAtomValue(selectedProjectAtom);

  /** api hooks */
  const getExpensesQuery = api.expenses.get.useQuery(
    { projectId: selectedProject?.id },
    { enabled: false },
  );

  /** useeffect hooks */
  useEffect(() => {
    getExpensesQuery
      .refetch()
      .then((response) => {
        if (response.data) {
          setExpenses(response.data.data);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, [selectedProject]);

  useEffect(() => {
    createTotalExpenses();
  }, [expenses]);

  useEffect(() => {
    setColumns([...expenseColumns]);
  }, [totalExpense]);

  const createExpense = () => {
    setOpenModal(true);
    setModalAction("create");
  };

  const editExpense = (expense: Expense | undefined) => {
    setExpense(expense);
    setModalAction("update");
    setOpenModal(true);
  };

  const deleteExpense = (expense: Expense | undefined) => {
    setExpense(expense);
    setModalAction("delete");
    setOpenModal(true);
  };

  const createTotalExpenses = () => {
    const totalEstimateCost = expenses.reduce<number>(
      (totalCost, expense) => Number(totalCost) + Number(expense.estimateCost),
      0,
    );
    const totalCost = expenses.reduce<number>(
      (totalCost, expense) => Number(totalCost) + Number(expense.cost),
      0,
    );

    const totalExpense: Expense = {
      id: "",
      name: "Total Expenses",
      type: "other",
      estimateQty: 0,
      estimatePrice: 0,
      quantity: null,
      price: null,
      projectId: "",
      taskId: "",
      estimateCost: totalEstimateCost,
      cost: totalCost,
    };

    setTotalExpense(totalExpense);
  };

  const postAction = (response: { success: boolean; data: Expense }) => {
    const postExpense = response.data;

    let updatedExpenses = [];
    switch (modalAction) {
      case "create":
        console.log(postExpense);
        setExpenses([...expenses, postExpense]);
        break;
      case "update":
        updatedExpenses = expenses.map((expense) => {
          if (expense.id === postExpense.id) {
            return postExpense;
          }
          return expense;
        });
        setExpenses(updatedExpenses);
        break;
      case "delete":
        updatedExpenses = expenses.filter((expense) => {
          if (expense.id === postExpense.id) return false;
          return true;
        });
        setExpenses(updatedExpenses);
        break;
    }
  };

  const onClose = () => {
    setOpenModal(false);
  };
  const renderCell = React.useCallback(
    (
      expense:
        | (Expense & {
            task?: {
              name: string;
            };
          })
        | undefined,
      columnKey: string,
    ) => {
      switch (columnKey) {
        case "task":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-sm capitalize">
                {expense?.task?.name}
              </p>
            </div>
          );
        case "expense":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-sm capitalize">{expense?.name}</p>
            </div>
          );
        case "type":
          return (
            <Chip
              className="capitalize"
              color={expenseTypeDataMap[expense?.type ?? "other"].color}
              size="sm"
              variant="flat"
            >
              {expense?.type}
            </Chip>
          );
        case "estimate_qty":
          return (
            <div className="flex flex-col">
              {expense?.id && (
                <p className="text-bold text-sm capitalize">
                  {expense?.estimateQty}
                </p>
              )}
            </div>
          );
        case "quantity":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-sm capitalize">
                {expense?.quantity}
              </p>
            </div>
          );

        case "estimate_price":
          return (
            <div className="flex flex-col">
              {expense?.id && (
                <p className="text-bold text-sm capitalize">
                  {expense?.estimatePrice.toFixed(2)}
                </p>
              )}
            </div>
          );
        case "price":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-sm capitalize">
                {expense?.price?.toFixed(2)}
              </p>
            </div>
          );
        case "estimate_cost":
          return (
            <div className="flex flex-col">
              {expense?.id ? (
                <p className="text-bold text-sm capitalize">
                  {expense?.estimateCost}
                </p>
              ) : (
                <Chip
                  className="capitalize"
                  color="default"
                  size="md"
                  variant="flat"
                >
                  {expense?.estimateCost}
                </Chip>
              )}
            </div>
          );
        case "cost":
          return (
            <div className="flex flex-col">
              <Button
                className="!w-full capitalize"
                color={
                  expense
                    ? expense?.cost > expense?.estimateCost
                      ? "danger"
                      : "success"
                    : "default"
                }
                radius="full"
                size="sm"
              >
                {expense?.cost}
              </Button>
            </div>
          );
        case "actions":
          return (
            <div className="flex flex-row justify-center gap-2">
              {expense?.id && (
                <div className="flex flex-row justify-center gap-2">
                  <Tooltip content="Edit expense">
                    <Button
                      isIconOnly
                      onClick={() => {
                        editExpense(expense);
                      }}
                      className="cursor-pointer"
                    >
                      <FaEdit />
                    </Button>
                  </Tooltip>
                  <Tooltip color="danger" content="Delete expense">
                    <Button
                      isIconOnly
                      onClick={() => {
                        deleteExpense(expense);
                      }}
                      className="cursor-pointer text-danger"
                    >
                      <FaTrash />
                    </Button>
                  </Tooltip>
                </div>
              )}
            </div>
          );
        default:
          return <div></div>;
      }
    },
    [],
  );

  return (
    <div className="flex w-full flex-col gap-4">
      <TableActionbar
        actionBarItems={[
          {
            label: "Create Expense",
            icon: <FaPlusCircle />,
            callback: createExpense,
          },
        ]}
      />
      <div className="flex  w-full flex-col justify-between">
        <Table isHeaderSticky={true} className="!h-[95%] w-full">
          <TableHeader>
            {columns.map((column) => (
              <TableColumn
                className="align-top text-sm"
                key={column.uid}
                align={column.uid === "actions" ? "center" : "start"}
              >
                {column.name}
                <div className="mb-2 mt-2 font-normal">
                  {renderCell(totalExpense, column.uid)}
                </div>
              </TableColumn>
            ))}
          </TableHeader>
          <TableBody items={expenses}>
            {(item) => (
              <TableRow key={item.id}>
                {(columnKey) => (
                  <TableCell>{renderCell(item, columnKey as string)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <ExpenseModal
        onClose={onClose}
        callback={postAction}
        openModal={openModal}
        action={modalAction}
        expense={expense}
      ></ExpenseModal>
    </div>
  );
};

export default ExpensesPage;
