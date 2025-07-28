const db = require("../db/pool");

async function completePatientProfile(req, res) {
  console.log('profileController: completePatientProfile called');
  try {
    if (!req.user || !req.user.sub) {
      console.error("profileController: Error: Incomplete user information from token. req.user:", req.user);
      return res.status(400).json({ error: "Incomplete user information from authentication token." });
    }

    const { email } = req.user;

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
      user: { first_name, last_name } // email is now from req.user
    } = req.body;

    if (!dob || !gender || !address || !phone_number) {
      console.error("profileController: Missing required patient fields:", { dob, gender, address, phone_number });
      return res.status(400).json({ error: "Missing required patient profile fields." });
    }

    const now = new Date();

    const query = `
      INSERT INTO patients (
        email, first_name, last_name, dob, gender, address, phone_number,
        insurance, current_medication, health_provider_id, is_active,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
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
      now,
      now,
    ];

    const result = await db.query(query, values);
    const patientId = result.rows[0].id;

    // Insert symptoms if provided
    if (symptoms && symptoms.length > 0) {
      for (const symptom of symptoms) {
        const insertSymptomQuery = `
          INSERT INTO symptoms (patient_id, symptom_text, recorded_at)
          VALUES ($1, $2, $3)
        `;
        const symptomValues = [patientId, symptom, now];
        await db.query(insertSymptomQuery, symptomValues);
      }
    }

    // Insert languages if provided
    if (languages && languages.length > 0) {
      const patientLan = languages.join(" ");
      const insertLanguageQuery = `
        INSERT INTO patient_language (patient_id, language)
        VALUES ($1, $2)
      `;
      const languageValues = [patientId, patientLan];
      await db.query(insertLanguageQuery, languageValues);
    }

    // Insert patient preferences if provided
    const { preferredProviderGender, smsOptIn, languagePreference, insuranceRequired, optInContact } = preferences;
    if (Object.keys(preferences).length > 0) {
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
    }

    res.status(200).json({ message: "Patient profile completed successfully", patientId });

  } catch (error) {
    console.error("profileController: Error completing patient profile:", error);
    res.status(500).json({ error: "Internal server error during patient profile completion", details: error.message });
  }
}

async function updatePatientProfile(req, res) {
  console.log('profileController: updatePatientProfile called');
  try {
    if (!req.user || !req.user.email) {
      return res.status(400).json({ error: "Incomplete user information from token." });
    }

    const { email } = req.user;

    const {
      dob,
      gender,
      address,
      phone_number,
      insurance = null,
      current_medication = null,
      symptoms = [],
      languages = [],
      preferences = {},
    } = req.body;

    if (!dob || !gender || !address || !phone_number) {
      return res.status(400).json({ error: "Missing required patient profile fields." });
    }

    const now = new Date();

    const query = `
      UPDATE patients SET
        dob = $1, gender = $2, address = $3, phone_number = $4, insurance = $5,
        current_medication = $6, updated_at = $7
      WHERE email = $8
      RETURNING id;
    `;

    const values = [
      dob, gender, address, phone_number, insurance, current_medication, now, email
    ];

    const result = await db.query(query, values);
    const patientId = result.rows[0].id;

    await db.query('DELETE FROM symptoms WHERE patient_id = $1', [patientId]);
    for (const symptom of symptoms) {
      await db.query('INSERT INTO symptoms (patient_id, symptom_text, recorded_at) VALUES ($1, $2, $3)', [patientId, symptom, now]);
    }

    await db.query('DELETE FROM patient_language WHERE patient_id = $1', [patientId]);
    const patientLan = languages.join(" ");
    await db.query('INSERT INTO patient_language (patient_id, language) VALUES ($1, $2)', [patientId, patientLan]);

    const { preferredProviderGender, smsOptIn, languagePreference, insuranceRequired, optInContact } = preferences;
    if (Object.keys(preferences).length > 0) {
      await db.query(`
        UPDATE patient_preferences SET
          preferred_provider_gender = $1, sms_opt_in = $2, language_preference = $3,
          insurance_required = $4, opt_in_contact = $5, updated_at = $6
        WHERE patient_id = $7
      `, [preferredProviderGender, smsOptIn, languagePreference, insuranceRequired, optInContact, now, patientId]);
    }

    res.status(200).json({ message: "Patient profile updated successfully", patientId });

  } catch (error) {
    console.error("profileController: Error updating patient profile:", error);
    res.status(500).json({ error: "Internal server error during patient profile update", details: error.message });
  }
}

async function getPatientProfile(req, res) {
  console.log('profileController: getPatientProfile called');
  try {
    if (!req.user || !req.user.email) {
      return res.status(400).json({ error: "Incomplete user information from token." });
    }

    const { email } = req.user;
    console.log(`profileController: getPatientProfile - Fetching profile for email: ${email}`);

    const patientResult = await db.query('SELECT * FROM patients WHERE email = $1', [email]);
    console.log(`profileController: getPatientProfile - Patient query result: ${JSON.stringify(patientResult.rows)}`);

    if (patientResult.rows.length === 0) {
      return res.status(404).json({ error: "Patient profile not found." });
    }
    const patient = patientResult.rows[0];

    const symptomsResult = await db.query('SELECT symptom_text FROM symptoms WHERE patient_id = $1', [patient.id]);
    console.log(`profileController: getPatientProfile - Symptoms query result: ${JSON.stringify(symptomsResult.rows)}`);

    const languagesResult = await db.query('SELECT language FROM patient_language WHERE patient_id = $1', [patient.id]);
    console.log(`profileController: getPatientProfile - Languages query result: ${JSON.stringify(languagesResult.rows)}`);

    const preferencesResult = await db.query('SELECT * FROM patient_preferences WHERE patient_id = $1', [patient.id]);
    console.log(`profileController: getPatientProfile - Preferences query result: ${JSON.stringify(preferencesResult.rows)}`);

    const profile = {
      ...patient,
      dob: patient.dob ? patient.dob.toISOString().split('T')[0] : '', // Format DOB to YYYY-MM-DD
      symptoms: symptomsResult.rows.map(r => r.symptom_text),
      languages: languagesResult.rows.length > 0 ? languagesResult.rows[0].language.split(' ') : [],
      preferences: preferencesResult.rows.length > 0 ? preferencesResult.rows[0] : {},
    };
    console.log(`profileController: getPatientProfile - Final profile object: ${JSON.stringify(profile)}`);

    res.status(200).json(profile);

  } catch (error) {
    console.error("profileController: Error fetching patient profile:", error);
    res.status(500).json({ error: "Internal server error fetching patient profile", details: error.message });
  }
}


async function completeProviderProfile(req, res) {
  console.log('profileController: completeProviderProfile called');
  try {
    if (!req.user || !req.user.email) {
      console.error("profileController: Error: Incomplete user information from token. req.user:", req.user);
      return res.status(400).json({ error: "Incomplete user information from authentication token." });
    }

    const { email } = req.user;

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
      user: { first_name, last_name }
    } = req.body;

    if (!location || !gender || !experience_years || !education || !about_me) {
      console.error("profileController: Missing required provider fields:", { location, gender, experience_years, education, about_me });
      return res.status(400).json({ error: "Missing required provider profile fields." });
    }

    const now = new Date();

    const query = `
      INSERT INTO providers (
        email, first_name, last_name,
        insurance_networks, location, specialty, gender, experience_years,
        education, focus_groups, about_me, languages, hobbies, quote,
        calendly_url, headshot_url, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7, $8, $9,
        $10, $11, $12, $13, $14, $15,
        $16, $17, $18
      )
    `;

    const values = [
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
      now,
      now,
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

    const { email, 'cognito:groups': groups } = req.user;
    let isProfileComplete = false;
    let hasDatabaseEntry = false;

    if (groups.includes('patients')) {
      console.log(`profileController: checkProfileStatus - User is patient. Email: ${email}`);
      const result = await db.query('SELECT id FROM patients WHERE email = $1', [email]);
      console.log(`profileController: checkProfileStatus - Patient query result: ${JSON.stringify(result.rows)}`);
      hasDatabaseEntry = result.rows.length > 0;
      isProfileComplete = hasDatabaseEntry; // For patients, existence in DB means profile is complete
      console.log(`profileController: Patient profile check - hasDatabaseEntry: ${hasDatabaseEntry}, isProfileComplete: ${isProfileComplete}`);
    } else if (groups.includes('providers')) {
      const result = await db.query('SELECT id FROM providers WHERE email = $1', [email]);
      hasDatabaseEntry = result.rows.length > 0;
      isProfileComplete = hasDatabaseEntry;
    }

    res.status(200).json({ isProfileComplete, hasDatabaseEntry });
  } catch (error) {
    console.error("profileController: Error checking profile status:", error);
    res.status(500).json({ error: "Internal server error checking profile status", details: error.message });
  }
}

module.exports = {
  completePatientProfile,
  updatePatientProfile,
  getPatientProfile,
  completeProviderProfile,
  checkProfileStatus,
};
