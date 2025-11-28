import { NextResponse } from "next/server";
import { ddb } from "@/lib/dynamodb";
import { QueryCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuid } from "uuid";

const REVIEWS_TABLE = process.env.REVIEWS_TABLE as string;

// GET /api/reviews?restaurantId=r1
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const restaurantId = searchParams.get("restaurantId");

  if (!restaurantId) {
    return NextResponse.json(
      { error: "restaurantId is required" },
      { status: 400 }
    );
  }

  try {
    const result = await ddb.send(
      new QueryCommand({
        TableName: REVIEWS_TABLE,
        KeyConditionExpression: "restaurantId = :rid",
        ExpressionAttributeValues: {
          ":rid": restaurantId,
        },
        ScanIndexForward: false, // newest first
      })
    );

    return NextResponse.json(
      { items: result.Items || [] },
      { status: 200 }
    );
  } catch (err) {
    console.error("Reviews GET error", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

// POST /api/reviews
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { restaurantId, rating, comment, userId, userName } = body as {
      restaurantId?: string;
      rating?: number;
      comment?: string;
      userId?: string;
      userName?: string;
    };

    if (!restaurantId || !userId || !rating) {
      return NextResponse.json(
        { error: "restaurantId, userId and rating are required" },
        { status: 400 }
      );
    }

    const createdAt = new Date().toISOString();
    const reviewId = uuid();

    const item = {
      restaurantId,
      createdAt,
      reviewId,
      userId,
      userName: userName || "",
      rating,
      comment: comment || "",
    };

    await ddb.send(
      new PutCommand({
        TableName: REVIEWS_TABLE,
        Item: item,
      })
    );

    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error("Reviews POST error", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
