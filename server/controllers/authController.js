const pool = require("../db/pool");
const { signUpUser } = require("../services/cognitoService");
const db = require("../db/pool")
const bcrypt = require('bcrypt');
const saltRounds = 10;
//For password verify, we need to run const isMatch = await bcrypt.compare(plainPassword, hashedPassword).


async function testCognito(req, res) {
  try {
    const response = await signUpUser({
      username: "test@example.com",
      password: "TestPass123!",
      givenName: "John",
      familyName: "Smith",
    });
    res.json({ message: "Signup request sent", response });
  } catch (err) {
    console.error("Cognito error:", err);
    res.status(500).json({ error: err.message });
  }
}

async function signUpHelper(req, res) {
  //Notice: The password is hashed before being stored in the database to ensure security.
  try {
    const role = req.body.role;

    if (role === "patient") {
      const {
        email,
        first_name,
        last_name,
        dob,
        gender,
        address,
        phone_number,
        insurance,
        current_medication,
        health_provider_id,
        is_active,
        cognito_sub,
        password
      } = req.body;

      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const query = `
        INSERT INTO patients (
          email, first_name, last_name, dob, gender, address, phone_number,
          insurance, current_medication, health_provider_id, is_active, cognito_sub, password
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `;

      const values = [
        email,
        first_name,
        last_name,
        dob,
        gender,
        address,
        phone_number,
        insurance,
        current_medication,
        health_provider_id,
        is_active,
        cognito_sub,
        hashedPassword
      ];

      await db.query(query, values);
      return res.redirect("/helloworld"); 
    } else if (role === "provider") {
      const {
        cognito_sub,
        first_name,
        last_name,
        email,
        phone_number,
        address,
        license,
        gender,
        bio,
        is_active,
      } = req.body;

      const query = `
        INSERT INTO providers (
          cognito_sub, first_name, last_name, email, phone_number, address,
          license, gender, bio, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `;

      const values = [
        cognito_sub,
        first_name,
        last_name,
        email,
        phone_number,
        address,
        license,
        gender,
        bio,
        is_active,
      ];

      await db.query(query, values);
      return res.redirect("/helloworld"); 
    }

    return res.status(400).json({ error: "Invalid role provided" });
  } catch (error) {
    console.error("Error during signup:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}


module.exports = { testCognito, signUpHelper };
