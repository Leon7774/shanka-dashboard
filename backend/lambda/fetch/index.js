"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv = require("dotenv");

// Initialize Supabase
dotenv.config();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_KEY");
}

const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);

const handler = async (event) => {
    // Fetch all
    const fetchAll = event.queryStringParameters?.fetchAll;
    // Number of rows
    const limit = Number(event.queryStringParameters?.limit) || 10;
    // Page to retrieve
    const offset = Number(event.queryStringParameters?.offset) || 0;
    const sort = event.queryStringParameters?.sort || "asc";
    // Supabase uses range(start, end)
    // So we multiply offset by limit to get the start and end
    const range = offset * limit;

    try {
        // If fetchAll = true
        if (fetchAll) {
            const { data, error } = await supabase.from("sales").select("*");

            if (error) {
                console.error("Supabase error:", error);
                return {
                    statusCode: 500,
                    body: JSON.stringify({ error: error.message }),
                };
            }
            return {
                statusCode: 200,
                body: JSON.stringify(data),
            };
        }

        // If selective fetch
        const { data, error } = await supabase
            .from("sales")
            .select("*")
            .range(range, range + limit);
        if (error) {
            console.error("Supabase error:", error);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: error.message }),
            };
        }
        return {
            statusCode: 200,
            body: JSON.stringify(data),
        };
    } catch (err) {
        console.error("Handler error:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal Server Error" }),
        };
    }
};
exports.handler = handler;
//# sourceMappingURL=fetch.js.map
