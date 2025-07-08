const pool = require("../db/pool");
const { signUpUser, deleteUser } = require("../services/cognitoService");
const db = require("../db/pool")
const bcrypt = require('bcrypt');
const saltRounds = 10;
//For password verify, we need to run const isMatch = await bcrypt.compare(plainPassword, hashedPassword).


async function testCognito(req, res) {
  try {
    const { username, password, givenName, familyName } = req.body;
    const response = await signUpUser({
      username: username,
      password: password,
      givenName: givenName,
      familyName: familyName,
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
    const now = new Date().toISOString();

    if (role === "patient") {
      const {
        //email
        //first_name
        //last_name
        dob,
        gender,
        address,
        phone_number,
        insurance = null,
        current_medication = null,
        health_provider_id,
        //cognito_sub
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
        RETURNING patient_id;
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
      const patientId = result.rows[0].patient_id; // Get the newly created patient ID

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
          patient_id,
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

      return res.redirect("/helloworld");
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

    return res.redirect("/helloworld");
    }

    return res.status(400).json({ error: "Invalid role provided" });
  } catch (error) {
    console.error("Error during signup:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function deleteUserAndData(req, res) {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Start a transaction
    await db.query('BEGIN');

    try {
      // Find the user in the database first
      const userQuery = 'SELECT * FROM patients WHERE email = $1 UNION SELECT * FROM providers WHERE email = $1';
      const userResult = await db.query(userQuery, [email]);
      
      if (userResult.rows.length === 0) {
        await db.query('ROLLBACK');
        return res.status(404).json({ error: "User not found in database" });
      }

      const user = userResult.rows[0];
      const isPatient = user.patient_id !== undefined;

      if (isPatient) {
        // Delete patient-related data
        await db.query('DELETE FROM symptoms WHERE patient_id = $1', [user.patient_id]);
        await db.query('DELETE FROM patient_language WHERE patient_id = $1', [user.patient_id]);
        await db.query('DELETE FROM patient_preferences WHERE patient_id = $1', [user.patient_id]);
        await db.query('DELETE FROM patients WHERE patient_id = $1', [user.patient_id]);
      } else {
        // Delete provider data
        await db.query('DELETE FROM providers WHERE provider_id = $1', [user.provider_id]);
      }

      // Delete from Cognito
      await deleteUser(email);

      // Commit the transaction
      await db.query('COMMIT');

      res.json({ 
        message: "User deleted successfully from both Cognito and database",
        deletedUser: {
          email: user.email,
          type: isPatient ? 'patient' : 'provider'
        }
      });
    } catch (error) {
      // Rollback the transaction on error
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ 
      error: "Failed to delete user", 
      details: error.message 
    });
  }
}

module.exports = { testCognito, signUpHelper, deleteUserAndData };
