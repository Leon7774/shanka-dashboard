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

        switch (view) {
            case "kpi":
                result = await supabase
                    .from("view_kpi_summary")
                    .select("*")
                    .single();
                break;
            case "country":
                result = await supabase
                    .from("view_sales_by_country")
                    .select("*")
                    .order("total_revenue", { ascending: false })
                    .limit(10);
                break;
            case "products":
                result = await supabase
                    .from("view_product_performance")
                    .select("*")
                    .order("total_revenue", { ascending: false });
                break;
            case "forecast":
                result = await supabase
                    .from("view_monthly_sales")
                    .select("*")
                    .order("month", { ascending: true });
                break;
            default:
                // Fallback to original logic (simplified) or return error
                // For backward compatibility or debug:
                const limit = Number(event.queryStringParameters?.limit) || 10;
                const offset = Number(event.queryStringParameters?.offset) || 0;
                const range = offset * limit;
                result = await supabase
                    .from("sales")
                    .select("*")
                    .range(range, range + limit);
        }

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
