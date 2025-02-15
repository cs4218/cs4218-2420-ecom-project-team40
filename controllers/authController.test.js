import { jest } from "@jest/globals";
import { registerController } from "./authController";
import userModel from "../models/userModel";
import { hashPassword } from "./../helpers/authHelper.js";

// Mock external dependencies
jest.mock("../models/userModel.js");
jest.mock("./../helpers/authHelper.js");

describe("Register Controller Test", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {
        name: "John Doe",
        email: "john.doe@example.com",
        password: "password123",
        phone: "12344000",
        address: "123 Street",
        answer: "Football",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  test("should return error when name is missing", async () => {
    req.body.name = "";
    await registerController(req, res);
    expect(res.send).toHaveBeenCalledWith({ error: "Name is Required" });
  });

  test("should return error when email is missing", async () => {
    req.body.email = "";
    await registerController(req, res);
    expect(res.send).toHaveBeenCalledWith({ message: "Email is Required" });
  });

  test("should return error when email format is invalid", async () => {
    req.body.email = "invalid-email";
    await registerController(req, res);
    expect(res.send).toHaveBeenCalledWith({ message: "Invalid email format" });
  });

  test("should return error when password is missing", async () => {
    req.body.password = "";
    await registerController(req, res);
    expect(res.send).toHaveBeenCalledWith({ message: "Password is Required" });
  });

  test("should return error when phone is missing", async () => {
    req.body.phone = "";
    await registerController(req, res);
    expect(res.send).toHaveBeenCalledWith({ message: "Phone no is Required" });
  });

  test("should return error when address is missing", async () => {
    req.body.address = "";
    await registerController(req, res);
    expect(res.send).toHaveBeenCalledWith({ message: "Address is Required" });
  });

  test("should return error when answer is missing", async () => {
    req.body.answer = "";
    await registerController(req, res);
    expect(res.send).toHaveBeenCalledWith({ message: "Answer is Required" });
  });

  test("should return error if the user already exists", async () => {
    userModel.findOne = jest.fn().mockResolvedValue({ email: "john.doe@example.com" });
    await registerController(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Already Register please login",
    });
  });

  test("should save user if registration is successful", async () => {
    userModel.findOne = jest.fn().mockResolvedValue(null);
    userModel.prototype.save = jest.fn().mockResolvedValue(req.body);

    hashPassword.mockResolvedValue("hashedPassword");

    await registerController(req, res);
    expect(userModel.prototype.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "User Register Successfully",
      user: req.body,
    });
  });

  test("user model is not saved for invalid email", async () => {
    userModel.findOne = jest.fn().mockResolvedValue(null);
    userModel.prototype.save = jest.fn();
    
    hashPassword.mockResolvedValue("hashedPassword");

    req.body.email = "invalid-email";
    await registerController(req, res);
    expect(res.send).toHaveBeenCalledWith({ message: "Invalid email format" });
    expect(userModel.prototype.save).not.toHaveBeenCalled();
  });

  test("user model is not saved for invalid phone no", async () => {
    userModel.findOne = jest.fn().mockResolvedValue(null);
    userModel.prototype.save = jest.fn();
    
    hashPassword.mockResolvedValue("hashedPassword");

    req.body.phone = "invalidPhone";  
    await registerController(req, res);
    expect(res.send).toHaveBeenCalledWith({ message: "Invalid phone format" });
    expect(userModel.prototype.save).not.toHaveBeenCalled();
  });
  
});
