import React, { useEffect, useState } from 'react'
import {osCount} from '../../../../server/backend/database'
import axios from 'axios'
import {PieChart,Pie,Cell,Tooltip} from 'recharts'
import { Color } from '@material-ui/core'

const ChartsByOs:React.FC = () =>{
    
    const [eventsByOs,setEvnetsByOs] = useState<osCount[]>([])
    const colors: string[] = ["#a6fb00", "#21858b", "#641c36", "#faa43a", "#c23582","#b5a400"]
    
    const getData  = async():Promise<void> =>{
        const { data }: { data: osCount[] } = await axios.get('http://localhost:3001/events/by-os')
        setEvnetsByOs(data)
    }

    useEffect(() =>{
        getData()
    },[])


    return(
        <>
            <div>
                <h1>Session by OS:</h1>
                <PieChart width={730} height={250}>
                    <Pie data={eventsByOs} cx="50%" dataKey="value" cy="50%" outerRadius={80} label>
                        {
                            eventsByOs.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index]} />
                            ))
                        }
                    </Pie>
                    <Tooltip/>
                </PieChart>
            </div>
        </>
    )
}

export default ChartsByOs;