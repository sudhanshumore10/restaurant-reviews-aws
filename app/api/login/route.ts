import { NextResponse } from "next/server";
import { ddb } from "@/lib/dynamodb";
import { v4 as uuid } from "uuid";
import { ScanCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

const USERS_TABLE = process.env.USERS_TABLE as string;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name } = body as { email?: string; name?: string };

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // 1) Look for existing user with this email (ok to Scan for this small project)
    const scan = await ddb.send(
      new ScanCommand({
        TableName: USERS_TABLE,
        FilterExpression: "#e = :email",
        ExpressionAttributeNames: { "#e": "email" },
        ExpressionAttributeValues: { ":email": email },
        Limit: 1,
      })
    );

    if (scan.Items && scan.Items.length > 0) {
      const user = scan.Items[0];
      return NextResponse.json(
        {
          userId: user.userId,
          email: user.email,
          name: user.name,
        },
        { status: 200 }
      );
    }

    // 2) Create new user
    const userId = uuid();
    const item = {
      userId,
      email,
      name: name || "",
      createdAt: new Date().toISOString(),
    };

    await ddb.send(
      new PutCommand({
        TableName: USERS_TABLE,
        Item: item,
      })
    );

    return NextResponse.json(
      { userId, email, name: item.name },
      { status: 201 }
    );
  } catch (err) {
    console.error("Login error", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
