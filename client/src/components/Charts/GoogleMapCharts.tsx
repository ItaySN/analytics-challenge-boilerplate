import axios from 'axios'
import { Event } from 'models';
import { Marker, GoogleMap, LoadScript, MarkerClusterer } from '@react-google-maps/api';
import React, { useEffect, useState } from 'react'

const GoogleMapCharts : React.FC = () =>{
    const [events, setEvents] = useState<Event[]>([])
    const getData = async () =>{
        const { data }: { data: Event[] } = await axios.get('http://localhost:3001/events/all')
        setEvents(data);
    }
    useEffect(()=>{
        getData()
    },[])

    const mapStyle = {
        height: '40vh',
        width: '40vw'
    }

    const MapTypeStyle = [
        {
            featureType: "all",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
        },
    ];
    return(
        <>
            <h1> Cluster Events</h1>
            <LoadScript googleMapsApiKey='AIzaSyBh4Sev4yYARt9XdMOaeAUPKPZQZ6iaWcs'
            >
                <GoogleMap
                    mapContainerStyle={mapStyle}
                    zoom={1.1}
                    options={{
                        scrollwheel: true,
                        zoomControl: true,
                        draggable: true,
                        styles: MapTypeStyle,
                        fullscreenControl: true,
                        mapTypeControl: false,
                        streetViewControl: false,
                        draggableCursor: 'default'
                    }}
                    center ={{lat:32, lng:35}}
                >
                    <MarkerClusterer 
                    gridSize={70}>
                    {
                        (clusterer) => events.map((event: Event) => {
                            return (
                                <Marker
                                    position={event.geolocation.location}
                                    key={event.date}
                                    clusterer={clusterer}
                                />
                            )
                        })         
                    }
                    </MarkerClusterer>
                </GoogleMap>
            </LoadScript>
        
        </>

    )
}

export default GoogleMapCharts;