const db = require("../db/pool");

async function completePatientProfile(req, res) {
  console.log('profileController: completePatientProfile called');
  try {
    // Ensure req.user is populated by verifyToken middleware
    if (!req.user || !req.user.sub) {
      console.error("profileController: Error: Incomplete user information from token. req.user:", req.user);
      return res.status(400).json({ error: "Incomplete user information from authentication token." });
    }

    const { sub: cognito_sub } = req.user;

    const {
      dob,
      gender,
      address,
      phone_number,
      insurance = null,
      current_medication = null,
      health_provider_id,
      symptoms = [],
      languages = [],
      preferences = {},
      user: { email, first_name, last_name } // Extract from req.body.user
    } = req.body;

    // Basic validation for required fields for patient profile
    if (!dob || !gender || !address || !phone_number) {
      console.error("profileController: Missing required patient fields:", { dob, gender, address, phone_number });
      return res.status(400).json({ error: "Missing required patient profile fields." });
    }

    const now = new Date();

    // Insert patient into the database
    const query = `
      INSERT INTO patients (
        email, first_name, last_name, dob, gender, address, phone_number,
        insurance, current_medication, health_provider_id, is_active,
        cognito_sub, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
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
      true, // is_active
      cognito_sub,
      now, // created_at
      now, // updated_at
    ];

    const result = await db.query(query, values);
    const patientId = result.rows[0].id;

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
    const {
      preferredProviderGender = null,
      smsOptIn = false,
      languagePreference = null,
      insuranceRequired = false,
      optInContact = false,
    } = preferences;

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

    res.status(200).json({ message: "Patient profile completed successfully", patientId });

  } catch (error) {
    console.error("profileController: Error completing patient profile:", error);
    res.status(500).json({ error: "Internal server error during patient profile completion", details: error.message });
  }
}

async function completeProviderProfile(req, res) {
  console.log('profileController: completeProviderProfile called');
  try {
    // Ensure req.user is populated by verifyToken middleware
    if (!req.user || !req.user.sub) {
      console.error("profileController: Error: Incomplete user information from token. req.user:", req.user);
      return res.status(400).json({ error: "Incomplete user information from authentication token." });
    }

    const { sub: cognito_sub } = req.user;

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
      user: { email, first_name, last_name } // Extract from req.body.user
    } = req.body;

    // Basic validation for required fields for provider profile
    if (!location || !gender || !experience_years || !education || !about_me) {
      console.error("profileController: Missing required provider fields:", { location, gender, experience_years, education, about_me });
      return res.status(400).json({ error: "Missing required provider profile fields." });
    }

    const now = new Date();

    const query = `
      INSERT INTO providers (
        cognito_sub, email, first_name, last_name,
        insurance_networks, location, specialty, gender, experience_years,
        education, focus_groups, about_me, languages, hobbies, quote,
        calendly_url, headshot_url, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7, $8, $9,
        $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19
      )
    `;

    const values = [
      cognito_sub,
      email,
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

    res.status(200).json({ message: "Provider profile completed successfully" });

  } catch (error) {
    console.error("profileController: Error completing provider profile:", error);
    res.status(500).json({ error: "Internal server error during provider profile completion", details: error.message });
  }
}

async function checkProfileStatus(req, res) {
  console.log('profileController: checkProfileStatus called');
  try {
    if (!req.user || !req.user.sub || !req.user['cognito:groups']) {
      return res.status(400).json({ error: "Incomplete user information from token." });
    }

    const { sub: cognito_sub, 'cognito:groups': groups } = req.user;
    let isProfileComplete = false;
    let hasDatabaseEntry = false;

    if (groups.includes('patients')) {
      const result = await db.query('SELECT id FROM patients WHERE cognito_sub = $1', [cognito_sub]);
      hasDatabaseEntry = result.rows.length > 0;
      isProfileComplete = hasDatabaseEntry; // For patients, existence in DB means profile is complete
    } else if (groups.includes('providers')) {
      const result = await db.query('SELECT id FROM providers WHERE cognito_sub = $1', [cognito_sub]);
      hasDatabaseEntry = result.rows.length > 0;
      isProfileComplete = hasDatabaseEntry; // For providers, existence in DB means profile is complete
    }

    res.status(200).json({ isProfileComplete, hasDatabaseEntry });
  } catch (error) {
    console.error("profileController: Error checking profile status:", error);
    res.status(500).json({ error: "Internal server error checking profile status", details: error.message });
  }
}

module.exports = {
  completePatientProfile,
  completeProviderProfile,
  checkProfileStatus,
};
