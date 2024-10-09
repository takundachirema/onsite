"use client";

import "chart.js/auto";
import { api } from "$/src/trpc/react";
import { useEffect, useState } from "react";
import { Button, Card, Chip, semanticColors } from "@nextui-org/react";
import { selectedProjectAtom } from "$/src/context/JotaiContext";
import { useAtomValue } from "jotai";
import { Doughnut, Line } from "react-chartjs-2";
import { type ChartData } from "chart.js";
import { statusDataMap } from "$/src/utils/utils";
import { type StatusCode } from "$/src/utils/types";
import { type Status } from "@prisma/client";
import { type DataPoint, linear } from "regression";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

const TasksDashboard = () => {
  /** react hooks */
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

    // get first day of project
    const projectEndDate = new Date(selectedProject.dueDate);

    const [labels, regressionLabels] = getProjectionLabels(
      new Date(taskProjectionsData[0]!.projectStartDate),
      projectEndDate,
    );

    // get the data
    const projectionData = getProjectionData(
      new Date(taskProjectionsData[0]!.projectStartDate),
      new Date(),
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
    setProjectedCompletionPercentage(
      (([...regressionData].pop() ?? 0) / taskCount) * 100,
    );

    setProjectionsChartData({
      labels: labels,
      datasets: [
        {
          label: "Completed Tasks",
          data: projectionData,
          fill: false,
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1,
        },
        {
          label: "Completed Tasks Projection",
          data: regressionData,
          fill: true,
          borderColor:
            projectedCompletionPercentage >= 100
              ? semanticColors.dark.success[400]
              : semanticColors.dark.danger[400],
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
    const currentDate = startDate;
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

  const getProjectionData = (startDate: Date, endDate: Date) => {
    let approvedTasks = 0;
    const data: number[] = [];

    let position = 0;
    let x = 0;
    const currentDate = startDate;
    while (currentDate <= endDate) {
      const currentDateStr = currentDate.toDateString();
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
            Projections
          </Chip>
          <div className="flex w-full flex-row items-center gap-4">
            {projectedCompletionPercentage >= 100 && (
              <FaCheckCircle
                size="40"
                color={semanticColors.dark.success[400]}
              ></FaCheckCircle>
            )}
            {projectedCompletionPercentage < 100 && (
              <FaExclamationCircle
                size="40"
                color={semanticColors.dark.danger[400]}
              ></FaExclamationCircle>
            )}
            <p className="text-4xl font-thin">
              {`${projectedCompletionPercentage}% Complete`}
            </p>
          </div>
          <div className="relative">
            <Line options={{ responsive: true }} data={projectionsChartData} />
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
            Planned
          </Chip>
          <p className="text-4xl font-thin">
            {`${plannedCompletionPercentage.toFixed(0)}% Complete`}
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
            Actual
          </Chip>
          <p className="text-4xl font-thin">
            {`${completionPercentage.toFixed(0)}% Complete`}
          </p>

          <div className="relative">
            <Doughnut data={costChartData} />
            <Button
              isIconOnly
              radius="full"
              className="absolute left-[35%] top-[40%] h-[30%] w-[30%] rounded-full text-xl font-thin"
              color={
                completionPercentage >= plannedCompletionPercentage
                  ? "success"
                  : "danger"
              }
            >
              {`${completionPercentage - plannedCompletionPercentage} %`}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TasksDashboard;
