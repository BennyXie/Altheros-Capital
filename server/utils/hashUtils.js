function getSecretHash(username, clientId, clientSecret) {
    return crypto
        .createHmac("SHA256", clientSecret)
        .update(username + clientId)
        .digest("base64");
}

module.exports = { getSecretHash };