import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
region: process.env.APP_REGION,
credentials: {
accessKeyId: process.env.APP_ACCESS_KEY_ID as string,
secretAccessKey: process.env.APP_SECRET_ACCESS_KEY as string,
},
});

export const ddb = DynamoDBDocumentClient.from(client);
