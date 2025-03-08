import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import orderModel from "../models/orderModel.js";

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
  await orderModel.deleteMany(); // Clear orders before each test
});

describe("Order Model Test with In-Memory Database", () => {
  test("should save an order with default status", async () => {
    const newOrder = new orderModel({
      products: [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()],
      payment: { status: "Paid", amount: 250 },
      buyer: new mongoose.Types.ObjectId(),
    });

    const savedOrder = await newOrder.save();

    expect(savedOrder._id).toBeDefined();
    expect(savedOrder.status).toBe("Not Process"); // Default status
  });

  test("should fail to save an order if products are missing", async () => {
    const orderWithoutProducts = new orderModel({
      payment: { status: "Paid", amount: 100 },
      buyer: new mongoose.Types.ObjectId(),
    });

    await expect(orderWithoutProducts.save()).rejects.toThrow();
  });

  test("should allow updating order status", async () => {
    const order = new orderModel({
      products: [new mongoose.Types.ObjectId()],
      payment: { status: "Paid", amount: 100 },
      buyer: new mongoose.Types.ObjectId(),
    });

    const savedOrder = await order.save();
    
    savedOrder.status = "Processing";
    const updatedOrder = await savedOrder.save();

    expect(updatedOrder.status).toBe("Processing");
  });
});
