(function($) {

	"use strict";

let cntg = true;
let cnty = true;
let cntr = true;
$(".done").prop("disabled", true);
$(document).ready(function(){
    $("#green").click(function(){
    if (cntg) {
        $("#yellow").prop("disabled", true);
        $("#red").prop("disabled", true);
        $(".done").prop("disabled", false);
        cntg = false;
    }
    });  
    $("#yellow").click(function(){
    if (cnty) {
        $("#green").prop("disabled", true);
        $("#red").prop("disabled", true);
        $(".done").prop("disabled", false);
        cnty = false;
    }
    });
    $("#red").click(function(){
    if (cntr) {
        $("#yellow").prop("disabled", true);
        $("#green").prop("disabled", true);
        $(".done").prop("disabled", false);
        cntr = false;
    }
    });  
})

// Setup the calendar with the current date
$(document).ready(function(){
    var date = new Date();
    // Set click handlers for DOM elements
    $(".right-button").click({date: date}, next_year);
    $(".left-button").click({date: date}, prev_year);
    $(".month").click({date: date}, month_click);
    $(".done").click({date: date}, new_event);
    // Set current month as active
    $(".months-row").children().eq(date.getMonth()).addClass("active-month");
    init_calendar(date);
});

// Initialize the calendar by appending the HTML dates
function init_calendar(date) {
    $(".tbody").empty();
    $(".events-container").empty();
    var calendar_days = $(".tbody");
    var month = date.getMonth();
    var year = date.getFullYear();
    var day_count = days_in_month(month, year);
    var row = $("<tr class='table-row'></tr>");
    var today = date.getDate();
    // Set date to 1 to find the first day of the month
    date.setDate(1);
    var first_day = date.getDay();
    // 35+firstDay is the number of date elements to be added to the dates table
    // 35 is from (7 days in a week) * (up to 5 rows of dates in a month)
    for(var i=0; i<35+first_day; i++) {
        // Since some of the elements will be blank, 
        // need to calculate actual date from index
        var day = i-first_day+1;
        // If it is a sunday, make a new row
        if(i%7===0) {
            calendar_days.append(row);
            row = $("<tr class='table-row'></tr>");
        }
        // if current index isn't a day in this month, make it blank
        if(i < first_day || day > day_count) {
            var curr_date = $("<td class='table-date nil'>"+"</td>");
            row.append(curr_date);
        }   
        else {
            var curr_date = $("<td class='table-date'>"+day+"</td>");
            var events = check_events(day, month+1, year);
            if(today===day && $(".active-date").length===0) {
                curr_date.addClass("active-date");
            }
            // If this date has any events, style it with .event-date
            if(events.length!==0) {
                if(events[0].state===1) {
                    curr_date.addClass("event-date-green");
                }
                if(events[0].state===2) {
                    curr_date.addClass("event-date-yellow");
                }
                if(events[0].state===3) {
                    curr_date.addClass("event-date-red");
                }
            }
            else {
                curr_date.addClass("event-date-yellow");
            }
            // Set onClick handler for clicking a date
            curr_date.click({events: events, month: months[month], day:day}, date_click);
            row.append(curr_date);
        }
    }
    // Append the last row and set the current year
    calendar_days.append(row);
    $(".year").text(year);
}

// Get the number of days in a given month/year
function days_in_month(month, year) {
    var monthStart = new Date(year, month, 1);
    var monthEnd = new Date(year, month + 1, 1);
    return (monthEnd - monthStart) / (1000 * 60 * 60 * 24);    
}

// Event handler for when a date is clicked
function date_click() {
    $(".events-container").show(250);
    $("#dialog").hide(250);
    $(".active-date").removeClass("active-date");
    $(this).addClass("active-date");
};

// Event handler for when a month is clicked
function month_click(event) {
    $(".events-container").show(250);
    $("#dialog").hide(250);
    var date = event.data.date;
    $(".active-month").removeClass("active-month");
    $(this).addClass("active-month");
    var new_month = $(".month").index(this);
    date.setMonth(new_month);
    init_calendar(date);
}

// Event handler for when the year right-button is clicked
function next_year(event) {
    $("#dialog").hide(250);
    var date = event.data.date;
    var new_year = date.getFullYear()+1;
    $("year").html(new_year);
    date.setFullYear(new_year);
    init_calendar(date);
}

// Event handler for when the year left-button is clicked
function prev_year(event) {
    $("#dialog").hide(250);
    var date = event.data.date;
    var new_year = date.getFullYear()-1;
    $("year").html(new_year);
    date.setFullYear(new_year);
    init_calendar(date);
}

// Event handler for clicking the new event button
function new_event(event) {
    // if a date isn't selected then do nothing
    if($(".active-date").length===0)
        return;
    // Event handler for done button
    $(".done").click({date: event.data.date}, function() {
        var date = event.data.date;
        var day = parseInt($(".active-date").html());
        var month = date.getMonth();
        var year = date.getFullYear();
        var state = 0;
        if (!cntg) {
            state = 1;
        }
        if (!cnty) {
            state = 2;
        }
        if (!cntr) {
            state = 3;
        }
        var events = check_events(day, month+1, year);
        if (events.length===0) {
            new_event_json(date, day, state);
        }
        else if (state) {
            update_event_json(day, month+1, year, state);
        }
        date.setDate(day);
        init_calendar(date);
        $("#green").prop("disabled", false);
        $("#yellow").prop("disabled", false);
        $("#red").prop("disabled", false);
        $(".done").prop("disabled", true);
        cntg = cnty = cntr = true;
    });
}

// Adds a json event to event_data
function new_event_json(date, day, state) {
    var event = {
        "year": date.getFullYear(),
        "month": date.getMonth()+1,
        "day": day,
        "state": state
    };
    event_data["events"].push(event);
}

function update_event_json(day, month, year, state) {
    for(var i=0; i<event_data["events"].length; i++) {
        var event = event_data["events"][i];
        if(event["day"]===day &&
            event["month"]===month &&
            event["year"]===year) {
                event_data["events"][i]["state"]=state;
            }
    }
}

// Checks if a specific date has any events
function check_events(day, month, year) {
    var events = [];
    for(var i=0; i<event_data["events"].length; i++) {
        var event = event_data["events"][i];
        if(event["day"]===day &&
            event["month"]===month &&
            event["year"]===year) {
                events.push(event);
            }
    }
    return events;
}

// Given data for events in JSON format
var event_data = {
    "events": [
    ]
};

const months = [ 
    "January", 
    "February", 
    "March", 
    "April", 
    "May", 
    "June", 
    "July", 
    "August", 
    "September", 
    "October", 
    "November", 
    "December" 
];

})(jQuery);
