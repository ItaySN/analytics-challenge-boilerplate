import { Event } from 'models';
import React, { useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component';
import axios from 'axios'
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl'; 
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { TextField } from '@material-ui/core';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import styled, { StyledComponent } from 'styled-components'
import ByLogStyle from 'components/Styles/ByLogStyle';



const LogCharts:React.FC = () =>{
    const [events,setEvents] = useState<Event[]>([])
    const [eventsCount,setEventsCount] = useState<number>(10)
    const [hasMore,setHasMore] = useState<boolean>(true)
    const [search,setSearch] = useState<string>("")
    const [sorting, setSorting] = useState<string>("")
    const [browser, setBrowser] = useState<string>("")
    const [type, setType] = useState<string>("")

    const colors: string[] = ["#a6fb00", "#21858b", "#641c36", "#faa43a", "#c23582", "#b5a400", "#3f6176", "#826176"]

    const getData = async (offset:number): Promise<void> =>{
        const { data }: { data: { events: Event[], more: boolean } } = await axios.get(`http://localhost:3001/events/all-filtered?sorting=${sorting}&offset=${offset}&search=${search}&type=${type}&browser=${browser}`)
        setEvents(data.events);
        setHasMore(data.more)
    }

    useEffect(() => {
        getData(10)
    }, [search,sorting,browser,type])

    

    const handleNext = () =>{
        getData(eventsCount + 10)
        setEventsCount(eventsCount + 10);
    }

    function getRandomInt(max:number) {
        return Math.floor(Math.random() * Math.floor(max));
    }

    const handleBrowser = (event: React.ChangeEvent<{ value: unknown }>) => {
        setBrowser(event.target.value as string);
    };
    const handleType = (event: React.ChangeEvent<{ value: unknown }>) => {
        setType(event.target.value as string);
    };
    const handleSorting = (event: React.ChangeEvent<{ value: unknown }>) => {
        setSorting(event.target.value as string);
    };
    const handleSearch = (event: React.ChangeEvent<{ value: unknown }>) => {
        setSearch(event.target.value as string);
    };
    const formatDate = (date: Date): string => {
        var displayDate = ("0" + date.getDate()).slice(-2) + "/" +
            ("0" + (date.getMonth() + 1)).slice(-2) + "/" +
            (+ date.getFullYear())
        return displayDate;
    }

    const BOLDSPAN: StyledComponent<"span", any, {}, never> = styled.span`
        font-weight:"bold";
    `;

    return(
        <>  
            <h1>Events Log:</h1>
            <ByLogStyle>

            
                <div style={{display: "flex", flexDirection:"column",width:"10vw"}}>
                        <TextField id="filter-search" label="Search" onChange={handleSearch} />
                        <FormControl style={{ width: "10vw" }}>
                            <InputLabel id="select-sorting">Sorting</InputLabel>
                            <Select
                                labelId="select-sorting"
                                value={sorting}
                                onChange={handleSorting}
                            >
                            <MenuItem value={"%2Bdate"}>Old to New</MenuItem>
                            <MenuItem value={"-date"}>New to Old</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl style={{width:"10vw"}}>
                            <InputLabel id="select-browser">Browser</InputLabel>
                            <Select
                                labelId="select-browser"
                                value={browser}
                                onChange={handleBrowser}
                            >
                                <MenuItem value="">
                                    <em>None</em>
                                </MenuItem>
                                <MenuItem value={"linux"}>Linux</MenuItem>
                                <MenuItem value={"firefox"}>FireFox</MenuItem>
                                <MenuItem value={"edge"}>Edge</MenuItem>
                                <MenuItem value={"chrome"}>Chrome</MenuItem>
                                <MenuItem value={"ie"}>Ie</MenuItem>
                                <MenuItem value={"other"}>Other</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl style={{ width: "10vw" }}>
                            <InputLabel id="select-type">Type</InputLabel>
                            <Select
                                labelId="select-type"
                                value={type}
                                onChange={handleType}
                            >
                                <MenuItem value="">
                                    <em>None</em>
                                </MenuItem>
                                <MenuItem value={"signup"}>Sign Up</MenuItem>
                                <MenuItem value={"login"}>Login</MenuItem>
                                <MenuItem value={"pageView"}>Page View</MenuItem>
                            </Select>
                        </FormControl>
                </div>
                <div style={{width:"65vw",marginLeft:"30px"}}>
                    {events && 
                        <InfiniteScroll
                            dataLength={events.length}
                            next={handleNext}
                            hasMore={hasMore}
                            loader={<h4>Loading...</h4>}
                            endMessage={
                                <p style={{ textAlign: 'center' }}>
                                    <b>You have seen it all</b>
                                </p>
                            }
                            height={"50vh"}
                        >
                            {
                            events.map((event:Event) => {
                                let randomNum:number = getRandomInt(7)
                                let color:string = colors[randomNum]
                                return (
                                    <Accordion>
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                            aria-controls="panel1a-content"
                                            id="panel1a-header">
                                            <Typography >
                                                <div style={{ display: "flex", flexDirection: "row"}}>
                                                    <p style={{ borderRadius: "50%", height: "4vh", width: "2vw", backgroundColor: color }}></p>
                                                    <h4 style={{ marginLeft: "3px" }}>{`user ID: ${event.distinct_user_id}`}</h4>
                                                </div>
                                            </Typography>
                                        </AccordionSummary>
                                            <AccordionDetails>
                                                <Typography>
                                                {
                                                    <div style={{display:"flex",flexDirection:"column",fontSize:"2vh"}}>
                                                        <p><span style={{fontWeight:"bold"}}>date:</span><span>{formatDate(new Date(event.date))}</span></p>
                                                        <p><span style={{fontWeight:"bold"}}>os:</span > <span>{event.os}</span></p>
                                                        <p><span style={{fontWeight:"bold"}}>session_id:</span> <span>{event.session_id}</span></p>
                                                        <p><span style={{fontWeight:"bold"}}>URL:</span><span>{event.url}</span></p>
                                                    </div>
                                                }
                                                </Typography>
                                            </AccordionDetails>
                                    </Accordion>
                                )
                            })}
                        </InfiniteScroll>
                    }   
                </div>
            </ByLogStyle>
        </>
    )
}
export default LogCharts;
