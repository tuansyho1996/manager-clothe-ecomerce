import { MongoServerError } from "mongodb";
import { NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongodb";

const categories = ["Tops", "Bottoms", "Knitwear", "Dresses", "Outerwear"];

type ProductDocument = {
  name: string;
  category: string;
  sku: string;
  price: number;
  stock: number;
  color: string;
  createdAt: Date;
};

function getCollection() {
  const databaseName = process.env.MONGODB_DB ?? "manager_shop";

  return getMongoClient().then((client) =>
    client.db(databaseName).collection<ProductDocument>("products"),
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function GET() {
  try {
    const collection = await getCollection();
    const documents = await collection.find().sort({ createdAt: -1 }).toArray();
    const products = documents.map(({ _id, ...product }) => ({
      ...product,
      id: _id.toString(),
    }));

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Failed to load products from MongoDB:", error);
    const missingUri =
      error instanceof Error &&
      error.message === "Missing MONGODB_URI environment variable";

    return NextResponse.json(
      {
        error: missingUri
          ? "MongoDB is not configured. Set MONGODB_URI in manager-shop/.env.local and restart the app."
          : "Could not load products from MongoDB. Check your connection settings and try again.",
      },
      { status: missingUri ? 503 : 500 },
    );
  }
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (!isRecord(body)) {
    return NextResponse.json({ error: "Product details are required." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const sku = typeof body.sku === "string" ? body.sku.trim().toUpperCase() : "";
  const category = typeof body.category === "string" ? body.category : "";
  const price = body.price;
  const stock = body.stock;

  if (
    !name ||
    name.length > 120 ||
    !sku ||
    sku.length > 40 ||
    !categories.includes(category) ||
    typeof price !== "number" ||
    !Number.isFinite(price) ||
    price < 0 ||
    typeof stock !== "number" ||
    !Number.isInteger(stock) ||
    stock < 0
  ) {
    return NextResponse.json(
      { error: "Enter a valid name, SKU, category, non-negative price, and whole-number stock." },
      { status: 400 },
    );
  }

  try {
    const collection = await getCollection();
    await collection.createIndex({ sku: 1 }, { unique: true });

    const product: ProductDocument = {
      name,
      sku,
      category,
      price,
      stock,
      color: "#e8d8c8",
      createdAt: new Date(),
    };
    const result = await collection.insertOne(product);

    return NextResponse.json(
      { product: { ...product, id: result.insertedId.toString() } },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      return NextResponse.json({ error: "That SKU is already in use." }, { status: 409 });
    }

    console.error("Failed to save product to MongoDB:", error);
    const missingUri =
      error instanceof Error &&
      error.message === "Missing MONGODB_URI environment variable";

    return NextResponse.json(
      {
        error: missingUri
          ? "MongoDB is not configured. Set MONGODB_URI in manager-shop/.env.local and restart the app."
          : "Could not save this product to MongoDB. Check your connection settings and try again.",
      },
      { status: missingUri ? 503 : 500 },
    );
  }
}
