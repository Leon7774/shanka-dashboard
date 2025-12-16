import { handler } from "./lambda/fetch";
import { APIGatewayProxyEvent, Context } from "aws-lambda";

// Mock Event
const mockEvent: Partial<APIGatewayProxyEvent> = {
    queryStringParameters: {
        limit: "5",
        offset: "0",
        sort: "asc",
    },
};

// Mock Context
const mockContext: Partial<Context> = {};

async function runTest() {
    console.log("Starting test...");
    try {
        const result = await handler(
            mockEvent as APIGatewayProxyEvent,
            mockContext as Context,
            () => {}
        );
        console.log("Result:", result);
    } catch (error) {
        console.error("Test failed:", error);
    }
}

runTest();
