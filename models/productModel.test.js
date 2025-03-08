import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import productModel from "../models/productModel.js";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await productModel.deleteMany(); // Clear products before each test
});

describe("Product Model Test with In-Memory Database", () => {
  test("should save a product with all required fields", async () => {
    const newProduct = new productModel({
      name: "Laptop",
      slug: "laptop",
      description: "A powerful laptop",
      price: 1500,
      category: new mongoose.Types.ObjectId(),
      quantity: 10,
      shipping: true,
    });

    const savedProduct = await newProduct.save();
    
    expect(savedProduct._id).toBeDefined();
    expect(savedProduct.name).toBe("Laptop");
    expect(savedProduct.price).toBe(1500);
  });

  test("should fail to save a product if required fields are missing", async () => {
    const productWithoutName = new productModel({
      slug: "missing-name",
      description: "A product without a name",
      price: 500,
      category: new mongoose.Types.ObjectId(),
      quantity: 5,
    });

    await expect(productWithoutName.save()).rejects.toThrow();
  });

  test("should allow setting optional shipping field", async () => {
    const product = new productModel({
      name: "Headphones",
      slug: "headphones",
      description: "Noise-canceling headphones",
      price: 200,
      category: new mongoose.Types.ObjectId(),
      quantity: 50,
    });

    const savedProduct = await product.save();
    
    expect(savedProduct.shipping).toBeUndefined(); // Default to undefined
  });
});
