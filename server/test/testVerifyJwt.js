const verifyJwt = require("../utils/verifyJwt");
const authController = require("../controllers/authController");

const token =
  "eyJraWQiOiJKUnJJVTIra1pGNERDU3MxcUowOVhxbnNPUHRibzVMYmZvR21FRVNJM3lJPSIsImFsZyI6IlJTMjU2In0.eyJhdF9oYXNoIjoibWxsVjl0dWxQS2JGaldZcVlqVlAwZyIsInN1YiI6ImUxY2IyNTcwLTIwNzEtNzBkZS1kOTNiLWQ1OTQzOGVjY2M2ZSIsImNvZ25pdG86Z3JvdXBzIjpbInBhdGllbnRzIl0sImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0yLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMl9nQlhBVk1YVUsiLCJjb2duaXRvOnVzZXJuYW1lIjoiZTFjYjI1NzAtMjA3MS03MGRlLWQ5M2ItZDU5NDM4ZWNjYzZlIiwiZ2l2ZW5fbmFtZSI6Ild1IiwiYXVkIjoiM205dXR0cDgyZ2dmOGd1NjJsbTEyZWE3ajYiLCJldmVudF9pZCI6IjJlNWY0MjFhLTg1ZWQtNDQ5ZC04YzEzLWI0ZjgyNDI3MzBjZiIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNzUzMjAzNDMzLCJleHAiOjE3NTMyMDcwMzMsImlhdCI6MTc1MzIwMzQzMywiZmFtaWx5X25hbWUiOiJMaWxseSIsImp0aSI6IjY4MTFmN2QzLTZkMWQtNGZjZC1iY2UyLWEyYmY3NGE0M2IzNiIsImVtYWlsIjoibGlsbHl3dTI0NjhAZ21haWwuY29tIn0.f3RiCIkdz4OeNWS2-hjEsws-2Ys0hQpVr6RahsDMQCrMiopy4OwAvsRT2V2n0UfFpW9b87JpprC6hi4JztHQ5SJ6XZyJJMTwNsOg_bZajLY6vjQzFxhdWhVX9_XJLZDC8rDykAODWCkG67nnXWvuz5jy1BZ8uyc-rw6hinTD2fdqlbjwreLLlcs4FSOny1YG_in7mQmD8p6Z0f2oVNvmp5Cnv29r-3DgxxyqS2MrOJPBiCz1D7Fzk1NQUzDo5xO8NMz_pdU8sj9BS8BIPjJEfr95usOXKDvHpWGASjYzxy_XAUAbt5xhhtDJ3vHriVS4qnT0Gh9LLzwrtVfX-6MJFA";

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
