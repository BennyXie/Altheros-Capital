function formatMessage(sender, text, timestamp) {
  return {
    sender,
    text,
    timestamp,
  };
}

module.exports = { formatMessage };
