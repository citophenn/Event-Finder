const express = require('express');
const app = new express();
 
app.use(express.static('client')); // for HTML, CSS, Images
app.use(express.json());

const fs = require('fs');

let eventsJSON = require("./events.json")
let venuesJSON = require("./venues.json");
const { log } = require('console');
const { compose } = require('stream');
const { text, json } = require('stream/consumers');

// returns all events
app.get('/events', function(req, resp){
    resp.send(JSON.stringify(eventsJSON))
})

// returns event selected by client 
app.get('/events/upcomingevents', function(req, resp){
    const eventID = req.query.eventID
    const selected_event = eventsJSON[parseInt(eventID)-1]
    
    stringify_event = JSON.stringify(selected_event)
    console.log(stringify_event)
    resp.send(stringify_event)
})

app.get('/events/eventID', function(req, resp){
    const event_name = req.query.event_name
    console.log(`Event name is: ${event_name}`)
    eventsJSON.forEach(e => {
        if (e.name == event_name) {
            resp.send(e.id)
        }
    })
})

// returns a specific venue that client requests
app.get('/allvenues/venue', function(req, resp){
    const venueID = req.query.venueID
    const venue = venuesJSON[parseInt(venueID)-1]

    stringify_venue = JSON.stringify(venue)
    resp.send(stringify_venue)
})

app.get('/allvenues/venue/venueID', function(req, resp){
    const venueName = req.query.venue_name
    let found = false;
    
    venuesJSON.forEach(venue => {
        if (venue.name == venueName){
            resp.send(venue.id)
            found = true
        }
    })

    if (!found){
        resp.status(400).json({
            message: "Venue doesn't exist."
        })
    }    
})

// returns all venues
app.get('/allvenues', function(req, resp){
    resp.send(JSON.stringify(venuesJSON))
})

// Creating a new venue
app.post('/venue/new', function(req, resp){
    let newVenue = {}
    
    const newVenueID = venuesJSON[venuesJSON.length-1].id + 1
    const newVenueJSON = req.body

    newVenue.id = newVenueID
    newVenue.name = newVenueJSON.name
    newVenue.address = newVenueJSON.address

    if (newVenueJSON.name == null || newVenueJSON.address == null){
        resp.status(400).json({
            message : "Invalid input"
        })
    }

    venuesJSON.push(newVenue)
    fs.writeFileSync('./venues.json', JSON.stringify(venuesJSON))

    resp.send(JSON.stringify(
        {
            venue: newVenue,
            message: "Your venue has been added!"
        }
    ))
})

app.post('/event/new', function(req, resp){
    let newEvent = {}
    console.log(req.body)

    const newEventID = eventsJSON[eventsJSON.length - 1].id + 1

    const newEventJSON = req.body

    const eventDate = new Date(newEventJSON.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (eventDate < today) {
        return resp.status(400).json({
            message: "Event date must be today or in the future"
        });
    }

    // returns venueID of corresponding venue

    newEvent.id = newEventID
    newEvent.name = newEventJSON.name
    newEvent.date = newEventJSON.date
    newEvent.description = newEventJSON.description
    newEvent.venueId = newEventJSON.venueID
    newEvent.comments = []

    eventsJSON.push(newEvent)
    fs.writeFileSync('./events.json', JSON.stringify(eventsJSON));
    console.log("New Event: " + JSON.stringify(newEvent))

    let responsetext = JSON.stringify({
        newevent: newEvent,
        message: `Your event ${newEvent.name} has been added to the Events List!`
    })
    resp.send(responsetext)
})

app.post('/events/upcomingevents/comments', function(req, resp){
    const comment_info = req.body
    console.log(comment_info)
    eventsJSON.forEach(e => {
        if (e.id == comment_info.eventId){
            e.comments.push({
                name : comment_info.name,
                text : comment_info.text
            })
        }
    })

    fs.writeFileSync('./events.json', JSON.stringify(eventsJSON));
    let responsetext = JSON.stringify({
        comment_info: comment_info,
        message: `Comment has been posted!`
    })
    resp.send(responsetext)
})

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;