import React, { useEffect, useState } from "react";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import axios from "axios";

interface hourlyEvent {
    hour: string,
    count: number,
}

const ChartByHours: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [events, setEvents] = useState<hourlyEvent[]>()
    const getData = async (offset: number) => {
        const { data } = await axios.get(`http://localhost:3001/events/by-hours/${offset}`);
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
        const newOffset = Math.floor((today.getTime() - selectedDate!.getTime()) / (1000 * 3600 * 24))
        getData(newOffset)
    }, [selectedDate])

    return (
        <div className="chartTile">
            <div className="chartTileHeader">
                <h1>Sessions (by Hours):</h1>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <KeyboardDatePicker
                        disableToolbar
                        variant="inline"
                        format="dd/MM/yyyy"
                        margin="normal"
                        id="by-days-date-picker"
                        label="Choose a date for getting data"
                        value={selectedDate}
                        onChange={handleDateChange}
                        KeyboardButtonProps={{
                            'aria-label': 'change date',
                        }}
                    />
                </MuiPickersUtilsProvider>
            </div>
            <div className="chartTileLineChart">
                <LineChart width={650} height={250} data={events}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#8884d8" />
                </LineChart>
            </div>
        </div>

    );
};
export default ChartByHours;



