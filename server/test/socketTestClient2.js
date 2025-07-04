const { io } = require("socket.io-client");

const socket = io("http://localhost:8080", {
  auth: {
    token: "eyJraWQiOiJKUnJJVTIra1pGNERDU3MxcUowOVhxbnNPUHRibzVMYmZvR21FRVNJM3lJPSIsImFsZyI6IlJTMjU2In0.eyJhdF9oYXNoIjoiV2F1VlJfSXVBT2RDUlJxYWZQWUMxdyIsInN1YiI6IjUxM2JiNWMwLTMwZDEtNzBjMS01ODkzLWUzZTcwZGZjMmVkMCIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0yLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMl9nQlhBVk1YVUsiLCJjb2duaXRvOnVzZXJuYW1lIjoiNTEzYmI1YzAtMzBkMS03MGMxLTU4OTMtZTNlNzBkZmMyZWQwIiwiZ2l2ZW5fbmFtZSI6Iktlbm5ldGgiLCJhdWQiOiIzbTl1dHRwODJnZ2Y4Z3U2MmxtMTJlYTdqNiIsImV2ZW50X2lkIjoiYjEzNjVhOWQtYWYzYS00YTkyLTk5ZDQtNTJjYWRjM2VjYmZmIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE3NTE1ODc3NTMsImV4cCI6MTc1MTU5MTM1MywiaWF0IjoxNzUxNTg3NzUzLCJmYW1pbHlfbmFtZSI6IlpoYW5nIiwianRpIjoiYzZmMGI3YWYtOWVjZC00YjRjLWJlYjUtMzE3OWRjNGE0Y2E4IiwiZW1haWwiOiJ6anJrZW5AdW1pY2guZWR1In0.Px2_bbKDbtMJFetqS-QdDAWvUNnxbP5mlAucdKkignRQOwq-eKg2s-mNQ_oZf9_5h5RbDaNRmmvM_Zb_8ZLV25HA8ocQCusNl91LLmAm1keXr3HITSh276-CV3McA_1n8cEG3Sfbdgj5OP9EkfxPDL4xrFx-L1oXTYaKScyroafyqlVtGt3b0TiyFZSKlbn-IVYJnXfFC-02D3F-PCRDaZUFZmC1ZZRuO6EmKjK-3GjhvQuGqCvUQAISCjzzJr1s1FPYLP1P-dPZqbdXlsFSfYolVKSNhun2DgRqYDSc592ynOyFTrB1FcWbE_X28EdLELUOQ69tGvEwUCitYT29Xw"
  }
});

socket.on("connect", () => {
  console.log("Client 2 connected:", socket.id);
});

socket.on("receive_message", (message) => {
  console.log("Client 2 received:", message);
});

socket.on("connect_error", (err) => {
  console.error("Connection error:", err.message);
});
