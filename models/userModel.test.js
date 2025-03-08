import mongoose from "mongoose";
import userModel from "../models/userModel.js";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await userModel.deleteMany(); // Clear users before each test
});

describe("User Model Test with In-Memory Database", () => {
  test("should save a user with default role 0 if not provided", async () => {
    const newUser = new userModel({
      name: "John Doe",
      email: "john@example.com",
      password: "securepassword",
      phone: "1234567890",
      address: "123 Main St",
      answer: "My first pet",
    });

    const savedUser = await newUser.save();

    expect(savedUser._id).toBeDefined(); // Ensure user was saved
    expect(savedUser.role).toBe(0); // Default role should be 0
  });

  test("should fail to save a user if required fields are missing", async () => {
    const userWithoutEmail = new userModel({
      name: "Missing Email",
      password: "securepassword",
      phone: "5555555555",
      address: "789 Test St",
      answer: "My favorite book",
    });

    await expect(userWithoutEmail.save()).rejects.toThrow();
  });

  test("should fail if email is not unique", async () => {
    const user1 = new userModel({
      name: "Alice",
      email: "alice@example.com",
      password: "securepassword",
      phone: "5555555555",
      address: "789 Test St",
      answer: "My favorite book",
    });

    const user2 = new userModel({
      name: "Bob",
      email: "alice@example.com", // Duplicate email
      password: "securepassword",
      phone: "1231231234",
      address: "456 Other St",
      answer: "My favorite show",
    });

    await user1.save();
    await expect(user2.save()).rejects.toThrow(); // Expect validation error
  });

  test("should enforce email format", async () => {
    const invalidUser = new userModel({
      name: "Invalid Email",
      email: "invalid-email",
      password: "securepassword",
      phone: "5555555555",
      address: "789 Test St",
      answer: "My favorite book",
    });

    await expect(invalidUser.save()).rejects.toThrow();
  });

  test("should allow users with different emails", async () => {
    const user1 = new userModel({
      name: "User One",
      email: "user1@example.com",
      password: "password123",
      phone: "123456789",
      address: "123 Test St",
      answer: "My first pet",
    });

    const user2 = new userModel({
      name: "User Two",
      email: "user2@example.com",
      password: "password123",
      phone: "987654321",
      address: "456 Another St",
      answer: "My best friend",
    });

    await user1.save();
    await user2.save();

    const users = await userModel.find();
    expect(users.length).toBe(2);
  });
});
