/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
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
  Chip,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  DatePicker,
} from "@nextui-org/react";
import { type Expense, type Task, type Transaction } from "@prisma/client";
import { api } from "$/src/trpc/react";
import { useEffect, useState } from "react";
import { useOrganization } from "@clerk/nextjs";
import { useAtomValue } from "jotai";
import { selectedProjectAtom } from "$/src/context/JotaiContext";
import React from "react";
import { expenseTypeDataMap } from "$/src/utils/utils";
import { BiTrendingDown, BiTrendingUp, BiMinus } from "react-icons/bi";
import { FaList, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { types } from "util";
import { columns } from "tailwindcss/defaultTheme";
import { parseDate } from "@internationalized/date";

interface Props {
  openModal: boolean;
  onClose: () => void;
  expense?: Expense;
}

const transactionColumns = [
  { name: "Ref", uid: "ref" },
  { name: "Vendor", uid: "vendor" },
  { name: "Date", uid: "date" },
  { name: "Price", uid: "price" },
  { name: "Quantity", uid: "quantity" },
  { name: "Cost", uid: "cost" },
  { name: "Notes", uid: "notes" },
  { name: "Actions", uid: "actions" },
];

const TransactionsModal = ({ openModal = false, onClose, expense }: Props) => {
  /** react hooks */
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [newTransaction, setNewTransaction] = useState<Transaction>({
    id: "",
    expenseId: expense?.id ?? "",
    projectId: expense?.projectId ?? "",
    date: new Date(),
    quantity: 0,
    price: 0,
    cost: 0,
    ref: "",
    progressUpdate: false,
    vendor: "",
    notes: "",
  });

  const [columns, setColumns] = useState(transactionColumns);

  /** lib hooks */
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  /** api hooks */
  const createTransactionMutation =
    api.transactions.createTransaction.useMutation();
  const updateTransactionMutation =
    api.transactions.updateTransaction.useMutation();
  const deleteTransactionMutation =
    api.transactions.deleteTransaction.useMutation();

  const getTransactionsQuery = api.transactions.get.useQuery(
    { expenseId: expense?.id },
    { enabled: false },
  );

  /** useeffect hooks */
  useEffect(() => {
    if (openModal) {
      onOpen();
    }
  }, [openModal]);

  useEffect(() => {
    setTransactions([]);

    setNewTransaction({
      id: "",
      expenseId: expense?.id ?? "",
      projectId: expense?.projectId ?? "",
      date: new Date(),
      quantity: 0,
      price: 0,
      cost: 0,
      ref: "",
      progressUpdate: false,
      vendor: "",
      notes: "",
    });

    fetchTransactions();
  }, [expense]);

  const fetchTransactions = () => {
    getTransactionsQuery
      .refetch()
      .then((response) => {
        if (response.data) {
          setTransactions(response.data ? response.data.data : []);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  /**
   * Sends the form data to the server to create the transaction
   * It calls the callback function with the results
   * @param formData
   */
  const createTransaction = (transaction: Transaction) => {
    const transactionData = {
      expenseId: transaction.expenseId ?? "",
      projectId: transaction.projectId ?? "",
      ref: transaction.ref ?? undefined,
      vendor: transaction.vendor ?? undefined,
      notes: transaction.notes ?? undefined,
      quantity: transaction.quantity,
      price: transaction.price,
      date: transaction.date,
    };

    createTransactionMutation
      .mutateAsync(transactionData)
      .then((result) => {
        fetchTransactions();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  /**
   * Sends the form data to the server to update the transaction
   * It calls the callback function with the results
   * @param formData
   */
  const updateTransaction = (transaction: Transaction) => {
    alert(transaction.quantity);
    const transactionData = {
      id: transaction.id,
      ref: transaction.ref ?? undefined,
      vendor: transaction.vendor ?? undefined,
      notes: transaction.notes ?? undefined,
      quantity: transaction.quantity,
      price: transaction.price,
      date: transaction.date,
    };

    updateTransactionMutation
      .mutateAsync(transactionData)
      .then((result) => {
        fetchTransactions();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const deleteTransaction = (transaction: Transaction) => {
    deleteTransactionMutation
      .mutateAsync({
        id: transaction.id,
      })
      .then(() => {
        fetchTransactions();
      });
  };

  const renderCell = React.useCallback(
    (transaction: Transaction, columnKey: string) => {
      switch (columnKey) {
        case "ref":
          return (
            <div className="flex flex-col">
              <Input
                defaultValue={transaction?.ref ?? ""}
                variant="underlined"
                onValueChange={(value) => {
                  transaction.ref = value;
                }}
              />
            </div>
          );
        case "vendor":
          return (
            <div className="flex flex-col">
              <Input
                defaultValue={transaction?.vendor ?? ""}
                variant="underlined"
                onValueChange={(value) => {
                  transaction.vendor = value;
                }}
              />
            </div>
          );
        case "date":
          return (
            <DatePicker
              defaultValue={
                transaction
                  ? parseDate(transaction.date.toISOString().split("T")[0]!)
                  : undefined
              }
              name="dueDate"
              variant="underlined"
              isRequired
            />
          );
        case "price":
          return (
            <div className="flex flex-col">
              <Input
                name="price"
                type="number"
                defaultValue={
                  transaction ? transaction.price.toString() ?? "0" : "0"
                }
                onValueChange={(value) => {
                  transaction.price = Number(value);
                }}
                placeholder="0.00"
                variant="underlined"
              />
            </div>
          );
        case "quantity":
          return (
            <div className="flex flex-col">
              <Input
                name="quantity"
                type="number"
                variant="underlined"
                defaultValue={
                  transaction ? transaction.quantity?.toString() ?? "0" : "0"
                }
                onValueChange={(value) => {
                  transaction.quantity = Number(value);
                }}
              />
            </div>
          );

        case "cost":
          return (
            <div className="flex flex-col">
              <Input
                name="price"
                type="number"
                defaultValue={
                  transaction
                    ? (transaction.price * transaction.quantity).toString() ??
                      "0"
                    : "0"
                }
                placeholder="0.00"
                variant="underlined"
                disabled
              />
            </div>
          );
        case "notes":
          return (
            <div className="flex flex-col">
              <Input
                defaultValue={transaction?.notes ?? ""}
                variant="underlined"
                onValueChange={(value) => {
                  transaction.notes = value;
                }}
              />
            </div>
          );
        case "actions":
          return (
            <div className="flex flex-row justify-center gap-2">
              <div className="flex flex-row justify-center gap-2">
                <Tooltip
                  content={
                    transaction?.id ? "Edit transaction" : "Add Transaction"
                  }
                >
                  <Button
                    isIconOnly
                    onClick={() => {
                      if (!transaction.id) {
                        createTransaction(transaction);
                      } else {
                        updateTransaction(transaction);
                      }
                    }}
                    className="cursor-pointer"
                  >
                    {transaction.id ? <FaEdit /> : <FaPlus />}
                  </Button>
                </Tooltip>

                <Tooltip color="danger" content="Delete transaction">
                  <Button
                    isIconOnly
                    onClick={() => {
                      deleteTransaction(transaction);
                    }}
                    className="cursor-pointer text-danger"
                    type="submit"
                  >
                    <FaTrash />
                  </Button>
                </Tooltip>
              </div>
            </div>
          );
        default:
          return <div></div>;
      }
    },
    [],
  );

  return (
    <Modal
      onClose={onClose}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="top-center"
      size="5xl"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          Manage Transactions
        </ModalHeader>
        <ModalBody>
          <Table isHeaderSticky={true} className="!h-[95%] w-full">
            <TableHeader className="p-12">
              {columns.map((column) => (
                <TableColumn
                  className="p-2 align-top text-sm"
                  key={column.uid}
                  align={column.uid === "actions" ? "center" : "start"}
                >
                  {column.name}
                  {newTransaction && (
                    <div className="mb-2 mt-4 border-t-1 border-gray-500 pt-4 font-normal">
                      {renderCell(newTransaction, column.uid)}
                    </div>
                  )}
                </TableColumn>
              ))}
            </TableHeader>
            <TableBody items={transactions}>
              {(item) => (
                <TableRow key={item.id}>
                  {(columnKey) => (
                    <TableCell>
                      {renderCell(item, columnKey as string)}
                    </TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ModalBody>
        <ModalFooter></ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TransactionsModal;
