const { io } = require("socket.io-client");

const socket = io("http://localhost:8080", {
  auth: {
    token: "eyJraWQiOiJKUnJJVTIra1pGNERDU3MxcUowOVhxbnNPUHRibzVMYmZvR21FRVNJM3lJPSIsImFsZyI6IlJTMjU2In0.eyJhdF9oYXNoIjoiMkwyOFVIZWtYWTh4UlR0ZUpZLXYtUSIsInN1YiI6IjMxN2JhNTMwLTIwNDEtNzAwNS05M2Y1LTY4ZmM1Nzg0M2VjZiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0yLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMl9nQlhBVk1YVUsiLCJjb2duaXRvOnVzZXJuYW1lIjoiMzE3YmE1MzAtMjA0MS03MDA1LTkzZjUtNjhmYzU3ODQzZWNmIiwiZ2l2ZW5fbmFtZSI6IlByYW5hdiIsImF1ZCI6IjNtOXV0dHA4MmdnZjhndTYybG0xMmVhN2o2IiwiZXZlbnRfaWQiOiJkZjg0MTJlYi1iOWVmLTQ4ZGMtOTEzNy1kZGU3ZDAzNDBjZGUiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTc1MTU4NzM2NSwiZXhwIjoxNzUxNTkwOTY1LCJpYXQiOjE3NTE1ODczNjUsImZhbWlseV9uYW1lIjoiU3ViYmlhaCIsImp0aSI6ImIxZjE4Njk2LWM2YjItNGJhYi04MWY2LTU3NGVhMDAxOGZiOCIsImVtYWlsIjoicHJhbmF2c3ViYmlhaEBnbWFpbC5jb20ifQ.QfWfuMolsf8z2bziM8jQS95a-FFn2xhP_HCzZKt6JWdSxhLRKtKxSo9_eivdp1zK06-0DQWELy6oHinZPzDaKhQgTtc_jLxg46aqMuB9oKY2U2BrUCRjfveE4qF4XSxpJdKWkNP9MoFB--rX9JZQ3yguwwTafk0BjSGHOpNYhT7LY0YpwbHeOmefIgMdaiPpecVAuOXFfUDqK-mE4_gkk-uI1RwOjIjTD4FtupiE1xxW8Nuyj2hpNgpWZjwh7pXYQCVpUsSJX7IwqfceKFRw3oZinhtEDAou8zJh9zl4ObTWYG3QnH3uhBamD7V_UsM3oWioONEZxCPxhPCivcGLJA"
  }
});

socket.on("connect", () => {
  console.log("Client 1 connected:", socket.id);

  // Simulate sending a message to User 2
  socket.emit("send_message", {
    recipientEmail: "zjrken@umich.edu", // email of other user
    text: "Pranav says Hello!",
    timestamp: new Date().toISOString()
  });
});

socket.on("receive_message", (message) => {
  console.log("Client 1 received:", message);
});

socket.on("connect_error", (err) => {
  console.error("Connection error:", err.message);
});
