const parseUtils = require("../utils/parseUtils");

test("sortUUIDS", async () => {
  const uuid1 = "94da3e74-13d1-4b89-b11a-f6934735596e";
  const uuid2 = "c86a2a1c-7773-4a87-a502-981696ade062";
  const uuid3 = "1dee36aa-4168-4127-bde6-a531e1952a06";
  const uuids = [uuid1, uuid2, uuid3];
  const sortedUUIDs = uuids.sort(parseUtils.compareUUIDs("ASC"));
  expect(sortedUUIDs).toEqual([
    "1dee36aa-4168-4127-bde6-a531e1952a06",
    "94da3e74-13d1-4b89-b11a-f6934735596e",
    "c86a2a1c-7773-4a87-a502-981696ade062",
  ]);
});

