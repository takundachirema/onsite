/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import {
  type ExpenseType,
  type KanbanCardAction,
  type ExpenseTypeCode,
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
  Chip,
} from "@nextui-org/react";
import { type Task, type Expense } from "@prisma/client";
import { api } from "$/src/trpc/react";
import { useEffect, useState } from "react";
import { useOrganization } from "@clerk/nextjs";
import { useAtomValue } from "jotai";
import { selectedProjectAtom } from "$/src/context/JotaiContext";
import { expenseTypeDataMap } from "$/src/utils/utils";

interface Props {
  openModal: boolean;
  onClose: () => void;
  callback: (data: any) => void;
  action: KanbanCardAction;
  expense?: Expense;
}

const ExpenseModal = ({
  openModal = false,
  callback,
  onClose,
  action,
  expense,
}: Props) => {
  /** react hooks */
  const [tasks, setTasks] = useState<Task[]>([]);

  /** lib hooks */
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { organization } = useOrganization();
  const selectedProject = useAtomValue(selectedProjectAtom);

  /** api hooks */
  const createExpenseMutation = api.expenses.createExpense.useMutation();
  const updateExpenseMutation = api.expenses.updateExpense.useMutation();
  const deleteExpenseMutation = api.expenses.deleteExpense.useMutation();
  const getExpensesQuery = api.expenses.get.useQuery(
    { projectId: selectedProject?.id },
    { enabled: false },
  );

  const getTasksQuery = api.tasks.get.useQuery(
    { projectId: selectedProject?.id },
    { enabled: false },
  );

  /** useeffect hooks */
  useEffect(() => {
    if (openModal) {
      onOpen();
      if (!getTasksQuery.isFetched) {
        fetchTasks();
      } else {
        setTasks(getTasksQuery.data?.data ?? []);
      }
    }
  }, [openModal]);

  const fetchTasks = () => {
    getTasksQuery
      .refetch()
      .then((response) => {
        setTasks(response.data ? response.data.data : []);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const types: ExpenseType[] = Object.values(expenseTypeDataMap);
  /**
   * Sends the form data to the server to create the expense
   * It calls the callback function with the results
   * @param formData
   */
  const createExpense = async (formData: FormData) => {
    const expenseData = {
      id: expense ? expense.id : "",
      taskId: formData.get("task")?.toString() ?? "",
      projectId: selectedProject!.id,
      name: formData.get("name")?.toString() ?? "",
      estimateQty: formData.get("estimateQty")
        ? Number(formData.get("estimateQty"))
        : 0,
      estimatePrice: formData.get("estimatePrice")
        ? Number(formData.get("estimatePrice"))
        : 0,
      quantity: formData.get("quantity") ? Number(formData.get("quantity")) : 0,
      price: formData.get("price") ? Number(formData.get("price")) : 0,
      type: (formData.get("type")?.toString() ?? "other") as ExpenseTypeCode,
    };

    const createExpenseResponse =
      await createExpenseMutation.mutateAsync(expenseData);

    callback(createExpenseResponse);
  };

  /**
   * Sends the form data to the server to update the expense
   * It calls the callback function with the results
   * @param formData
   */
  const updateExpense = async (formData: FormData) => {
    const expenseData = {
      id: expense ? expense.id : "",
      taskId: formData.get("task")?.toString() ?? "",
      projectId: selectedProject!.id,
      name: formData.get("name")?.toString() ?? "",
      estimateQty: formData.get("estimateQty")
        ? Number(formData.get("estimateQty"))
        : 0,
      estimatePrice: formData.get("estimatePrice")
        ? Number(formData.get("estimatePrice"))
        : 0,
      quantity: formData.get("quantity") ? Number(formData.get("quantity")) : 0,
      price: formData.get("price") ? Number(formData.get("price")) : 0,
      type: (formData.get("type")?.toString() ?? "other") as ExpenseTypeCode,
    };

    const updateExpenseResponse =
      await updateExpenseMutation.mutateAsync(expenseData);

    callback(updateExpenseResponse);
  };

  const deleteExpense = async () => {
    const deleteExpenseResponse = await deleteExpenseMutation.mutateAsync({
      id: expense ? expense.id : "",
    });

    callback(deleteExpenseResponse);
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
              ? updateExpense
              : action === "delete"
                ? deleteExpense
                : createExpense
          }
        >
          <ModalHeader className="flex flex-col gap-1">
            {action === "update"
              ? "Update Expense"
              : action === "delete"
                ? "Delete Expense"
                : "Create Expense"}
          </ModalHeader>
          <ModalBody>
            <Select
              name="task"
              items={tasks}
              labelPlacement="outside"
              label="Assign Tasks"
              variant="flat"
              isMultiline={false}
              selectionMode="single"
              placeholder="Assign Task"
              defaultSelectedKeys={[expense?.taskId?.toString() ?? ""]}
              isRequired
              classNames={{
                base: "w-full",
                trigger: "min-h-12 py-2",
              }}
              renderValue={(items) => {
                return (
                  <div className="flex flex-wrap gap-2">
                    {items.map((item) => (
                      <Chip key={item.key}>{item.data?.name}</Chip>
                    ))}
                  </div>
                );
              }}
            >
              {(task) => (
                <SelectItem key={task.id} textValue={task.name}>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                      <span className="text-small">{task.name}</span>
                      <p className="line-clamp-1 text-tiny text-default-400">
                        {task.description}
                      </p>
                    </div>
                  </div>
                </SelectItem>
              )}
            </Select>
            <Input
              name="name"
              label="name"
              placeholder="Enter expense name"
              defaultValue={expense ? expense.name : ""}
              disabled={action === "delete" ? true : false}
              required
            />
            <div className="flex w-full flex-row flex-wrap gap-4 md:flex-nowrap">
              <Input
                name="estimateQty"
                type="number"
                label="estimate qty"
                defaultValue={
                  expense ? expense.estimateQty.toString() ?? "0" : "0"
                }
                placeholder="Enter estimate quantity"
                required
              />
              <Input
                name="estimatePrice"
                type="number"
                label="estimate price"
                defaultValue={
                  expense
                    ? expense.estimatePrice.toFixed(2).toString() ?? "0"
                    : "0"
                }
                placeholder="0.00"
                required
              />
            </div>
            <div className="flex w-full flex-row flex-wrap gap-4 md:flex-nowrap">
              <Input
                name="quantity"
                type="number"
                label="quantity"
                defaultValue={
                  expense ? expense.quantity?.toString() ?? "0" : "0"
                }
                placeholder="Enter quantity"
              />
              <Input
                name="price"
                type="number"
                label="price"
                defaultValue={expense ? expense.price?.toFixed(2) ?? "0" : "0"}
                placeholder="0.00"
              />
            </div>
            <Select
              name="type"
              label="Expense Type"
              placeholder="Select a type"
              className="w-full"
              defaultSelectedKeys={expense ? [expense.type] : []}
              isRequired
            >
              {types.map((type) => (
                <SelectItem key={type.code} textValue={type.label}>
                  <Button
                    color={type.color}
                    radius="full"
                    size="sm"
                    className="w-full"
                  >
                    {type.label}
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

export default ExpenseModal;
