"use client";

import "chart.js/auto";
import { api } from "$/src/trpc/react";
import { useEffect, useState } from "react";
import { Button, Card, Chip, semanticColors } from "@nextui-org/react";
import { selectedProjectAtom } from "$/src/context/JotaiContext";
import { useAtomValue } from "jotai";
import { Doughnut } from "react-chartjs-2";
import { type ChartData } from "chart.js";
import { expenseTypeDataMap } from "$/src/utils/utils";
import { type ExpenseType } from "@prisma/client";
import { currencies } from "$/src/utils/currencies";

const ExpensesDashboard = () => {
  /** react hooks */
  const [estimateCostTotal, setEstimateCostTotal] = useState(0);
  const [costTotal, setCostTotal] = useState(0);
  const [expensesData, setExpensesData] = useState<
    {
      type: string;
      estimateCost: number;
      cost: number;
      estimateCostPercentage: number;
      costPercentage: number;
    }[]
  >([]);
  const [estimateCostChartData, setEstimateCostChartData] = useState<
    ChartData<"doughnut">
  >({
    labels: [],
    datasets: [],
  });
  const [costChartData, setCostChartData] = useState<ChartData<"doughnut">>({
    labels: [],
    datasets: [],
  });

  /** lib hooks */
  const selectedProject = useAtomValue(selectedProjectAtom);

  /** api hooks */
  const getExpensesDataQuery = api.dashboard.getExpensesData.useQuery(
    { projectId: selectedProject?.id ?? "" },
    { enabled: false },
  );

  /** useeffect hooks */
  useEffect(() => {
    getExpensesDataQuery
      .refetch()
      .then((response) => {
        if (response.data) {
          console.log(response.data.data);
          setExpensesData(response.data.data);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, [selectedProject]);

  useEffect(() => {
    setEstimateCostChartData({
      labels: expensesData.map((data) => data.type),
      datasets: [
        {
          label: "Estimate Costs",
          data: expensesData.map((data) => data.estimateCost),
          backgroundColor: expensesData.map((data) => {
            const color = expenseTypeDataMap[data.type as ExpenseType].color;
            switch (color) {
              case "primary":
                return semanticColors.dark.primary[400];
              case "secondary":
                return semanticColors.dark.secondary[400];
              case "success":
                return semanticColors.dark.success[400];
              default: {
                return semanticColors.dark.default[400];
              }
            }
          }),
          borderColor: "black",
          borderWidth: 0,
          hoverOffset: 10,
        },
      ],
    });

    setCostChartData({
      labels: expensesData.map((data) => data.type),
      datasets: [
        {
          label: "Actual Costs",
          data: expensesData.map((data) => data.cost),
          backgroundColor: expensesData.map((data) => {
            const color = expenseTypeDataMap[data.type as ExpenseType].color;
            switch (color) {
              case "primary":
                return semanticColors.dark.primary[400];
              case "secondary":
                return semanticColors.dark.secondary[400];
              case "success":
                return semanticColors.dark.success[400];
              default: {
                return semanticColors.dark.default[400];
              }
            }
          }),
          borderColor: "black",
          borderWidth: 0,
          hoverOffset: 10,
        },
      ],
    });

    setEstimateCostTotal(
      expensesData.reduce((total, data) => total + data.estimateCost, 0),
    );

    setCostTotal(expensesData.reduce((total, data) => total + data.cost, 0));
  }, [expensesData]);

  return (
    <div className="mb-4 flex w-full flex-row gap-4">
      <Card className="flex h-fit w-fit flex-col items-center p-8">
        <Chip
          className="absolute right-0 top-0 m-1"
          color="default"
          size="sm"
          variant="solid"
        >
          Planned
        </Chip>
        <p className="text-4xl font-thin">
          {`${currencies.find((currency) => currency.code === selectedProject?.currency)?.symbol} `}
          {estimateCostTotal}
        </p>
        <div className="relative">
          <Doughnut data={estimateCostChartData}></Doughnut>
        </div>
      </Card>
      <Card className="flex h-fit w-fit flex-col items-center p-8">
        <Chip
          className="absolute right-0 top-0 m-1"
          color="primary"
          size="sm"
          variant="solid"
        >
          Actual
        </Chip>
        <p className="text-4xl font-thin">
          {`${currencies.find((currency) => currency.code === selectedProject?.currency)?.symbol} `}
          {costTotal}
        </p>

        <div className="relative">
          <Doughnut data={costChartData} />
          <Button
            isIconOnly
            radius="full"
            className="absolute left-[35%] top-[40%] h-[30%] w-[30%] rounded-full text-xl font-thin"
            color={costTotal > estimateCostTotal ? "danger" : "success"}
          >
            {`${currencies.find((currency) => currency.code === selectedProject?.currency)?.symbol} `}
            {`${estimateCostTotal - costTotal} `}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ExpensesDashboard;
