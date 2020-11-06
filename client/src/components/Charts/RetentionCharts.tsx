
import { weeklyRetentionObject } from 'models';
import React, { useEffect, useState } from 'react';
import axios from "axios";

const RetentionCharts:React.FC = () => {
    const [retentionEvents,setRetentionEvent] = useState<weeklyRetentionObject[]>([])
    const [selectedDate,setSelectedDate] = useState<Date>(new Date()) 

    const getData = async (dayZero:number):Promise<void> =>{
        const { data }: { data: weeklyRetentionObject[] } = await axios.get(`http://localhost:3001/events/retention?dayZero=1601499600000`)
        setRetentionEvent(data)
    }

    // useEffect(()=>{


    // },[selectedDate])

    useEffect(() => {
        getData(0);
    }, [])

    return(
        <>
        <table style={{border:"1px solid black", fontSize: "18px", borderCollapse:"collapse"}}>
                <tr style={{ border: "1px solid black", fontSize: "18px", borderCollapse: "collapse" }}>
                    <td style={{ border: "1px solid black", fontSize: "18px", borderCollapse: "collapse" }}>
                    sdfdsdgfg
               </td>
                    {retentionEvents.map((obj: weeklyRetentionObject) => {
                        return <td style={{ border: "1px solid black", fontSize: "18px", borderCollapse: "collapse" }}>{obj.registrationWeek}</td>
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
    )
}

export default RetentionCharts;