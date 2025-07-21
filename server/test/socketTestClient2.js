const { io } = require("socket.io-client");

const socket = io("http://localhost:8080", {
  auth: {
    token:
      "eyJraWQiOiJKUnJJVTIra1pGNERDU3MxcUowOVhxbnNPUHRibzVMYmZvR21FRVNJM3lJPSIsImFsZyI6IlJTMjU2In0.eyJhdF9oYXNoIjoiclNtLXNQQ1BaazZsZ1RObTQwVUlfQSIsInN1YiI6ImUxY2IyNTcwLTIwNzEtNzBkZS1kOTNiLWQ1OTQzOGVjY2M2ZSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0yLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMl9nQlhBVk1YVUsiLCJjb2duaXRvOnVzZXJuYW1lIjoiZTFjYjI1NzAtMjA3MS03MGRlLWQ5M2ItZDU5NDM4ZWNjYzZlIiwiZ2l2ZW5fbmFtZSI6Ild1IiwiYXVkIjoiM205dXR0cDgyZ2dmOGd1NjJsbTEyZWE3ajYiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTc1MjYwOTQ4OSwiZXhwIjoxNzUyNjEzMDg5LCJpYXQiOjE3NTI2MDk0ODksImZhbWlseV9uYW1lIjoiTGlsbHkiLCJqdGkiOiI0NDZiMGVjOS0xMTAzLTQzNmItYjVmNy0zNjIyZjY1ZTA1MmYiLCJlbWFpbCI6ImxpbGx5d3UyNDY4QGdtYWlsLmNvbSJ9.XIsCkW6mdGjZax-5QxgjgrVK7gI6_0cZ8dOr7tJo3Gd-mXYGvGpDl4k9sSrDOrmVRcffVy4IQwO002ouLJsfZIhlTaBeMrxNV4KTjbPI38QOwArlzroHw5aJjjwmaUfrRWACaHdH0zxnO9RZaXNmvU-gWpT69wwlxTPmYj-WA7CkLlhHcNNtVA_0Y7oYCikdR0vU9VZ2m8TZmVUxh0Eof3Q8sz67kxqLCsJ6b-Z7THlyOatRfQwmgk07-F1bXzw_zn5L7JOPA6SeYIi0OD2Mrw-cyMdDZDv_Uf-PuIs66xCoTQ0C4ypfqo9SnS6vvVEdc3rSAnHK10ppM_8tuys7mw",
  },
});

socket.emit("join_chat", {
  chatId: "room-A",
  timestamp: new Date().toISOString(),
});

socket.on("receive_message", (msg) => {
  console.log("[User B received]", msg);
});
