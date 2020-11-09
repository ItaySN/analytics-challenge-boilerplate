import React, { useEffect, useState } from "react";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import axios from "axios";

interface dailyEvent {
    date: string,
    count: number,
}

const ChartByDays: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    // const [offset,setOffset] = useState<number>(0)
    const [events, setEvents] = useState<dailyEvent[]>()
    const getData = async (offset:number) => {
        const { data } = await axios.get(`http://localhost:3001/events/by-days/${offset}`);
        setEvents(data)
    }
    useEffect(() => {
        getData(0)
    }, [])

    const handleDateChange = (date: Date | null) => {
        setSelectedDate(date);
    };

    useEffect(() => {
        const today = new Date()
        const newOffset = Math.floor((today.getTime() - selectedDate!.getTime()) / (1000* 3600 * 24))
        getData(newOffset)
    },[selectedDate])

    return (
        <div className="chartTile">
            <div className="chartTileHeader">
                <h1>Sessions (by Days):</h1>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <KeyboardDatePicker
                        disableToolbar
                        variant="inline"
                        format="dd/MM/yyyy"
                        margin="normal"
                        id="by-days-date-picker"
                        label="Pick chart's last day"
                        value={selectedDate}
                        onChange={handleDateChange}
                        KeyboardButtonProps={{
                            'aria-label': 'change date',
                        }}
                    />
                </MuiPickersUtilsProvider>
            </div>
            <div className="chartTileLineChart">
                <LineChart width={500} height={250} data={events}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis/>
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#8884d8" />
                </LineChart>
            </div>
        </div>
        
    );
};
export default ChartByDays;



