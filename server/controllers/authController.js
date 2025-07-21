const pool = require("../db/pool");
const { signUpUser, addUserToGroup, listGroupsForUser } = require("../services/cognitoService");
const db = require("../db/pool");
const bcrypt = require("bcrypt");
const saltRounds = 10;
//For password verify, we need to run const isMatch = await bcrypt.compare(plainPassword, hashedPassword).

async function cognito_signup(req, res) {
  console.log('authController: cognito_signup called');
  try {
    const { username, password, givenName, familyName } = req.body;
    console.log(`authController: Attempting to sign up user: ${username}`);
    const response = await signUpUser({
      username: username,
      password: password,
      givenName: givenName,
      familyName: familyName
    });
    console.log('authController: signUpUser response:', response);
    res.json({ message: "User registration successful", user: response.User });
  } catch (err) {
    console.error("authController: Cognito error during signup:", err);
    res.status(500).json({ error: err.message });
  }
}



async function addToGroup(req, res) {
  console.log('authController: addToGroup called');
  const { role } = req.body;
  // Ensure req.user and req.user.username are available
  if (!req.user || !req.user.username) {
    console.error("authController: Error: User information not found in request. req.user:", req.user);
    return res.status(400).json({ error: "User information not available" });
  }

  const username = req.user.username;
  const groupName = role === "patient" ? "patients" : "providers";
  console.log(`authController: Attempting to add user ${username} to group ${groupName}`);

  try {
    console.log(`authController: Listing groups for user ${username}...`);
    const userGroups = await listGroupsForUser(username); // Use listGroupsForUser from cognitoService
    console.log(`authController: User ${username} is currently in groups:`, userGroups);

    if (userGroups.includes(groupName)) {
      console.log(`authController: User ${username} is already in group ${groupName}. Skipping add operation.`);
      return res.status(200).json({ message: `User ${username} is already in group ${groupName}` });
    }

    const now = new Date(); // Define 'now' for database operations

    if (role === "patient") {
      const {
        dob,
        gender,
        address,
        phone_number,
        insurance = null,
        current_medication = null,
        health_provider_id,
        password,
        symptoms = [],
        languages = [],
        preferences = {},
        user = {},
      } = req.body;
      const { cognito_sub, email, first_name, last_name } = user;
      const {
        preferredProviderGender = null,
        smsOptIn = false,
        languagePreference = null,
        insuranceRequired = false,
        optInContact = false,
      } = preferences;

      const hashedPassword = await bcrypt.hash(password, saltRounds);

      //Insert patient into the database
      const query = `
        INSERT INTO patients (
          email, first_name, last_name, dob, gender, address, phone_number,
          insurance, current_medication, health_provider_id, is_active,
          cognito_sub, password, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING id;
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
        true,
        cognito_sub,
        hashedPassword,
        now, // created_at
        now, // updated_at
      ];

      const result = await db.query(query, values);
      const patientId = result.rows[0].id; // Get the newly created patient ID (changed from patient_id to id based on RETURNING id)

      // Insert symptoms if provided
      for (const symptom of symptoms) {
        const insertSymptomQuery = `
          INSERT INTO symptoms (patient_id, symptom_text, recorded_at)
          VALUES ($1, $2, $3)
        `;
        const symptomValues = [patientId, symptom, now];
        await db.query(insertSymptomQuery, symptomValues);
      }

      // Insert languages if provided
      const patientLan = languages.join(" ");
      const insertLanguageQuery = `
        INSERT INTO patient_language (patient_id, language)
        VALUES ($1, $2)
      `;
      const languageValues = [patientId, patientLan];
      await db.query(insertLanguageQuery, languageValues);

      // Insert patient preferences if provided
      const insertPrefQuery = `
        INSERT INTO patient_preferences (
          id,
          preferred_provider_gender,
          sms_opt_in,
          language_preference,
          insurance_required,
          opt_in_contact,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
      `;

      const insertPrefValues = [
        patientId,
        preferredProviderGender,
        smsOptIn,
        languagePreference,
        insuranceRequired,
        optInContact,
        now,
      ];

      await db.query(insertPrefQuery, insertPrefValues);

      // return res.redirect("/helloworld"); // Removed redirect, will send JSON response later
    } else if (role === "provider") {
      const {
        insurance_networks = [],
        location,
        specialty = [],
        gender,
        experience_years,
        education,
        focus_groups = [],
        about_me,
        languages = [],
        hobbies,
        quote,
        calendly_url,
        headshot_url,
        password,
        user = {},
      } = req.body;

      const { cognito_sub, email, first_name, last_name } = user;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const query = `
      INSERT INTO providers (
        cognito_sub, email, password, first_name, last_name,
        insurance_networks, location, specialty, gender, experience_years,
        education, focus_groups, about_me, languages, hobbies, quote,
        calendly_url, headshot_url, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20
      )
    `;

      const values = [
        cognito_sub,
        email,
        hashedPassword,
        first_name,
        last_name,
        insurance_networks,
        location,
        specialty,
        gender,
        experience_years,
        education,
        focus_groups,
        about_me,
        languages,
        hobbies,
        quote,
        calendly_url,
        headshot_url,
        now, // created_at
        now, // updated_at
      ];

      await db.query(query, values);

      // return res.redirect("/helloworld"); // Removed redirect, will send JSON response later
    }

    console.log(`authController: Adding user ${username} to group ${groupName}...`);
    try {
      await addUserToGroup(username, groupName); // Use addUserToGroup from cognitoService
      console.log(`authController: Successfully added user ${username} to group ${groupName}`);
      res.status(200).json({ message: `User added to group ${groupName}` });
    } catch (addUserError) {
      console.error("authController: Error adding user to group in Cognito:", addUserError);
      return res.status(500).json({ error: "Failed to add user to group in Cognito", details: addUserError.message });
    }
  } catch (error) {
    console.error("authController: General error in addToGroup:", error);
    res.status(500).json({ error: "Internal server error during group assignment", details: error.message });
  }
}

async function cognito_login(req, res) {
  console.log('authController: cognito_login called');
  try {
    const { username, password } = req.body;
    console.log(`authController: Attempting to sign in user: ${username}`);
    const response = await cognitoService.signInUser({ username, password });
    console.log('authController: signInUser response:', response);
    res.json({ message: "Login successful", token: response.AuthenticationResult.IdToken });
  } catch (err) {
    console.error("authController: Cognito error during login:", err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { cognito_signup, addToGroup, cognito_login };
