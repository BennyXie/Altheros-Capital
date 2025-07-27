jest.mock("../middleware/verifyToken", () => {
  return jest.fn((req, res, next) => next());
});

const request = require("supertest");
const app = require("../index");

describe("POST", () => {
  //   test("should return 200 OK", async () => {
  //     const response = await request(app)
  //       .post("/chat/")
  //       .send({ participants: ["2b4465d8-10b9-46db-b0b3-53cdefadec04"] });

  //     expect(response.statusCode).toBe(200);
  //   });

  test("create chat", async () => {
    const response = await request(app)
      .post("/chat/")
      .send({ participants: ["2b4465d8-10b9-46db-b0b3-53cdefadec04"] });
    console.log(response.body);
    expect(response.statusCode).toBe(200);
  });
});

// describe("GET", async () => {
//   test("should return 200 OK", async () => {
//     const response = await request(app)
//       .get("/chat/2b4465d8-10b9-46db-b0b3-53cdefadec04");

//     expect(response.statusCode).toBe(200);
//   });
// });
