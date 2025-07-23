const express = require("express");
const router = express.Router();
const pool = require("../db/pool");
const { v4: uuidv4 } = require("uuid");

// Middleware to parse JSON bodies
router.use(express.json());

// Generic webhook endpoint
router.post("/", async (req, res) => {
  try {
    const { body, headers } = req;
    
    // Log webhook data for debugging
    console.log("Webhook received:", {
      headers: headers,
      body: body,
      timestamp: new Date().toISOString()
    });

    // Extract webhook signature if present
    const signature = headers['x-webhook-signature'] || headers['x-hub-signature-256'] || headers['authorization'];
    
    // TODO: Add signature verification logic here
    // if (signature) {
    //   // Verify webhook signature
    //   const isValid = verifyWebhookSignature(body, signature, process.env.WEBHOOK_SECRET);
    //   if (!isValid) {
    //     return res.status(401).json({ error: "Invalid webhook signature" });
    //   }
    // }

    // Process webhook based on type
    const webhookType = body.triggerEvent;
    
    switch (webhookType) {
      case 'BOOKING_CREATED':
        await handleBookingCreated(body);
        break;
      case 'BOOKING_CANCELLED':
        await handleBookingCancelled(body);
        break;
      case 'BOOKING_RESCHEDULED':
        await handleBookingRescheduled(body);
        break;
      default:
        console.log(`Unhandled webhook type: ${webhookType}`);
    }

    // Respond with success
    res.status(200).json({ 
      success: true, 
      message: "Webhook processed successfully",
      webhookType: webhookType 
    });

  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).json({ 
      error: "Internal server error",
      message: error.message 
    });
  }
});

// Specific webhook endpoints for different services
// router.post("/cal", async (req, res) => {
//   try {
//     console.log("Cal.com webhook received:", req.body);
    
//     // Handle Cal.com specific webhook logic
//     const { eventType, data } = req.body;
    
//     switch (eventType) {
//       case 'BOOKING_CREATED':
//         await handleCalBookingCreated(data);
//         break;
//       case 'BOOKING_CANCELLED':
//         await handleCalBookingCancelled(data);
//         break;
//       default:
//         console.log(`Unhandled Cal.com event: ${eventType}`);
//     }
    
//     res.status(200).json({ success: true });
//   } catch (error) {
//     console.error("Cal.com webhook error:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// Utility function to extract a single attendee email from webhook data
function getAttendeeEmail(data) {
  if (data && data.payload && Array.isArray(data.payload.attendees)) {
    if (data.payload.attendees.length === 1) {
      return data.payload.attendees[0].email;
    } else if (data.payload.attendees.length > 1) {
      throw new Error('More than one attendee found. Only one attendee is supported.');
    }
  }
  return null;
}

