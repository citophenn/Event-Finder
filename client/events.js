const dateInput = document.getElementById("event-date-input")
const today = new Date().toISOString().split("T")[0];
dateInput.min = today;

// loading all events on homepage
async function loadEvents()
{
    try 
    {
        const eventsList = document.getElementById("event-list")
        var response = await fetch('http://localhost:8080/events')
        var body = await response.text()
        var bodyJSON = JSON.parse(body)

        bodyJSON.forEach(element => {     
            const col = document.createElement("div")
            col.className = "col-12 col-md-6 col-lg-4"

            const card = document.createElement("div")
            card.className = "event-card"
            card.dataset.eventID = element.id

            const cardbody = document.createElement("div")
            const cardtitle = document.createElement("h5")
            cardtitle.innerHTML = `${element.name}`
            const cardDate = document.createElement("h6")
            cardDate.innerHTML = `${element.date}`
            const cardText = document.createElement("p")
            cardText.innerHTML = "Click to view details"

            cardbody.appendChild(cardtitle)
            cardbody.appendChild(cardDate)
            cardbody.appendChild(cardText)
            card.appendChild(cardbody)
            col.appendChild(card)
            eventsList.appendChild(col)
        });

        ShowUpcomingEvents()

    } catch (error){
        console.log(error)
    }
}

loadEvents()

