// ALL of it is ChatGPT. Prompt: Generate jest tests for app.js

const request = require('supertest');
const app = require('./app'); 

describe('Local Events API Tests', () => {

    test('GET /events succeeds', () => {
        return request(app)
            .get('/events')
            .expect(200);
    });

    test('GET /events returns JSON', () => {
        return request(app)
            .get('/events')
            .expect('Content-Type', /json/);
    });

    test('GET /events/upcomingevents with valid eventID', () => {
        return request(app)
            .get('/events/upcomingevents?eventID=1')
            .expect(200);
    });

    test('GET /events/eventID returns an ID', () => {
        return request(app)
            .get('/events/eventID?event_name=API Test Event')
            .expect(200);
    });

    test('GET /allvenues succeeds', () => {
        return request(app)
            .get('/allvenues')
            .expect(200);
    });

    test('GET /allvenues returns JSON', () => {
        return request(app)
            .get('/allvenues')
            .expect('Content-Type', /json/);
    });

    test('GET /allvenues/venue with venueID', () => {
        return request(app)
            .get('/allvenues/venue?venueID=1')
            .expect(200);
    });

    test('GET /allvenues/venue/venueID with venue_name', () => {
        return request(app)
            .get('/allvenues/venue/venueID?venue_name=Oakwood Community Hall')
            .expect(200);
    });

    test('POST /venue/new succeeds', () => {
        const venue = {
            name: "Test Venue",
            address: "123 Test Street"
        };

        return request(app)
            .post('/venue/new')
            .send(venue)
            .expect(200);
    });

    test('POST /event/new succeeds with future date', () => {
        const event = {
            name: "Test Event",
            date: "2099-01-01",
            description: "Test Description",
            venueID: 1
        };

        return request(app)
            .post('/event/new')
            .send(event)
            .expect(200);
    });

    test('POST /events/upcomingevents/comments succeeds', () => {
        const comment = {
            eventId: 1,
            name: "Tester",
            text: "This is a test comment"
        };

        return request(app)
            .post('/events/upcomingevents/comments')
            .send(comment)
            .expect(200);
    });

});
