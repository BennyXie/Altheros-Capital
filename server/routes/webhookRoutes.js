const express = require("express");
const router = express.Router();

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
  console.log("Processing booking created:", data);
  try {
    const attendeeEmail = getAttendeeEmail(data);
    console.log("Attendee email:", attendeeEmail);
  } catch (err) {
    console.error("Attendee extraction error:", err.message);
    return;
  }
  // TODO: Implement booking created logic
}

async function handleBookingCancelled(data) {
  console.log("Processing booking cancelled:", data);
  try {
    const attendeeEmail = getAttendeeEmail(data);
    console.log("Attendee email:", attendeeEmail);
  } catch (err) {
    console.error("Attendee extraction error:", err.message);
    return;
  }
  // TODO: Implement booking cancelled logic
}

async function handleBookingRescheduled(data) {
  console.log("Processing booking rescheduled:", data);
  try {
    const attendeeEmail = getAttendeeEmail(data);
    console.log("Attendee email:", attendeeEmail);
  } catch (err) {
    console.error("Attendee extraction error:", err.message);
    return;
  }
  // TODO: Implement booking rescheduled logic
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