// status messages
function showStatus(message, type) {
  const status = document.getElementById("status-message");
  status.textContent = message;
  status.className = `alert alert-${type}`;
  status.classList.remove("d-none");
  HideStatus()
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function HideStatus(){
    await sleep(3500)
    const status = document.getElementById("status-message");
    status.classList.add("d-none")
}

// checking for clicks near list of events
async function addEventListeners(){
    document
    .getElementById("event-list")
    .addEventListener("click", handleEventClick);

    function handleEventClick(e) {
    const item = e.target.closest(".event-card");

    if (!item) return;

    const eventId = item.dataset.eventID;
    loadEventDetails(eventId);
    }
}

addEventListeners()

// Handles the event of clicking "Add new event"
const new_event = document.getElementById("add-event-view")
new_event.addEventListener("submit", async function submitForm(event){
    try {
        event.preventDefault()

        const name = document.getElementById("event-name-input").value.trim()
        const date = document.getElementById("event-date-input").value
        const description = document.getElementById("event-description-input").value
        const venue =  document.getElementById("event-venue-select").value

        const selectedDate = new Date(date);
        const now = new Date();
        now.setHours(0,0,0,0); 

        if (selectedDate < now) {
            showStatus("Event date cannot be in the past", "danger");
            return;
        }

        const url = "http://localhost:8080/allvenues/venue/venueID?venue_name=" + venue
        const respVenueID = await fetch(url)
        const respVenueIDtext = await respVenueID.text()
        const venueID = parseInt(respVenueIDtext)

        console.log("VenueID: " + venueID)

        const response = await fetch('http://localhost:8080/event/new', 
            {
                method: "POST",
                headers: {
                    // Make sure that the request indicates it is a JSON file
                    "Content-type" : "application/json"
                },
                body: JSON.stringify({
                    name : name,
                    date : date,
                    description : description,
                    // will need to get ID of venue from name
                    venueID : venueID
                })
            });
        
        if(response.ok){
            const responseBody = await response.text();
            console.log("response from POST: ", responseBody)
            showStatus("Event added successfully. Refresh the page to see your event!", "success");

            // just have to figure out how to reload page
            document.getElementById("add-event-form").reset()
        }
        else{
            showStatus('Problem with POST request: ' + response.body.message, "danger")
        }
    }
    catch (e) {
        console.log(e)
        showStatus(e, "danger");
    }
})

const comment = document.getElementById("comment-form")
comment.addEventListener("submit", async function submitComment(event){
    try{
        event.preventDefault()

        const comment_name = document.getElementById("comment-author").value
        const comment_text = document.getElementById("comment-text").value
        const event_name = document.getElementById("event-name").innerHTML
        console.log(`Name of event to fetch: ${event_name}`)
        const url = 'http://localhost:8080/events/eventID?event_name=' + event_name
        const IDresp = await fetch(url)
        const eventID = await IDresp.text()

        console.log(`Event ID is ${parseInt(eventID)}`)

        const response = await fetch('http://localhost:8080/events/upcomingevents/comments',
            {
                method: "POST",
                headers:{
                    "Content-type" : "application/json"
                },
                body: JSON.stringify({
                    eventId : parseInt(eventID),
                    name : comment_name,
                    text : comment_text
                })
        })

        // Add status message to say message has been added
        if(response.ok){
            const responseBody = await response.text();
            console.log("response from POST: ", responseBody)
            showStatus("Comment added successfully. Refresh the page to see your comment!", "success");

            // Add status message
            document.getElementById("comment-form").reset()
        }
        else{
            showStatus('Problem with POST request ' + response.statusText, "danger")
        }
    } catch (e) {
        console.log(e)
        showStatus(e, "danger");
    }
})

const newVenue = document.getElementById("add-venue-view")
newVenue.addEventListener("submit", async function submitForm(event) {
    try {
        event.preventDefault()

    const venue_name = document.getElementById("venue-name-input").value.trim()
    const venue_address = document.getElementById("venue-address-input").value

    const response = await fetch("http://localhost:8080/venue/new", {
        method: "POST",
        headers: {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify({
            name: venue_name,
            address: venue_address
        })
    })
    if(response.ok){
            const responseBody = await response.text();
            console.log("response from POST: ", responseBody)
            showStatus("Venue added successfully. Refresh the page to see your venue!", "success");

            // just have to figure out how to reload page
            document.getElementById("add-venue-form").reset()
        }
        else{
            showStatus('Problem with POST request: ' + response.body.message, "danger")
        }
    } catch (e){
        console.log(e)
        showStatus(e, "danger");
    }
    
})

// loading event details when clicked
async function loadEventDetails(eventId){
    const urlEvent = 'http://localhost:8080/events/upcomingevents?eventID=' + eventId
    const response = await fetch(urlEvent)
    const event_resp = await response.text()
    const event_respJSON = JSON.parse(event_resp)
    const venueID = event_respJSON.venueId
    const urlVenue = 'http://localhost:8080/allvenues/venue?venueID=' + venueID
    const responseVenue = await fetch(urlVenue)
    const venue_resp = await responseVenue.text()
    const venue_respJSON = JSON.parse(venue_resp)


    const event_name = document.getElementById('event-name')
    event_name.innerHTML = event_respJSON.name
    const event_desc = document.getElementById('event-description')
    event_desc.innerHTML = event_respJSON.description
    const event_date = document.getElementById('event-date')
    event_date.innerHTML = event_respJSON.date
    const venue_name = document.getElementById('venue-name')
    venue_name.innerHTML = venue_respJSON.name
    const venue_address = document.getElementById('venue-address')
    venue_address.innerHTML = venue_respJSON.address

    const comments_list = document.getElementById("comment-list")
    comments_list.innerHTML = ""
    event_respJSON.comments.forEach(comment => {
        const fragment = document.createDocumentFragment();  
        const current_comment = fragment.appendChild(document.createElement("p"))
        current_comment.innerHTML = `${comment.name}: ${comment.text}`
        comments_list.appendChild(fragment)
    }) 
    DisplayEventSect()
    HideUpcomingEvents()
}

function HideUpcomingEvents(){
    document.getElementById("event-list-view").classList.add("d-none")
    const add_btn = document.getElementById("add-event-btn")
    add_btn.innerHTML = "Add event"
    HideAddEventSect()
}

function ShowUpcomingEvents(){
    document.getElementById("event-list-view").classList.remove("d-none")
}

// Hiding events section initially
function HideEventSect(){
    document.getElementById("detailed-event-view").classList.add("d-none");
}

HideEventSect()

function showAddVenueSection(){
    document.getElementById("add-venue-view").classList.remove("d-none")
}

function HideAddVenueSection(){
    document.getElementById("add-venue-view").classList.add("d-none")
}

HideAddVenueSection()

function AddVenueSectView(){
    const addVenueBtn = document.getElementById("add-venue-btn")
    const venueView = document.getElementById("add-venue-view")
    if (!venueView.classList.contains("d-none")){
        addVenueBtn.innerHTML = "+ Add Venue"
        HideAddVenueSection()
    } else {
        addVenueBtn.innerHTML = "Hide Add Venue"
        showAddVenueSection()
    }
}
// Displays event section 
function DisplayEventSect()
{
    document.getElementById("detailed-event-view").classList.remove("d-none");
}

// Hides add_event section initially
function HideAddEventSect(){
    document.getElementById("add-event-view").classList.add("d-none")
}

HideAddEventSect()

function showAddEventSection(){
    document.getElementById("add-event-view").classList.remove("d-none")
}

async function AddEventSectView(){
    const add_event = document.getElementById("add-event-view")
    const add_button = document.getElementById("add-event-btn")
    const dropdownVenue = document.getElementById("event-venue-select")
    dropdownVenue.innerHTML=""
    if (!add_event.classList.contains("d-none")){
        add_button.innerHTML = "+ Add Event"
        HideAddEventSect()
    } else {
        // load venues into dropdown list
        const response = await fetch('http://localhost:8080/allvenues')
        const venues = await response.text()
        const venuesJSON = JSON.parse(venues)
        console.log("Venues to choose: " + venuesJSON)

        // Adding "Select venue" option if no venue selected
        const frag = document.createDocumentFragment()
        const placeholder_venue = frag.appendChild(document.createElement("option"))
        placeholder_venue.value = ""
        placeholder_venue.innerHTML = "Select a venue"
        dropdownVenue.appendChild(frag)

        venuesJSON.forEach(venue => {
            const fragment = document.createDocumentFragment();  
            const curr_venue = fragment.appendChild(document.createElement("option"))
            curr_venue.value = venue.name
            curr_venue.innerHTML = venue.name
            dropdownVenue.appendChild(fragment)
        })

        add_button.innerHTML = "Hide Add Event"
        showAddEventSection()
    }
}
