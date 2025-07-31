const { text } = require("express");
const { io } = require("socket.io-client");

// Replace with your local backend address
const socket = io("http://localhost:8080", {
  auth: {
    token:
      "eyJraWQiOiJKUnJJVTIra1pGNERDU3MxcUowOVhxbnNPUHRibzVMYmZvR21FRVNJM3lJPSIsImFsZyI6IlJTMjU2In0.eyJhdF9oYXNoIjoiQVBmUjF0b2JSYzRJdEVRdnJMRzItdyIsInN1YiI6ImUxY2IyNTcwLTIwNzEtNzBkZS1kOTNiLWQ1OTQzOGVjY2M2ZSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0yLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMl9nQlhBVk1YVUsiLCJjb2duaXRvOnVzZXJuYW1lIjoiZTFjYjI1NzAtMjA3MS03MGRlLWQ5M2ItZDU5NDM4ZWNjYzZlIiwiZ2l2ZW5fbmFtZSI6Ild1IiwiYXVkIjoiM205dXR0cDgyZ2dmOGd1NjJsbTEyZWE3ajYiLCJldmVudF9pZCI6ImRkYzVhODk0LTVmMWEtNDFiYi04ZGYzLTg5NTg1YWI5Nzg3ZSIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNzUyNjA5NDI1LCJleHAiOjE3NTI2MTMwMjUsImlhdCI6MTc1MjYwOTQyNSwiZmFtaWx5X25hbWUiOiJMaWxseSIsImp0aSI6Ijg2OTU2YmQ2LTg2MDItNDAyZi05ODEwLTY4Njk2ODhjNzMxOSIsImVtYWlsIjoibGlsbHl3dTI0NjhAZ21haWwuY29tIn0.FtUY7RsK8rjpBftrWUjYw51o8DDiS4p_rdUIS0pNjInEVyWytusn_VblMlZ_Uw6SsTnE0OXyhmACeVs5K9q1BhodesLA8-MB4ybYG2uXK6Re7ChDHniCzg29k4_vg1ft7MjI6snD-_Iaj0Ppu0QCpJjZlp-OM-3TdCKArD7D_9f7amfMGBvXHOK56GFgmxHb5MhHW1fILD3ZgryTWJdpo0yr-NuGWIfltuJT1xg0W5Kh6gVJ66X6GyO3iSuZvN-7lu2dsNY8cfBKsmGk4ZEURMqQswFUPkhkEXnZt3ATcOsqxovnTAskN9ZPyI3U4HPbRYZ9kuD2Oukma12kZu2_uA",
  },
});

// Simulate join_chat
socket.emit("join_chat", {
  chatId: "room-A",
  timestamp: new Date().toISOString(),
});

// Listen for incoming messages
socket.on("receive_message", (msg) => {
  console.log("[User A received]", msg);
});

// Send message after 2 seconds
setTimeout(() => {
  socket.emit("send_message", {
    chatId: "room-A",
    text: "Hello from User A",
    textType: "text",
    senderType: "provider",
    senderId: "ded",
    timestamp: new Date().toISOString(),
  });
}, 2000);
