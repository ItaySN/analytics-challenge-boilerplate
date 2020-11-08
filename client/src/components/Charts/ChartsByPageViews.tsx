import React, { useEffect, useState } from 'react'
import ChartsByBrowser from './ChartsByBrowser'
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar} from 'recharts'
import { urlCount } from '../../../../server/backend/database'
import axios from 'axios'
import ByUrlStyle from 'components/Styles/ByUrlStyle'

const ChartsByPageViews: React.FC = () => {
    const[eventsByUrl, setEvnetsByUrl] = useState<urlCount[]>([])

    const getData = async (): Promise<void> => {
        const { data }: { data: urlCount[] } = await axios.get('http://localhost:3001/events/by-url')
        setEvnetsByUrl(data)
    }

    useEffect(() => {
        getData()
    }, [])


    return(
        <>
            <ByUrlStyle>
                <h1>Page Views by URL :</h1>
                <BarChart
                    width={400}
                    height={300}
                    data={eventsByUrl}
                    margin={{
                        top: 30, right: 30, left: 20, bottom: 5,
                    }}
                    barSize={30}
                >
                    <XAxis dataKey="name" scale="point" padding={{ left: 10, right: 10 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Bar dataKey="pageViews" fill="#641c36" background={{ fill: '#eee' }} />
                </BarChart>
            </ByUrlStyle>
        </>
    )   
}

export default ChartsByPageViews;