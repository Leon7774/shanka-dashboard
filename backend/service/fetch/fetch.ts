import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda";
import supabase from "../../supabase/initialize_client";

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
) => {
    // Number of rows
    const limit = Number(event.queryStringParameters?.limit) || 10;
    // Page to retrieve
    const offset = Number(event.queryStringParameters?.offset) || 0;
    const sort = event.queryStringParameters?.sort || "asc";
    // Supabase uses range(start, end)
    // So we multiply offset by limit to get the start and end
    const range = offset * limit;

    try {
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
