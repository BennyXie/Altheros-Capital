const verifyJwt = require("../utils/verifyJwt");
const authController = require("../controllers/authController");

const token =
  "eyJraWQiOiJKUnJJVTIra1pGNERDU3MxcUowOVhxbnNPUHRibzVMYmZvR21FRVNJM3lJPSIsImFsZyI6IlJTMjU2In0.eyJhdF9oYXNoIjoiUC1QSndXT1N1bnI1U3lQT3NGZEpMZyIsInN1YiI6ImUxY2IyNTcwLTIwNzEtNzBkZS1kOTNiLWQ1OTQzOGVjY2M2ZSIsImNvZ25pdG86Z3JvdXBzIjpbInBhdGllbnRzIl0sImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0yLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMl9nQlhBVk1YVUsiLCJjb2duaXRvOnVzZXJuYW1lIjoiZTFjYjI1NzAtMjA3MS03MGRlLWQ5M2ItZDU5NDM4ZWNjYzZlIiwiZ2l2ZW5fbmFtZSI6Ild1IiwiYXVkIjoiM205dXR0cDgyZ2dmOGd1NjJsbTEyZWE3ajYiLCJldmVudF9pZCI6IjhkNDg5ZGU4LTViODAtNGQyMi1hZDQ0LWMyYTg1N2M3ZGQxZCIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNzUzMDY5NjU3LCJleHAiOjE3NTMwNzMyNTcsImlhdCI6MTc1MzA2OTY1NywiZmFtaWx5X25hbWUiOiJMaWxseSIsImp0aSI6ImQxMDNhYzZlLWE3NWUtNDMxZC1iODllLTZlNTNhMjJhMzc2MCIsImVtYWlsIjoibGlsbHl3dTI0NjhAZ21haWwuY29tIn0.mkqXoQbRSwSRyawU-JicQ0JsSKLngRaLKzhOYykGNcuVPX1Ey5bATFlx9QqJleZeOAZM8mRSUlogv9aLCOy7kECmJKwqb-iBx1UvAT8D6UkSqBgTjTiaHCg28hPrAMEUOsRg4jz6dBfHGDYXXFT0UK20l2-DfdZPT8mmHvM8aefIs73dShTzGPsA4V55mFKxDo0uHI4XuYO9FddLzV8wlwzOK3ese-Qh69I6fQbt1fDF5mZtU0jpFnY5_lLwPXFUJuqpTbMCsc_mcR2GKWgJSZO81n4GF4-f_dayVhUJ12SPgpG_1ugZNcKpYPvVCpCpi4gP5rQttYzYCyuGAip06Q";

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
