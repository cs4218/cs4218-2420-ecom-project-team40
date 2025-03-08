import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import categoryModel from "../models/categoryModel.js";

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
  await categoryModel.deleteMany(); // Clear categories before each test
});

describe("Category Model Test with In-Memory Database", () => {
  test("should save a category with a name and slug", async () => {
    const newCategory = new categoryModel({
      name: "Electronics",
      slug: "electronics",
    });

    const savedCategory = await newCategory.save();

    expect(savedCategory._id).toBeDefined();
    expect(savedCategory.name).toBe("Electronics");
    expect(savedCategory.slug).toBe("electronics");
  });

  test("should fail to save a category if name is missing", async () => {
    const categoryWithoutName = new categoryModel({
      slug: "missing-name",
    });

    await expect(categoryWithoutName.save()).rejects.toThrow();
  });

  test("should ensure slug is stored in lowercase", async () => {
    const category = new categoryModel({
      name: "Fashion",
      slug: "FASHION",
    });

    const savedCategory = await category.save();

    expect(savedCategory.slug).toBe("fashion"); // Should be converted to lowercase
  });
});
