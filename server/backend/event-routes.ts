///<reference path="types.ts" />

import express from "express";
import { Request, Response } from "express";

// some useful database functions in here:
import { v4 as uuidv4 } from "uuid";
import { getAllEvents, saveEvent, formatDate, convertDaysToMili, sessionsByDay, sessionByHour, retention, countByOs, countByBrowser } from "./database";
import { Event, weeklyRetentionObject } from "../../client/src/models/event";
import { ensureAuthenticated, validateMiddleware } from "./helpers";

import {
  shortIdValidation,
  searchValidation,
  userFieldsValidator,
  isUserValidator,
} from "./validators";
import { any, filter, fromCallback } from "bluebird";
import { type } from "os";
import { uniqueId } from "lodash";
const router = express.Router();

// Routes

interface Filter {
  sorting: string;
  type: string;
  browser: string;
  search: string;
  offset: number;
}

router.get('/all', (req: Request, res: Response) => {
  res.send(getAllEvents())
});

router.get('/all-filtered', (req: Request, res: Response) => {
  let filter: Filter = req.query;
  let more:boolean = false
  let filteredArray: Event[] = getAllEvents();
  
  if(filter.browser)
  {
    filteredArray = filteredArray.filter(event => event.browser === filter.browser)
  }
  if(filter.type)
  {
    filteredArray = filteredArray.filter(event => event.name === filter.type)
  }
  if(filter.search)
  {
    filteredArray = filteredArray.filter(event => Object.values(event).some((value: string) => value.toString().includes(filter.search)))
  }
  if(filter.sorting)
  {
    if(filter.sorting === "+date"){
      filteredArray = filteredArray.sort((a:Event,b:Event)=>{
        return  a.date - b.date
      })
    }
    else if(filter.sorting === "-date"){
      filteredArray = filteredArray.sort((a:Event,b:Event)=>{
        return b.date - a.date
      })
    }
  }
  if(filter.offset)
  {
    let tempArr:Event[]=[];
    for(let i = 0; i < filter.offset; i++)
    {
      if(filteredArray[i])
      {
        tempArr[i] = filteredArray[i];
      }
    }
    if(tempArr.length<filteredArray.length)
    {
      more = true
    }

    filteredArray = tempArr;
  }
  res.send({events: filteredArray,
            more : more
          })
});

router.get('/by-days/:offset', (req: Request, res: Response) => {
  let offset:number = parseInt(req.params.offset);
  res.send(sessionsByDay(offset))
});


router.get('/by-hours/:offset', (req: Request, res: Response) => {
  let offset:number = parseInt(req.params.offset);
  res.send(sessionByHour(offset))
});

router.get('/by-os', (req:Request,res:Response) => {
  res.send(countByOs())
})

router.get('/by-browser', (req: Request, res: Response) => {
  res.send(countByBrowser())
})

router.get('/today', (req: Request, res: Response) => {
  res.send('/today')
});

router.get('/week', (req: Request, res: Response) => {
  res.send('/week')
});

router.get('/retention', (req: Request, res: Response) => {
  const {dayZero} = req.query
  res.send(retention(parseInt(dayZero)))
});
router.get('/:eventId',(req : Request, res : Response) => {
  res.send('/:eventId')
});

router.post('/', (req: Request, res: Response) => {

  const newEvent:Event = {
    _id : uuidv4(),
    session_id: uuidv4(),
    name : req.body.name,
    url: req.body.url,
    distinct_user_id: req.body.distinct_user_id,
    date: req.body.date,
    os: req.body.os,
    browser: req.body.browser,
    geolocation: req.body.geolocation,
  };
  saveEvent(newEvent)
  res.send(`new event was added .  ${newEvent}`)
});

router.get('/chart/os/:time',(req: Request, res: Response) => {
  res.send('/chart/os/:time')
})

  
router.get('/chart/pageview/:time',(req: Request, res: Response) => {
  res.send('/chart/pageview/:time')
})

router.get('/chart/timeonurl/:time',(req: Request, res: Response) => {
  res.send('/chart/timeonurl/:time')
})

router.get('/chart/geolocation/:time',(req: Request, res: Response) => {
  res.send('/chart/geolocation/:time')
})


export default router;
