async function getCalendlyEvents(req, res) {
    console.log("Received Calendly webhook event");
    const { event, payload } = req.body;
    console.log(`Calendly Webhook: ${event}`);
    if (event === "invitee.created") {
        const doctorURI = payload.scheduled_event.event_memberships[0].user;
        const invitee = payload.invitee;
        const time = payload.event.start_time;
        console.log("New Appointment:");
        console.log("Doctor:", doctorURI);
        console.log("Invitee:", invitee.name, invitee.email);
        console.log("Time:", time);
    }
    if (event === "invitee.canceled") {
        const doctorURI = payload.scheduled_event.event_memberships[0].user;
        const invitee = payload.invitee;
        console.log("Appointment Canceled:");
        console.log("Doctor:", doctorURI);
        console.log("Invitee:", invitee.name, invitee.email);
    }
    res.sendStatus(200);
}

module.exports = {getCalendlyEvents};
