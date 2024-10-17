"use client";

import "chart.js/auto";
import { api } from "$/src/trpc/react";
import { useEffect, useState } from "react";
import { Button, Card, Chip, semanticColors } from "@nextui-org/react";
import { selectedProjectAtom } from "$/src/context/JotaiContext";
import { useAtomValue } from "jotai";
import { Doughnut, Line } from "react-chartjs-2";
import { type ChartData } from "chart.js";
import { expenseTypeDataMap } from "$/src/utils/utils";
import { type Expense, type ExpenseType } from "@prisma/client";
import { type DataPoint, linear } from "regression";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

const ExpensesDashboard = () => {
  /** react hooks */
  const [estimateCostTotal, setEstimateCostTotal] = useState(0);
  const [costTotal, setCostTotal] = useState(0);
  const [projectedExpenditure, setProjectedExpenditure] = useState(0);
  const [estimatedExpenditure, setEstimatedExpenditure] = useState(0);
  const [expenseProjectionsData, setExpenseProjectionsData] = useState<
    Expense[]
  >([]);
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

  const [projectionsChartData, setProjectionsChartData] = useState<
    ChartData<"line">
  >({
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

  const getExpenseProjectionsDataQuery =
    api.dashboard.getExpensesProjectionsData.useQuery(
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

    getExpenseProjectionsDataQuery
      .refetch()
      .then((response) => {
        if (response.data) {
          setExpenseProjectionsData(response.data.data);
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

  useEffect(() => {
    // alert("he");
    if (expenseProjectionsData.length === 0 || !selectedProject) {
      return;
    }

    const labels = getProjectionLabels();

    // get the data
    const projectionData = getProjectionData();

    // create the regression data
    const regressionDataPoints = getRegressionData(
      labels.map((label) => Number(label)),
      projectionData,
    );

    const regressionData: number[] = [];
    regressionDataPoints.map((dataPoint) => {
      regressionData.push(dataPoint[1]);
    });

    const estimatedExpenditure = expensesData.reduce(
      (total, data) => total + data.estimateCost,
      0,
    );
    setEstimatedExpenditure(estimatedExpenditure);
    setProjectedExpenditure([...regressionData].pop() ?? 0);

    setProjectionsChartData({
      labels: labels,
      datasets: [
        {
          label: "Cumulative Expenses",
          data: projectionData,
          fill: false,
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1,
        },
        {
          label: "Average Cumulative Expenses",
          data: regressionData,
          fill: true,
          borderColor:
            projectedExpenditure <= estimatedExpenditure
              ? semanticColors.dark.success[400]
              : semanticColors.dark.danger[400],
          tension: 0.1,
        },
      ],
    });
  }, [expenseProjectionsData, selectedProject, projectedExpenditure]);

  const getProjectionLabels = (): string[] => {
    const labels: string[] = [];

    for (let i = 0; i < expenseProjectionsData.length; i++) {
      labels.push(i.toString());
    }

    return labels;
  };

  /**
   * For each date in the range we find the cumulative expenditure of approved tasks
   * - When an exp is set to approved we increase the counter
   * - When a task is set from approved to not approved we decrease the counter
   * @param startDate
   * @param endDate
   * @returns
   */
  const getProjectionData = () => {
    let cumulativeExpenditure = 0;
    const data: number[] = [0];

    let x = 1;
    for (const expense of expenseProjectionsData) {
      if (expense.cost === 0) continue;
      cumulativeExpenditure += expense.cost;
      data[x] = cumulativeExpenditure;
      x++;
    }

    return data;
  };

  /**
   * Build a regression model from the x data points of the line chart
   * - Then predict the y-point or completed tasks for the last day of the project
   * @param xAxis
   * @param yAxis
   * @returns
   */
  const getRegressionData = (xAxis: number[], yAxis: number[]) => {
    const regressionData: DataPoint[] = [];

    let i = 0;
    for (i = 0; i < yAxis.length; i++) {
      regressionData.push([xAxis[i]!, yAxis[i]!]);
    }

    const regressionModel = linear(regressionData);

    const regressionPoints = [...regressionModel.points];

    for (i = i; i < xAxis.length; i++) {
      regressionPoints.push([xAxis[i]!, regressionModel.predict(xAxis[i]!)[1]]);
    }

    return regressionPoints;
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex w-full flex-col gap-4">
        <Card className="flex h-fit w-full flex-col p-8">
          <Chip
            className="absolute right-0 top-0 m-1"
            color="warning"
            size="sm"
            variant="solid"
          >
            Projected Expenditure
          </Chip>
          <div className="mb-4 flex w-full flex-row items-center justify-center gap-4">
            {projectedExpenditure <= estimatedExpenditure && (
              <FaCheckCircle
                size="40"
                color={semanticColors.dark.success[400]}
              ></FaCheckCircle>
            )}
            {projectedExpenditure > estimatedExpenditure && (
              <FaExclamationCircle
                size="40"
                color={semanticColors.dark.danger[400]}
              ></FaExclamationCircle>
            )}
            <Chip
              color={
                projectedExpenditure > estimatedExpenditure
                  ? "danger"
                  : "success"
              }
              className="p-6"
            >
              <p className="text-4xl font-thin">
                {`${selectedProject?.currencySymbol} `}
                {`${(projectedExpenditure - estimatedExpenditure).toFixed(2)} ${projectedExpenditure > estimatedExpenditure ? "Over" : "Under"}`}
              </p>
            </Chip>
            <Chip
              color={
                projectedExpenditure > estimatedExpenditure
                  ? "danger"
                  : "success"
              }
              className="p-6"
            >
              <p className="text-4xl font-thin">
                {`${((Math.abs(projectedExpenditure - estimatedExpenditure) / estimatedExpenditure) * 100).toFixed(2)}% ${projectedExpenditure > estimatedExpenditure ? "Over" : "Under"}`}
              </p>
            </Chip>
          </div>
          <div className="relative">
            <Line
              options={{
                responsive: true,
                scales: {
                  y: {
                    title: {
                      display: true,
                      text: "Expenditure",
                    },
                  },
                  x: {
                    title: {
                      display: true,
                      text: "Number of expenses",
                    },
                  },
                },
              }}
              data={projectionsChartData}
            />
          </div>
        </Card>
      </div>
      <div className="mb-4 flex w-full flex-row gap-4">
        <Card className="flex h-fit w-1/2 flex-col items-center p-8">
          <Chip
            className="absolute right-0 top-0 m-1"
            color="default"
            size="sm"
            variant="solid"
          >
            Planned Expenditure
          </Chip>
          <p className="text-4xl font-thin">
            {`${selectedProject?.currencySymbol} `}
            {estimateCostTotal}
          </p>
          <div className="relative">
            <Doughnut data={estimateCostChartData}></Doughnut>
          </div>
        </Card>
        <Card className="flex h-fit w-1/2 flex-col items-center p-8">
          <Chip
            className="absolute right-0 top-0 m-1"
            color="primary"
            size="sm"
            variant="solid"
          >
            Actual Expenditure
          </Chip>
          <p className="text-4xl font-thin">
            {`${selectedProject?.currencySymbol} `}
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
              {`${selectedProject?.currencySymbol} `}
              {`${estimateCostTotal - costTotal} `}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ExpensesDashboard;
