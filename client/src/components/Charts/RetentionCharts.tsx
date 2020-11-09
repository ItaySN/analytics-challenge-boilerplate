
import { weeklyRetentionObject } from 'models';
import React, { useEffect, useState } from 'react';
import axios from "axios";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import styled, { StyledComponent } from 'styled-components'
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

    const TD:StyledComponent<"td", any, {}, never> = styled.td`
        border:"1px solid black";
        font-size:"100px";
        border-Collapse:"collapse";
    `;
    const TR: StyledComponent<"tr", any, {}, never> = styled.tr`
        border:"1px solid black";
        font-size:"100px";
        border-Collapse:"collapse";
    `;
    const TABLE: StyledComponent<"table", any, {}, never> = styled.table`
        border:"1px solid black";
        font-size:"100px";
        border-Collapse:"collapse";
    `;

    const colorByPercent = (num: number) => {
        switch (true) {
            case (num < 21):
                return <TD style={{ backgroundColor: " #b3d1ff", border: "1px solid black", borderCollapse:"collapse"}}>{`${num}%`} </TD>

            case (num < 41 && num > 20):
                return <TD style={{ backgroundColor: "#b3d1ff", border: "1px solid black"}}>{`${num}%`} </TD>

            case (num < 61 && num > 40):
                return <TD style={{ backgroundColor: "  #80b3ff", border: "1px solid black"}}>{`${num}%`} </TD>

            case (num < 81 && num > 60):
                return <TD style={{ backgroundColor: "#4d94ff", border: "1px solid black"}}>{`${num}%`} </TD>

            case (num < 91 && num > 80):
                return <TD style={{ backgroundColor: " #0066ff", border: "1px solid black"}}>{`${num}%`}</TD>

            case (num < 101 && num > 90):
                return <TD style={{ backgroundColor: " #0047b3", border: "1px solid black"}}>{`${num}%`} </TD>

        }
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
                    <TABLE>
                        <TR>
                            <TD>
                                <span style={{ fontWeight: "bold" }}>All users</span> <br /> <span style={{ color: "#b3b3b3" }}> {countAllUsers()} </span>
                            </TD>        
                            {retentionEvents.map((obj: weeklyRetentionObject) => {
                                return <TD>{`week: ${obj.registrationWeek}`} </TD> 
                            })}
                        </TR>
                        {retentionEvents.map((obj: weeklyRetentionObject) => {
                            return <TR>
                                <TD>
                                    <span style={{ fontWeight: "bold" }}>{`${obj.start} - ${obj.end}`}</span> <br /> <span style={{ color: "#b3b3b3" }}>{`${obj.newUsers} users`}</span>
                                </TD>
                                {obj.weeklyRetention.map((percentOfAWeek: number) => {
                                    return colorByPercent(percentOfAWeek)
                                })}
                            </TR>
                        })}
                    </TABLE>
                </ByRetentionStyle>
            </>
        </>
    )
}



export default RetentionCharts;