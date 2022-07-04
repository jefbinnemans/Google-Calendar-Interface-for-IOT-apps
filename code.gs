function doGet(e) {

  calName="HomeAutomation"   //Name of the calendar to get the events from, change to your personal calendar name

  /**********************************
   * Parse URL query date parameter *
   *********************************/
  
  //If parameter is not there, or if parameter is in the wrong format, just report events of today.

  try {
   datestring = e.parameter.date;
   Logger.log("Parameter present in URL, parsing");
   year =datestring.substr(0, 4);
   month=datestring.substr(4, 2);
   day  =datestring.substr(6, 2);
   qdate = new Date(parseInt(year), parseInt(month)-1, parseInt(day), 0, 0, 0, 0);
  }
  catch (ex) {
   qdate = new Date();
  }
  
  /***********************************************
   * Get all events from calendar for query date *
   ***********************************************/
  start=new Date( qdate.getFullYear(), qdate.getMonth(), qdate.getDate(), 0 , 0,  0,  0  );
  end  =new Date( qdate.getFullYear(), qdate.getMonth(), qdate.getDate(), 23, 59, 59, 999);
  Logger.log("Start of query day: " + start);
  Logger.log("End of queryday:"    + end  );

  cal=CalendarApp.getCalendarsByName(calName);
  if (cal.length!=1) {
    Logger.log("Found " + cal.length + " calendars with name " + calName + ". Only works if there is just one calendar.");
    return;
  }
  cal=cal[0]; 
  events = cal.getEvents(start, end);
  jsonstring="";
  Logger.log("Found " + events.length + " events:")
  
  /************************************************
   * Parse start and end of events to JSON string *
   ************************************************/
  
  //Only make JSON record for start and/or end of events that are schedulled in the query date
  events.forEach(function (item, index) {
    start=item.getStartTime();
    end  =item.getEndTime();
    title=item.getTitle();
    desc =item.getDescription();
    Logger.log("EVENT " + index + " title:" + item.getTitle() + ", description: "+ item.getDescription()+ ", start: " + item.getStartTime() + ", end: " + item.getEndTime());
    if (isSameDay(start, qdate)) {
      Logger.log("Generate JSON record for start")
      jsonstring= toJSON(jsonstring, "start", title, desc, start);
    }
    if (isSameDay(end,   qdate)) {
      Logger.log("Generate JSON record for end");
      jsonstring= toJSON(jsonstring, "end", title, desc, end);
    }
  })
  Logger.log(jsonstring)

  //Provide feedback...
  return ContentService.createTextOutput(jsonstring)
}


/********************
 * Helper functions *
 *******************/

function isSameDay(checkme, ref) {
  return (ref.getFullYear() === checkme.getFullYear() && ref.getMonth() === checkme.getMonth() && ref.getDate() === checkme.getDate()); 
}

function toJSON(jsonstring, type, title, description, date) {
   returnme = jsonstring;
   if (jsonstring.length!=0) returnme +=", ";
   returnme+=JSON.stringify({
     type: type,
     title: title,
     description: description,
     h: date.getHours(), 
     m: date.getMinutes(),
     s: date.getSeconds()+date.getMilliseconds()/1000
   })
   return returnme
}
