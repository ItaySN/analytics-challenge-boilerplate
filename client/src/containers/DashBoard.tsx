
import ChartByDays from "components/Charts/ChartsByDays";
import ChartByHours from "components/Charts/ChartsByHours";
import GoogleMapCharts from "components/Charts/GoogleMapCharts";
import RetentionCharts from "components/Charts/RetentionCharts";
import ChartsByOs from "components/Charts/ChartsByOs"
import React from "react";
import { Interpreter } from "xstate";
import { AuthMachineContext, AuthMachineEvents } from "../machines/authMachine";
import LogCharts from "components/Charts/LogCharts";
import ChartsByBrowser from "components/Charts/ChartsByBrowser";

export interface Props {
  authService: Interpreter<AuthMachineContext, any, AuthMachineEvents, any>;
}

const DashBoard: React.FC = () => {
  return (
    <>
    <ChartByDays/>
    <ChartByHours/>
    <RetentionCharts/>
    <GoogleMapCharts/>
    <ChartsByOs/>
    <ChartsByBrowser/>
    <LogCharts/>
    </>
  );
};

export default DashBoard;
