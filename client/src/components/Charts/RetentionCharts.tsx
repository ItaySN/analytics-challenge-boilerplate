
import { weeklyRetentionObject } from 'models';
import React, { useEffect, useState } from 'react';
import axios from "axios";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import { dayZero } from '../../../../server/scripts/seedDataUtils';
import { retention } from '../../../../server/backend/database';

const RetentionCharts:React.FC = () => {
    const [retentionEvents,setRetentionEvent] = useState<weeklyRetentionObject[]>([])
    const [selectedDate,setSelectedDate] = useState<Date | null>(new Date("2020-10-01"))
    const [dayZero, setDayZero] = useState<number>(1601499600000);
    
    const getData = async (dayZero:number):Promise<void> =>{
        const { data }: { data: weeklyRetentionObject[] } = await axios.get(`http://localhost:3001/events/retention?dayZero=${dayZero}`)
        setRetentionEvent(data)
    }

    const handleDateChange = (date: Date | null) => {
        setSelectedDate(date);
        setDayZero(date!.getTime())
    };
    
    useEffect(() => {
        getData(dayZero)
    }, [selectedDate])

    useEffect(() => {
        getData(1601499600000);
    }, [])

    const countAllUsers = ():number =>{
        let count:number = 0;
        for(let i = 0; i < retentionEvents.length; i++)
        {
            count += retentionEvents[i].newUsers
        }
        return count;
    }

    return(
        <>
            <>
                <div className="chartTile">
                    <div className="chartTileHeader">
                        <h1>Retention data:</h1>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker
                                disableToolbar
                                variant="inline"
                                format="dd/MM/yyyy"
                                margin="normal"
                                id="by-days-date-picker"
                                label="Pick chart's first day"
                                value={selectedDate}
                                onChange={handleDateChange}
                                KeyboardButtonProps={{
                                    'aria-label': 'change date',
                                }}
                            />
                        </MuiPickersUtilsProvider>
                    </div>
                </div>
            </>
            <>
                <table style={{border:"1px solid black", fontSize: "18px", borderCollapse:"collapse"}}>
                        <tr style={{ border: "1px solid black", fontSize: "18px", borderCollapse: "collapse" }}>
                            <td style={{ border: "1px solid black", fontSize: "18px", borderCollapse: "collapse" }}>
                            <span>All users</span> <br/> <span> {countAllUsers()} </span>
                    </td>
                            {retentionEvents.map((obj: weeklyRetentionObject) => {
                                return <td style={{ border: "1px solid black", fontSize: "18px", borderCollapse: "collapse" }}>{`week: ${obj.registrationWeek}`}</td>
                    })}
                    </tr>
                    {retentionEvents.map((obj:weeklyRetentionObject)=>{
                        return <tr style={{ border: "1px solid black", fontSize: "18px", borderCollapse: "collapse" }}>
                            <td style={{ border: "1px solid black", fontSize: "18px", borderCollapse: "collapse" }}>
                    <span>{`${obj.start} - ${obj.end}`}</span> <br/> <span>{`${obj.newUsers} users`}</span>
                            </td>
                            {obj.weeklyRetention.map((percentOfAWeek: number) => {
                                return <td style=  {{ border: "1px solid black", fontSize: "18px", borderCollapse: "collapse" }}>{`${percentOfAWeek}%`} </td>
                            })}
                        </tr>
                    })}
                </table>
            </>
        </>
    )
}

export default RetentionCharts;