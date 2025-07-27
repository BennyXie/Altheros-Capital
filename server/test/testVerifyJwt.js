const verifyJwt = require("../utils/verifyJwt");
const authController = require("../controllers/authController");

const token =
  "eyJraWQiOiJKUnJJVTIra1pGNERDU3MxcUowOVhxbnNPUHRibzVMYmZvR21FRVNJM3lJPSIsImFsZyI6IlJTMjU2In0.eyJhdF9oYXNoIjoiUDlvako2TUZLS2hSMV9DRzVWVVY3ZyIsInN1YiI6ImUxY2IyNTcwLTIwNzEtNzBkZS1kOTNiLWQ1OTQzOGVjY2M2ZSIsImNvZ25pdG86Z3JvdXBzIjpbInBhdGllbnRzIl0sImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0yLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMl9nQlhBVk1YVUsiLCJjb2duaXRvOnVzZXJuYW1lIjoiZTFjYjI1NzAtMjA3MS03MGRlLWQ5M2ItZDU5NDM4ZWNjYzZlIiwiZ2l2ZW5fbmFtZSI6Ild1IiwiYXVkIjoiM205dXR0cDgyZ2dmOGd1NjJsbTEyZWE3ajYiLCJldmVudF9pZCI6IjE0NTE2ZDI2LTgzZTktNDIzMi1hM2Y4LWNmM2FiOTRiOWQyNSIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNzUzMzk1MDEwLCJleHAiOjE3NTMzOTg2MTAsImlhdCI6MTc1MzM5NTAxMCwiZmFtaWx5X25hbWUiOiJMaWxseSIsImp0aSI6Ijg5NTNiZmFhLWI3N2YtNDNjNy1iNDBiLWRhZmNkOTQ3YzFjZCIsImVtYWlsIjoibGlsbHl3dTI0NjhAZ21haWwuY29tIn0.j_Nyufyx-xLVeUnBSYXspEF-bDGAW7FGxzWdNAIsLq9qKQ7HM7Nd7fkDtCGlTKBPEvm2AFIL7g96jN7zsj8UfVzbvqrEzq7P3OVpJPSpkyGV-K1rZQlZWVetDByK6NqlatGMIGozlbdZKnNTRbR5hF9_YdJazDo_iamDd9TtCqINyaRSRm9ascn6DO88fiEpU_yb_eicGDhnZpj_4uHtIzyzPrA1p_q6eLne5kKk5Nd-1iekrBjtKupy3i6vop7bt56ohVVrskBhLsQ7eKQ8nKEuu7Gu2Z3mndkfh44QJxkaL2AjeMCyC_O2D7xaZ2HTZnR7qUVR9DNos0s12BSS_Q";

verifyJwt(token)
  .then((decoded) => {
    console.log("Token verified successfully!");
    console.log("Decoded payload:", decoded);
    fetch("http://localhost:8080/chat", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        participants: ["2b4465d8-10b9-46db-b0b3-53cdefadec04"],
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // parse JSON body
      })
      .then((data) => {
        console.log("Data from backend:", data);
        // You can now use data.message, data.items, etc.
      });
  })
  .catch((err) => {
    console.error("Token verification failed:", err.message);
  });
