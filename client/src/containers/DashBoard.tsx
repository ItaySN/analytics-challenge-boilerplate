
import ChartByDays from "components/Charts/ChartsByDays";
import ChartByHours from "components/Charts/ChartsByHours";
import RetentionCharts from "components/Charts/RetentionCharts";
import React from "react";
import { Interpreter } from "xstate";
import { AuthMachineContext, AuthMachineEvents } from "../machines/authMachine";

export interface Props {
  authService: Interpreter<AuthMachineContext, any, AuthMachineEvents, any>;
}

const DashBoard: React.FC = () => {
  return (
    <>
    <ChartByDays/>
    <ChartByHours/>
    <RetentionCharts/>
    </>
  );
};

export default DashBoard;
