
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
import ChartsByPageViews from "components/Charts/ChartsByPageViews";
import AdminPage from "components/Styles/AdminPage";
import PieChartsStyle from "components/Styles/PieChartsStyle"
import ByHoursDays from "components/Styles/ByHoursDays";
import SectionThree from "components/Styles/SectionThree";

export interface Props {
  authService: Interpreter<AuthMachineContext, any, AuthMachineEvents, any>;
}

const DashBoard: React.FC = () => {
  return (
    <>
    <h1 style={{textAlign:"center",fontSize:"3em"}}>Admin Page</h1>
    <AdminPage>
      
      <ByHoursDays>
        <ChartByDays/>
        <ChartByHours/>
      </ByHoursDays>

        <PieChartsStyle>
          <ChartsByOs/>
          <ChartsByBrowser/> 
        </PieChartsStyle>

        <SectionThree>
          <ChartsByPageViews />
          <GoogleMapCharts/>
        </SectionThree>

        <RetentionCharts/>
        <LogCharts/>
     
    </AdminPage>
    </>
  );
};

export default DashBoard;
