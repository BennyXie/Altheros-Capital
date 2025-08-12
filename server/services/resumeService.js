    require("dotenv").config({ path: "./.env" });
    const OpenAI = require("openai");
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const db = require("../db/pool");

    async function cvHandler(fileUrl) {
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    const instructions = `
        You are a capable OCR system.
        Extract the following information from the provided CV to the best of your ability:
        Return only the JSON result in a stringified format, so that I can use json to parse it.
        Return only the JSON result, do not include any other text in the response.
        Return empty string for a string info youu don't find in the CV or 0 for a number info you don't find in the CV.
        Strictly follow the JSON format provided below:
        Here is the JSON format:
            {
        "firstName": "",
        "lastName": "",
        "educations": [
            {
            "school": "",
            "degree": "",
            "field": "",
            "start_date": "YYYY",
            "end_date": "YYYY",
            }
        ],
        "experiences": [
            {
            "company": "",
            "jobTitle": "",
            "start_date": "YYYY",
            "end_date": "YYYY",
            }
        ],
        "skills": [
            {
            "skill": "",
            }
        ],
        "languages": [
            {
            "language": "",
            }
        ],
        "contact": {
            "email": "",
            "phone": "",
            "linkedin": ""
        },
        "location":{
            "city": "",
            "state": ""
        },
        "gender": ""
        }
        `;

    const fetch = (...args) =>
        import("node-fetch").then(({ default: fetch }) => fetch(...args));
    const res = await fetch(fileUrl);
    if (!res.ok) throw new Error("Failed to download file");
    const buffer = await res.arrayBuffer();
    const text = await bufferToString(Buffer.from(buffer));

    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
        { role: "system", content: instructions },
        { role: "user", content: `Here is the CV content:\n\n${text}` },
        ],
        temperature: 0.2,
        max_tokens: 1100,
    });

    const result = completion.choices[0]?.message?.content;
    if (!result) throw new Error("No response from OpenAI");
    return result;
    }

    async function bufferToString(buffer) {
    if (buffer.slice(0, 4).toString() === "%PDF") {
        const pdfParse = require("pdf-parse");
        try {
        const data = await pdfParse(buffer);
        return data.text;
        } catch (e) {
        return "[PDF parse error]";
        }
    }
    return buffer.toString("utf-8");
    }

    async function addToApplicants(email, publicId){
        const query = `
            INSERT INTO applicants (email, resume_public_id)
            VALUES ($1, $2)
        `;
        await db.query(query, [email, publicId]);
    }

    async function deleteApplicant(email){
        const query = `
            DELETE FROM applicants
            WHERE email = $1
        `;
        await db.query(query, [email]);
    }

    module.exports = {cvHandler, addToApplicants, deleteApplicant};
