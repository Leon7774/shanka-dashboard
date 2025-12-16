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
    // Enable CORS
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,GET",
    };

    const view = event.queryStringParameters?.view;

    try {
        console.log(`Fetch request for view: ${view}`);
        let result = { data: null, error: null };

        // Extract filters
        const { startDate, endDate, country } =
            event.queryStringParameters || {};

        console.log(`Calling RPC get_dashboard_stats with:`, {
            filter_start_date: startDate,
            filter_end_date: endDate,
            filter_country: country,
        });

        // Call proper RPC function based on user request?
        // Actually, the new plan is to standardise on ONE rpc call for the dashboard.
        // It returns everything.

        result = await supabase.rpc("get_dashboard_stats", {
            filter_start_date: startDate || null,
            filter_end_date: endDate || null,
            filter_country: country || null,
        });

        if (result.error) {
            console.error("Supabase error:", result.error);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: result.error.message }),
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(result.data),
        };
    } catch (err) {
        console.error("Handler error:", err);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: "Internal Server Error" }),
        };
    }
};
exports.handler = handler;
//# sourceMappingURL=fetch.js.map
