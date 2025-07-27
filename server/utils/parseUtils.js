const { parse } = require("uuid-parse");
const { Buffer } = require("node:buffer");

//UUID string to Buffer from component bytes
function uuidToBytes(uuid) {
  return Buffer.from(parse(uuid));
}

// Comparator function by byte value
function compareUUIDs(order = "ASC") {
  return function (uuid1, uuid2) {
    const bytes1 = uuidToBytes(uuid1);
    const bytes2 = uuidToBytes(uuid2);

    for (let i = 0; i < bytes1.length; i++) {
      if (bytes1[i] != bytes2[i]) {
        if (order == "ASC") {
          return bytes1[i] - bytes2[i];
        } else if (order == "DESC") {
          return bytes2[i] - bytes1[i];
        } else {
          throw new Error("Invalid uuid comparison order");
        }
      }
    }

    return 0;
  };
}

module.exports = { compareUUIDs, uuidToBytes };