// Webhook handler functions
async function handleBookingCreated(data) {
  // console.log("Processing booking created:", data);
  console.log("Processing booking created");
  let client;
  try {
    const attendeeEmail = getAttendeeEmail(data);
    const providerEmail = data.payload?.organizer?.email;
    const appointmentStart = data.payload?.startTime;
    const appointmentEnd = data.payload?.endTime;
    let notes = data.payload?.additionalNotes || null;
    if (notes) {
      notes = `Creation notes: ${notes}`;
    }
    const status = data.payload?.status || 'scheduled';
    const now = new Date().toISOString();

    if (!attendeeEmail || !providerEmail || !appointmentStart || !appointmentEnd) {
      throw new Error("Missing required appointment data");
    }

    client = await pool.connect();

    // Look up patient_id by attendee email
    const patientResult = await client.query(
      'SELECT id FROM patients WHERE email = $1',
      [attendeeEmail]
    );
    if (patientResult.rows.length === 0) {
      throw new Error(`No patient found for email: ${attendeeEmail}`);
    }
    const patientId = patientResult.rows[0].id;

    // Look up provider_id by provider email
    const providerResult = await client.query(
      'SELECT id FROM providers WHERE email = $1',
      [providerEmail]
    );
    if (providerResult.rows.length === 0) {
      throw new Error(`No provider found for email: ${providerEmail}`);
    }
    const providerId = providerResult.rows[0].id;

    // Extract uid from the webhook payload
    const icalUid = data.payload?.uid;

    // Insert appointment
    const appointmentId = uuidv4();
    await client.query(
      `INSERT INTO appointments (
        appointment_id, patient_id, provider_id, appointment_start, appointment_end, status, notes, created_at, updated_at, ical_uid
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        appointmentId,
        patientId,
        providerId,
        appointmentStart,
        appointmentEnd,
        status,
        notes,
        now,
        now,
        icalUid
      ]
    );
    console.log(`Appointment ${appointmentId} created for patient ${patientId} and provider ${providerId}`);

    // DB check: confirm appointment exists
    const checkResult = await client.query(
      'SELECT * FROM appointments WHERE appointment_id = $1',
      [appointmentId]
    );
    if (checkResult.rows.length > 0) {
      console.log('DB check: Appointment successfully inserted:', checkResult.rows[0]);
    } else {
      console.error('DB check: Appointment NOT found after insert!');
    }
  } catch (err) {
    console.error("Attendee extraction or DB error:", err.message);
    return;
  } finally {
    if (client) client.release();
  }
}

async function handleBookingCancelled(data) {
  console.log("Processing booking cancelled");
  let client;
  try {
    const icalUid = data.payload?.uid;
    if (!icalUid) {
      throw new Error("Missing iCalUID in payload");
    }
    client = await pool.connect();
    // Extract cancellation reason if present
    const cancellationReason = data.payload?.cancellationReason || null;
    let notesUpdateSql = '';
    let notesUpdateParams = [];
    if (cancellationReason) {
      notesUpdateSql = ', notes = COALESCE(notes, \'\') || $4';
      notesUpdateParams = [`\nCancellation reason: ${cancellationReason}`];
    }
    // Update the appointment status to 'cancelled' and append cancellation reason to notes if present
    const result = await client.query(
      `UPDATE appointments SET status = $1, updated_at = $2${notesUpdateSql} WHERE ical_uid = $3 RETURNING *`,
      ['cancelled', new Date().toISOString(), icalUid, ...notesUpdateParams]
    );
    if (result.rows.length > 0) {
      console.log("Appointment cancelled:", result.rows[0]);
    } else {
      console.error("No appointment found with iCalUID:", icalUid);
    }
    // DB check: confirm appointment status
    const checkResult = await client.query(
      'SELECT * FROM appointments WHERE ical_uid = $1',
      [icalUid]
    );
    if (checkResult.rows.length > 0) {
      console.log('DB check: Appointment after cancellation:', checkResult.rows[0]);
    } else {
      console.error('DB check: Appointment NOT found after cancellation!');
    }
  } catch (err) {
    console.error("Error cancelling appointment:", err.message);
  } finally {
    if (client) client.release();
  }
}

async function handleBookingRescheduled(data) {
  console.log("Processing booking rescheduled");
  let client;
  try {
    const rescheduleUid = data.payload?.rescheduleUid;
    const newUid = data.payload?.uid;
    const newStart = data.payload?.startTime;
    const newEnd = data.payload?.endTime;
    const rescheduleReason = data.payload?.rescheduleReason || null;
    if (!rescheduleUid || !newUid || !newStart || !newEnd) {
      throw new Error("Missing required reschedule data");
    }
    client = await pool.connect();
    let notesUpdateSql = '';
    let notesUpdateParams = [];
    if (rescheduleReason) {
      notesUpdateSql = ', notes = COALESCE(notes, \'\') || $6';
      notesUpdateParams = [`\nReschedule reason: ${rescheduleReason}`];
    }
    // Update the appointment's start/end, status, notes, and set ical_uid to the new uid
    const result = await client.query(
      `UPDATE appointments SET appointment_start = $1, appointment_end = $2, status = $3, updated_at = $4, ical_uid = $5${notesUpdateSql} WHERE ical_uid = $6 RETURNING *`,
      [newStart, newEnd, 'rescheduled', new Date().toISOString(), newUid, rescheduleUid, ...notesUpdateParams]
    );
    if (result.rows.length > 0) {
      console.log("Appointment rescheduled:", result.rows[0]);
    } else {
      console.error("No appointment found with rescheduleUid:", rescheduleUid);
    }
    // DB check: confirm appointment status
    const checkResult = await client.query(
      'SELECT * FROM appointments WHERE ical_uid = $1',
      [newUid]
    );
    if (checkResult.rows.length > 0) {
      console.log('DB check: Appointment after reschedule:', checkResult.rows[0]);
    } else {
      console.error('DB check: Appointment NOT found after reschedule!');
    }
  } catch (err) {
    console.error("Error rescheduling appointment:", err.message);
  } finally {
    if (client) client.release();
  }
}

// Health check endpoint for webhooks
router.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    message: "Webhook service is running" 
  });
});

module.exports = router; 