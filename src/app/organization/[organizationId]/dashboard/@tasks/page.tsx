"use client";

import "chart.js/auto";
import { api } from "$/src/trpc/react";
import { useEffect, useState } from "react";
import { Button, Card, Chip, semanticColors, Tooltip } from "@nextui-org/react";
import { selectedProjectAtom } from "$/src/context/JotaiContext";
import { useAtomValue } from "jotai";
import { Doughnut, Line } from "react-chartjs-2";
import { type ChartData } from "chart.js";
import { statusDataMap } from "$/src/utils/utils";
import { type StatusCode } from "$/src/utils/types";
import { type Status } from "@prisma/client";
import { type DataPoint, linear } from "regression";

const TasksDashboard = () => {
  /** react hooks */
  const [completedTasks, setCompletedTasks] = useState(0);
  const [projectedCompletedTasks, setProjectedCompletedTasks] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [plannedCompletionPercentage, setPlannedCompletionPercentage] =
    useState(0);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [projectedCompletionPercentage, setProjectedCompletionPercentage] =
    useState(0);
  const [tasksData, setTasksData] = useState<
    {
      status: string;
      count: number;
      plannedCount: number;
    }[]
  >([]);
  const [taskProjectionsData, setTaskProjectionsData] = useState<Status[]>([]);
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
  const getTasksDataQuery = api.dashboard.getTasksData.useQuery(
    { projectId: selectedProject?.id ?? "" },
    { enabled: false },
  );

  const getTaskProjectionsDataQuery =
    api.dashboard.getTaskProjectionsData.useQuery(
      { projectId: selectedProject?.id ?? "" },
      { enabled: false },
    );

  /** useeffect hooks */
  useEffect(() => {
    getTasksDataQuery
      .refetch()
      .then((response) => {
        if (response.data) {
          console.log("** tasks data");
          console.log(response.data.data);
          setTasksData(response.data.data);
        }
      })
      .catch((error) => {
        console.log(error);
      });

    getTaskProjectionsDataQuery
      .refetch()
      .then((response) => {
        if (response.data) {
          setTaskProjectionsData(response.data.data);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, [selectedProject]);

  useEffect(() => {
    setEstimateCostChartData({
      labels: tasksData.map((data) => data.status),
      datasets: [
        {
          label: "Estimate Costs",
          data: tasksData.map((data) => data.plannedCount),
          backgroundColor: tasksData.map((data) => {
            const color = statusDataMap[data.status as StatusCode].color;
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
      labels: tasksData.map((data) => data.status),
      datasets: [
        {
          label: "Actual Costs",
          data: tasksData.map((data) => data.count),
          backgroundColor: tasksData.map((data) => {
            const color = statusDataMap[data.status as StatusCode].color;
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

    const taskCount = tasksData.reduce(
      (total, data) => total + data.plannedCount,
      0,
    );
    const plannedApprovedTaskCount = tasksData.find(
      (taskData) => taskData.status === "approved",
    )?.plannedCount;
    const approvedTaskCount = tasksData.find(
      (taskData) => taskData.status === "approved",
    )?.count;

    setCompletedTasks(approvedTaskCount ?? 0);

    setPlannedCompletionPercentage(
      ((plannedApprovedTaskCount ?? 0) / taskCount) * 100,
    );

    setCompletionPercentage(((approvedTaskCount ?? 0) / taskCount) * 100);
  }, [tasksData]);

  useEffect(() => {
    // alert("he");
    if (taskProjectionsData.length === 0 || !selectedProject) {
      return;
    }

    // get project dates
    const projectStartDate = new Date(selectedProject.startDate);
    const projectEndDate = new Date(selectedProject.dueDate);
    const currentDate = new Date();

    const [labels, regressionLabels] = getProjectionLabels(
      projectStartDate,
      projectEndDate,
    );

    // get the data
    const projectionData = getProjectionData(
      projectStartDate,
      currentDate > projectEndDate ? projectEndDate : currentDate,
    );

    // create the regression data
    const regressionDataPoints = getRegressionData(
      regressionLabels,
      projectionData,
    );

    const regressionData: number[] = [];
    regressionDataPoints.map((dataPoint) => {
      regressionData.push(dataPoint[1]);
    });

    const taskCount = tasksData.reduce(
      (total, data) => total + data.plannedCount,
      0,
    );

    setTotalTasks(taskCount);

    setProjectedCompletionPercentage(
      (([...regressionData].pop() ?? 0) / taskCount) * 100,
    );

    setProjectedCompletedTasks([...regressionData].pop() ?? 0);

    setProjectionsChartData({
      labels: labels,
      datasets: [
        {
          label: "Completed Tasks",
          data: projectionData,
          fill: false,
          borderColor: semanticColors.dark.primary[500],
          tension: 0.1,
        },
        {
          label: "Projected Completed Tasks",
          data: regressionData,
          fill: true,
          borderColor: semanticColors.dark.secondary[600],
          tension: 0.1,
        },
      ],
    });
  }, [taskProjectionsData, selectedProject, projectedCompletionPercentage]);

  const getProjectionLabels = (
    startDate: Date,
    endDate: Date,
  ): [string[], number[]] => {
    const labels: string[] = [];
    const regressionLabels: number[] = [];

    let x = 0;
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      let label = currentDate.getDate().toString();
      if (label === "1") {
        label = currentDate.toLocaleString("default", { month: "long" });
      }
      labels.push(label);
      regressionLabels.push(x);
      currentDate.setDate(currentDate.getDate() + 1);
      x++;
    }

    return [labels, regressionLabels];
  };

  /**
   * For each date in the range we find the number of approved tasks
   * - When a task is set to approved we increase the counter
   * - When a task is set from approved to not approved we decrease the counter
   * @param startDate
   * @param endDate
   * @returns
   */
  const getProjectionData = (startDate: Date, endDate: Date) => {
    let approvedTasks = 0;
    const data: number[] = [];

    let position = 0;
    let x = 0;

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const currentDateStr = currentDate.toDateString();
      // because the statuses are ordered by date we can iterate until the date changes
      while (taskProjectionsData[position]?.date === currentDateStr) {
        const status = taskProjectionsData[position];
        if (status?.status === "approved") {
          approvedTasks++;
        } else {
          approvedTasks--;
        }
        position++;
      }
      data[x] = approvedTasks;
      currentDate.setDate(currentDate.getDate() + 1);
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
    const firstIteration =
      yAxis.length < xAxis.length ? yAxis.length : xAxis.length;
    const secondIteration =
      yAxis.length > xAxis.length ? yAxis.length : xAxis.length;

    for (i = 0; i < firstIteration; i++) {
      regressionData.push([xAxis[i]!, yAxis[i]!]);
    }

    const regressionModel = linear(regressionData);

    const regressionPoints = [...regressionModel.points];

    for (i = i; i < secondIteration; i++) {
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
            Projected Completed Tasks
          </Chip>
          <div className="mb-4 flex w-full flex-row items-center justify-center gap-4">
            <Chip color="secondary" className="p-6">
              <p className="text-4xl font-thin">{`${projectedCompletedTasks} Tasks`}</p>
            </Chip>
            <Chip
              color={projectedCompletionPercentage < 100 ? "danger" : "success"}
              className="p-6"
            >
              <Tooltip
                content={`${projectedCompletionPercentage < 100 ? "Projected under completion" : "Projected over completion"}`}
              >
                <p className="text-4xl font-thin">
                  {`${projectedCompletionPercentage}%`}
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
                      text: "Number Of Tasks",
                    },
                  },
                  x: {
                    title: {
                      display: true,
                      text: "Time In Days",
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
            Current Completion
          </Chip>

          <div className="mb-2 flex w-full flex-row items-center justify-center gap-4">
            <Chip className={`p-6 bg-[${semanticColors.dark.primary[500]}]`}>
              <p className="text-4xl font-thin">{`${completedTasks} Tasks`}</p>
            </Chip>

            <Chip
              color={
                plannedCompletionPercentage > completionPercentage
                  ? "danger"
                  : "success"
              }
              className="p-6"
            >
              <Tooltip
                content={`${plannedCompletionPercentage < completionPercentage ? "Current under completion" : "Current over completion"}`}
              >
                <p className="text-4xl font-thin">
                  {`${Math.abs(completionPercentage - plannedCompletionPercentage).toFixed(0)}%`}
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
            Planned Completion
          </Chip>
          <Chip color="warning" className="p-6">
            <p className="text-4xl font-thin">{`${completedTasks} Tasks`}</p>
          </Chip>

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

export default TasksDashboard;
