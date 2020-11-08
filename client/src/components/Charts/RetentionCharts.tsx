
import { weeklyRetentionObject } from 'models';
import React, { useEffect, useState } from 'react';
import axios from "axios";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import { dayZero } from '../../../../server/scripts/seedDataUtils';
import { retention } from '../../../../server/backend/database';
import ByRetentionStyle from 'components/Styles/ByRetentionStyle';

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

    const colorByPercent = (num:number) =>{
    switch (true) {
            case (num < 21):
            return <td style={{ border: "1px solid black", backgroundColor: " #b3d1ff", fontSize: "18px", borderCollapse: "collapse" }}>{`${num}%`} </td>

            case (num < 41 && num > 20):
            return <td style={{ border: "1px solid black", backgroundColor: "#b3d1ff", fontSize: "18px", borderCollapse: "collapse" }}>{`${num}%`} </td>

            case (num < 61 && num > 40):
            return <td style={{ border: "1px solid black", backgroundColor: "  #80b3ff", fontSize: "18px", borderCollapse: "collapse" }}>{`${num}%`} </td>

            case (num < 81 && num > 60):
            return <td style={{ border: "1px solid black", backgroundColor: "#4d94ff", fontSize: "18px", borderCollapse: "collapse" }}>{`${num}%`} </td>
            
        case (num < 91 && num > 80):
            return <td style={{ border: "1px solid black", backgroundColor: " #0066ff", fontSize: "18px", borderCollapse: "collapse" }}>{`${num}%`} </td>

            case (num < 101 && num > 90):
            return <td style={{ border: "1px solid black", backgroundColor: " #0047b3", fontSize: "18px", borderCollapse: "collapse" }}>{`${num}%`} </td>

        }
    }
    
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
                <ByRetentionStyle>
                    <table style={{ border: "1px solid black", fontSize: "18px", borderCollapse: "collapse" }}>
                        <tr style={{ border: "1px solid black", fontSize: "18px", borderCollapse: "collapse" }}>
                            <td style={{ border: "1px solid black", fontSize: "18px", borderCollapse: "collapse" }}>
                                <span style={{ fontWeight: "bold" }}>All users</span> <br /> <span style={{ color:"#b3b3b3"}}> {countAllUsers()} </span>
                            </td>
                            {retentionEvents.map((obj: weeklyRetentionObject) => {
                                return <td style={{ border: "1px solid black", fontSize: "18px", borderCollapse: "collapse", color: "#808080" }}>{`week: ${obj.registrationWeek}`}</td>
                            })}
                        </tr>
                        {retentionEvents.map((obj: weeklyRetentionObject) => {
                            return <tr style={{ border: "1px solid black", fontSize: "18px", borderCollapse: "collapse" }}>
                                <td style={{ border: "1px solid black", fontSize: "18px", borderCollapse: "collapse" }}>
                                    <span style={{ fontWeight: "bold" }}>{`${obj.start} - ${obj.end}`}</span> <br /> <span style={{ color: "#b3b3b3" }}>{`${obj.newUsers} users`}</span>
                                </td>
                                {obj.weeklyRetention.map((percentOfAWeek: number) => {
                                    return colorByPercent(percentOfAWeek)
                                })}
                            </tr>
                        })}
                    </table>
                </ByRetentionStyle>
            </>
        </>
    )
}



export default RetentionCharts;