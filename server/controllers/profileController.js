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
      phoneNumber, // Client sends phoneNumber
      insurance = null,
      currentMedication = null, // Client sends currentMedication
      health_provider_id,
      symptoms = [],
      languages = [],
      preferences = {},
      user: { first_name, last_name } // email is now from req.user
    } = req.body;

    console.log('completePatientProfile: Received req.body:', req.body);

    if (!dob || !gender || !address || !phoneNumber) { // Add phoneNumber to required fields
      console.error("profileController: Missing required patient fields:", { dob, gender, address, phoneNumber });
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
      phoneNumber, // Map to phone_number
      insurance,
      currentMedication || '', // Map to current_medication
      health_provider_id,
      true,
      now,
      now,
    ];

    console.log('completePatientProfile: Patient INSERT values:', values);

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
        console.log('completePatientProfile: Symptom INSERT values:', symptomValues);
        await db.query(insertSymptomQuery, symptomValues);
      }
    }

    // Insert languages if provided
    if (languages && languages.length > 0) {
      for (const language of languages) {
        const insertLanguageQuery = `
          INSERT INTO patient_language (patient_id, language)
          VALUES ($1, $2)
        `;
        const languageValues = [patientId, language];
        console.log('completePatientProfile: Language INSERT values:', languageValues);
        await db.query(insertLanguageQuery, languageValues);
      }
    }

    // Insert patient preferences if provided
    const { preferredProviderGender, smsOptIn, languagePreference, insuranceRequired, optInContact } = preferences;
    // Always insert preferences, even if empty, to ensure a record exists
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
      ON CONFLICT (patient_id) DO UPDATE SET
        preferred_provider_gender = EXCLUDED.preferred_provider_gender,
        sms_opt_in = EXCLUDED.sms_opt_in,
        language_preference = EXCLUDED.language_preference,
        insurance_required = EXCLUDED.insurance_required,
        opt_in_contact = EXCLUDED.opt_in_contact,
        updated_at = EXCLUDED.updated_at;
    `;

    const insertPrefValues = [
      patientId,
      preferredProviderGender || null,
      smsOptIn || false,
      languagePreference || null,
      insuranceRequired || false,
      optInContact || false,
      now,
    ];

    console.log('completePatientProfile: Preferences INSERT/UPDATE values:', insertPrefValues);

    await db.query(insertPrefQuery, insertPrefValues);

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
      insurance,
      currentMedication, // Client sends currentMedication
      phoneNumber, // Client sends phoneNumber
      symptoms,
      languages,
      preferences,
    } = req.body;

    console.log('updatePatientProfile: Received req.body:', req.body);

    if (!dob || !gender || !address || !phoneNumber) { // Add phoneNumber to required fields
      return res.status(400).json({ error: "Missing required patient profile fields." });
    }

    const now = new Date();

    const query = `
      UPDATE patients SET
        dob = $1, gender = $2, address = $3, insurance = $4,
        current_medication = $5, phone_number = $6, updated_at = $7
      WHERE email = $8
      RETURNING id;
    `;

    const values = [
      dob, gender, address, insurance, currentMedication || '', phoneNumber, now, email
    ];

    console.log('updatePatientProfile: Patient UPDATE values:', values);

    const result = await db.query(query, values);
    const patientId = result.rows[0].id;

    // Update symptoms
    await db.query('DELETE FROM symptoms WHERE patient_id = $1', [patientId]);
    if (symptoms && symptoms.length > 0) {
      for (const symptom of symptoms) {
        await db.query('INSERT INTO symptoms (patient_id, symptom_text, recorded_at) VALUES ($1, $2, $3)', [patientId, symptom, now]);
      }
    }

    // Update languages
    await db.query('DELETE FROM patient_language WHERE patient_id = $1', [patientId]);
    if (languages && languages.length > 0) {
      for (const language of languages) {
        await db.query('INSERT INTO patient_language (patient_id, language) VALUES ($1, $2)', [patientId, language]);
      }
    }

    const { preferredProviderGender, smsOptIn, languagePreference, insuranceRequired, optInContact } = preferences;
    // Always insert/update preferences, even if empty, to ensure a record exists
    const upsertPrefQuery = `
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
      ON CONFLICT (patient_id) DO UPDATE SET
        preferred_provider_gender = EXCLUDED.preferred_provider_gender,
        sms_opt_in = EXCLUDED.sms_opt_in,
        language_preference = EXCLUDED.language_preference,
        insurance_required = EXCLUDED.insurance_required,
        opt_in_contact = EXCLUDED.opt_in_contact,
        updated_at = EXCLUDED.updated_at;
    `;

    const upsertPrefValues = [
      patientId,
      preferredProviderGender || null,
      smsOptIn || false,
      languagePreference || null,
      insuranceRequired || false,
      optInContact || false,
      now,
    ];

    console.log('updatePatientProfile: Preferences UPSERT values:', upsertPrefValues);
    await db.query(upsertPrefQuery, upsertPrefValues);

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

    const patientResult = await db.query('SELECT id, email, first_name, last_name, dob, gender, address, insurance, current_medication, phone_number FROM patients WHERE email = $1', [email]);
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
    console.log(`profileController: getPatientProfile - Preferences query for patient_id: ${patient.id}, result: ${JSON.stringify(preferencesResult.rows)}`);

    const profile = {
      ...patient,
      dob: patient.dob ? patient.dob.toISOString().split('T')[0] : '', // Format DOB to YYYY-MM-DD
      symptoms: symptomsResult.rows.map(r => r.symptom_text),
      languages: languagesResult.rows.map(r => r.language),
      preferences: preferencesResult.rows.length > 0 ? {
        preferredProviderGender: preferencesResult.rows[0].preferred_provider_gender,
        smsOptIn: preferencesResult.rows[0].sms_opt_in,
        languagePreference: preferencesResult.rows[0].language_preference,
        insuranceRequired: preferencesResult.rows[0].insurance_required,
        optInContact: preferencesResult.rows[0].opt_in_contact,
      } : {},
      currentMedication: patient.current_medication || '', // Ensure currentMedication is retrieved
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
        headshot_url, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7, $8, $9,
        $10, $11, $12, $13, $14,
        $15, $16
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

async function updateProviderProfile(req, res) {
  console.log('profileController: updateProviderProfile called');
  try {
    if (!req.user || !req.user.email) {
      return res.status(400).json({ error: "Incomplete user information from token." });
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
      headshot_url,
    } = req.body;

    if (!location || !gender || !experience_years || !education || !about_me) {
      return res.status(400).json({ error: "Missing required provider profile fields." });
    }

    const now = new Date();

    const query = `
      UPDATE providers SET
        insurance_networks = $1, location = $2, specialty = $3, gender = $4,
        experience_years = $5, education = $6, focus_groups = $7, about_me = $8,
        languages = $9, hobbies = $10, quote = $11,
        headshot_url = $12, updated_at = $13
      WHERE email = $14
      RETURNING id;
    `;

    const values = [
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
      headshot_url,
      now,
      email,
    ];

    await db.query(query, values);

    res.status(200).json({ message: "Provider profile updated successfully" });

  } catch (error) {
    console.error("profileController: Error updating provider profile:", error);
    res.status(500).json({ error: "Internal server error during provider profile update", details: error.message });
  }
}

async function getProviderProfile(req, res) {
  console.log('profileController: getProviderProfile called');
  try {
    if (!req.user || !req.user.email) {
      return res.status(400).json({ error: "Incomplete user information from token." });
    }

    const { email } = req.user;
    console.log(`profileController: getProviderProfile - Fetching profile for email: ${email}`);

    const providerResult = await db.query('SELECT * FROM providers WHERE email = $1', [email]);
    console.log(`profileController: getProviderProfile - Provider query result: ${JSON.stringify(providerResult.rows)}`);

    if (providerResult.rows.length === 0) {
      return res.status(404).json({ error: "Provider profile not found." });
    }
    const provider = providerResult.rows[0];

    const profile = {
      ...provider,
      insurance_networks: provider.insurance_networks ? String(provider.insurance_networks).split(',').map(item => item.trim()) : [],
      specialty: provider.specialty ? String(provider.specialty).split(',').map(item => item.trim()) : [],
      focus_groups: provider.focus_groups ? String(provider.focus_groups).split(',').map(item => item.trim()) : [],
      languages: provider.languages ? String(provider.languages).split(',').map(item => item.trim()) : [],
    };
    console.log(`profileController: getProviderProfile - Final profile object: ${JSON.stringify(profile)}`);
    console.log(`profileController: getProviderProfile - headshot_url: ${profile.headshot_url}`);

    res.status(200).json(profile);

  } catch (error) {
    console.error("profileController: Error fetching provider profile:", error);
    res.status(500).json({ error: "Internal server error fetching provider profile", details: error.message });
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
  updateProviderProfile,
  getProviderProfile,
};
