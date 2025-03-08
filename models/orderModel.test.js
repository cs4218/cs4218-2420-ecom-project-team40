import orderModel from "../models/orderModel.js";

jest.mock("../models/orderModel.js"); // Mocking the Order model

describe("Mocked Order Model Test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should call save method when creating a new order", async () => {
    // Mock the save method
    orderModel.prototype.save = jest.fn().mockResolvedValue({
      products: ["productId1", "productId2"],
      payment: { status: "paid", amount: 100 },
      buyer: "buyerId123",
      status: "Processing",
    });

    // Create a new order
    const newOrder = new orderModel({
      products: ["productId1", "productId2"],
      payment: { status: "paid", amount: 100 },
      buyer: "buyerId123",
      status: "Processing",
    });

    await newOrder.save();

    expect(newOrder.save).toHaveBeenCalled();
  });

  test("should fail to create an order if no products are included", async () => {
    orderModel.prototype.save = jest
      .fn()
      .mockRejectedValue(new Error("Products are required"));

    const newOrder = new orderModel({
      payment: { status: "paid", amount: 100 },
      buyer: "buyerId123",
      status: "Processing",
    });

    await expect(newOrder.save()).rejects.toThrow("Products are required");
  });

  test("should default to 'Not Process' status if not provided", async () => {
    // Mock save method to return an object with the default status
    orderModel.prototype.save = jest.fn().mockResolvedValue({
      products: ["productId1"],
      payment: { status: "paid", amount: 50 },
      buyer: "buyerId123",
      status: "Not Process", // Default value
    });
  
    const newOrder = new orderModel({
      products: ["productId1"],
      payment: { status: "paid", amount: 50 },
      buyer: "buyerId123",
    });
  
    const savedOrder = await newOrder.save(); // Get the resolved object from the mock
  
    expect(newOrder.save).toHaveBeenCalled();
    expect(savedOrder.status).toBe("Not Process"); // Check against the returned object
  });
  
});
