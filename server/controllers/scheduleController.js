const db = require("../db/pool");

async function getSchedule(req, res) {
  console.log('scheduleController: getSchedule called');
  // TODO: Implement logic to get provider schedule
  res.status(200).json({ message: "getSchedule endpoint hit" });
}

async function updateSchedule(req, res) {
  console.log('scheduleController: updateSchedule called');
  // TODO: Implement logic to update provider schedule
  res.status(200).json({ message: "updateSchedule endpoint hit" });
}

module.exports = {
  getSchedule,
  updateSchedule,
};