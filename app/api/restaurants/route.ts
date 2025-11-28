import { NextResponse } from "next/server";
import { ddb } from "@/lib/dynamodb";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";

const RESTAURANTS_TABLE = process.env.RESTAURANTS_TABLE as string;

export async function GET() {
  try {
    const result = await ddb.send(
      new ScanCommand({
        TableName: RESTAURANTS_TABLE,
      })
    );

    return NextResponse.json(
      { items: result.Items || [] },
      { status: 200 }
    );
  } catch (err) {
    console.error("Restaurants error", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
