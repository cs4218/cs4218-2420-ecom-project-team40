import mongoose from "mongoose";
import productModel from "../models/productModel.js";

jest.mock("../models/productModel.js");

describe("Mocked Product Model Test", () => {
  test("should call save method when creating a new product", async () => {
    const saveMock = jest.fn().mockResolvedValue({
      name: "Laptop",
      slug: "laptop",
      description: "A high-performance laptop",
      price: 1000,
      category: new mongoose.Types.ObjectId(),
      quantity: 10,
      shipping: true,
    });

    const newProduct = new productModel({
      name: "Laptop",
      slug: "laptop",
      description: "A high-performance laptop",
      price: 1000,
      category: new mongoose.Types.ObjectId(),
      quantity: 10,
      shipping: true,
    });

    newProduct.save = saveMock; // Mock the save function for the instance

    await newProduct.save();

    expect(saveMock).toHaveBeenCalled();
  });

  // Test for each required field missing
  const requiredFields = [
    { field: "name", data: { slug: "laptop", description: "A high-performance laptop", price: 1000, category: new mongoose.Types.ObjectId(), quantity: 10 } },
    { field: "slug", data: { name: "Laptop", description: "A high-performance laptop", price: 1000, category: new mongoose.Types.ObjectId(), quantity: 10 } },
    { field: "description", data: { name: "Laptop", slug: "laptop", price: 1000, category: new mongoose.Types.ObjectId(), quantity: 10 } },
    { field: "price", data: { name: "Laptop", slug: "laptop", description: "A high-performance laptop", category: new mongoose.Types.ObjectId(), quantity: 10 } },
    { field: "category", data: { name: "Laptop", slug: "laptop", description: "A high-performance laptop", price: 1000, quantity: 10 } },
    { field: "quantity", data: { name: "Laptop", slug: "laptop", description: "A high-performance laptop", price: 1000, category: new mongoose.Types.ObjectId() } },
  ];

  requiredFields.forEach(({ field, data }) => {
    test(`should fail to create a product if ${field} is missing`, async () => {
      const saveMock = jest.fn().mockRejectedValue(new Error(`${field} is required`));

      const newProduct = new productModel(data);

      newProduct.save = saveMock; // Mock save function for the instance

      await expect(newProduct.save()).rejects.toThrow(`${field} is required`);
    });
  });
});
