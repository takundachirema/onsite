"use client";

import "chart.js/auto";
import { api } from "$/src/trpc/react";
import { useEffect, useState } from "react";
import { Button, Card, Chip, semanticColors, Tooltip } from "@nextui-org/react";
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
              case "warning":
                return semanticColors.dark.warning[400];
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
              case "warning":
                return semanticColors.dark.warning[400];
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
    const [actualCostData, estimatedCostData] = getProjectionData();

    // create the regression data
    const regressionDataPoints = getRegressionData(
      labels.map((label) => Number(label)),
      actualCostData!,
    );

    const regressionData: number[] = [];
    regressionDataPoints.map((dataPoint) => {
      regressionData.push(dataPoint[1]);
    });

    // If all the estimates have been actualized use the actual instead of projected
    setProjectedExpenditure(
      [
        ...(estimatedCostData?.length === actualCostData?.length
          ? actualCostData ?? []
          : regressionData),
      ].pop() ?? 0,
    );

    setEstimatedExpenditure([...(estimatedCostData ?? [0])].pop() ?? 0);

    setProjectionsChartData({
      labels: labels,
      datasets: [
        {
          label: "Current Expenditure",
          data: actualCostData!,
          fill: false,
          borderColor: semanticColors.dark.primary[500],
          tension: 0.1,
        },
        {
          label: "Planned Expenditure",
          data: estimatedCostData!,
          fill: false,
          borderColor: semanticColors.dark.warning[500],
          tension: 0.1,
        },
        {
          label: "Projected Expenditure",
          data: regressionData,
          fill: false,
          hidden: estimatedCostData?.length === actualCostData?.length,
          borderColor: semanticColors.dark.secondary[600],
          tension: 0.1,
        },
      ],
    });
  }, [expenseProjectionsData, selectedProject, projectedExpenditure]);

  const getProjectionLabels = (): string[] => {
    const labels: string[] = [];

    for (let i = 0; i <= expenseProjectionsData.length; i++) {
      labels.push(i.toString());
    }

    return labels;
  };

  /**
   * Add up the accumulated expenses to be able to project what the total costs will be
   * @returns
   */
  const getProjectionData = () => {
    let cumulativeActualExpenditure = 0;
    let cumulativeEstimateExpenditure = 0;
    const actualCostData: number[] = [0];
    const estimatedCostData: number[] = [0];

    let x = 1;
    for (const expense of expenseProjectionsData) {
      if (expense.cost === 0) continue;
      cumulativeActualExpenditure += expense.cost;
      cumulativeEstimateExpenditure += expense.estimateCost;

      actualCostData[x] = cumulativeActualExpenditure;
      estimatedCostData[x] = cumulativeEstimateExpenditure;
      x++;
    }

    for (const expense of expenseProjectionsData) {
      if (expense.cost !== 0) continue;
      cumulativeEstimateExpenditure += expense.estimateCost;
      estimatedCostData[x] = cumulativeEstimateExpenditure;
      x++;
    }

    return [actualCostData, estimatedCostData];
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
            color="secondary"
            size="sm"
            variant="solid"
          >
            Projected Expenditure
          </Chip>
          <div className="mb-4 flex w-full flex-row items-center justify-center gap-4">
            <Chip color="secondary" className="p-6">
              <p className="text-4xl font-thin">
                {`${selectedProject?.currencySymbol} `}
                {projectedExpenditure}
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
              <Tooltip
                content={`${projectedExpenditure > estimatedExpenditure ? "Over budget projection" : "Under budget projection"}`}
              >
                <p className="text-4xl font-thin">
                  {`${selectedProject?.currencySymbol} `}
                  {`${(projectedExpenditure - estimatedExpenditure).toFixed(2)}`}
                </p>
              </Tooltip>
            </Chip>
            <Chip
              color={
                projectedExpenditure > estimatedExpenditure
                  ? "danger"
                  : "success"
              }
              className="p-6"
            >
              <Tooltip
                content={`${projectedExpenditure > estimatedExpenditure ? "Over budget Projection" : "Under budget Projection"}`}
              >
                <p className="text-4xl font-thin">
                  {`${((Math.abs(projectedExpenditure - estimatedExpenditure) / estimatedExpenditure) * 100).toFixed(2)}% `}
                </p>
              </Tooltip>
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
                      text: "Value of Expenses In " + selectedProject?.currency,
                    },
                  },
                  x: {
                    title: {
                      display: true,
                      text: "Number of Expenses",
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
            className={`absolute right-0 top-0 m-1 bg-[${semanticColors.dark.primary[500]}]`}
            size="sm"
            variant="solid"
          >
            <p>Current Expenditure</p>
          </Chip>

          <div className="mb-2 flex w-full flex-row items-center justify-center gap-4">
            <Chip className={`p-6 bg-[${semanticColors.dark.primary[500]}]`}>
              <p className="text-4xl font-thin">
                {`${selectedProject?.currencySymbol} `}
                {costTotal}
              </p>
            </Chip>
            <Chip
              color={costTotal > estimateCostTotal ? "danger" : "success"}
              className="p-6"
            >
              <Tooltip
                content={`${costTotal > estimateCostTotal ? "Current over budget" : "Current under budget"}`}
              >
                <p className="text-4xl font-thin">
                  {`${((Math.abs(estimateCostTotal - costTotal) / estimateCostTotal) * 100).toFixed(2)}%`}
                </p>
              </Tooltip>
            </Chip>
          </div>
          <div className="relative">
            <Doughnut data={costChartData} />
            <Button
              isIconOnly
              radius="full"
              className={`absolute left-[35%] top-[40%] h-[30%] w-[30%] rounded-full text-xl font-thin bg-[${semanticColors.dark.primary[500]}]`}
            />
          </div>
        </Card>

        <Card className="flex h-fit w-1/2 flex-col items-center p-8">
          <Chip
            className="absolute right-0 top-0 m-1"
            color="warning"
            size="sm"
            variant="solid"
          >
            Planned Expenditure
          </Chip>
          <div className="mb-2 flex w-full flex-row items-center justify-center gap-4">
            <Chip color="warning" className="p-6">
              <p className="text-4xl font-thin">
                {`${selectedProject?.currencySymbol} `}
                {estimateCostTotal}
              </p>
            </Chip>
          </div>
          <div className="relative">
            <Doughnut data={estimateCostChartData}></Doughnut>
            <Button
              isIconOnly
              radius="full"
              className="absolute left-[35%] top-[40%] h-[30%] w-[30%] rounded-full text-xl font-thin"
              color="warning"
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ExpensesDashboard;
