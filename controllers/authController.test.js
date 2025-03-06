import { expect, jest } from "@jest/globals";
import {
  registerController,
  loginController,
  forgotPasswordController,
  updateProfileController,
  getAllUsersController,
} from "./authController";
import userModel from "../models/userModel";
import { hashPassword } from "./../helpers/authHelper.js";
import { comparePassword } from "../helpers/authHelper.js";
import JWT from "jsonwebtoken";

// Mock external dependencies
jest.mock("../models/userModel.js");
jest.mock("./../helpers/authHelper.js");
jest.mock("jsonwebtoken");

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
    userModel.findOne = jest
      .fn()
      .mockResolvedValue({ email: "john.doe@example.com" });
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

describe("Login Controller Test", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {
        email: "john.doe@example.com",
        password: "password123",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  test("should return error when email or password is missing", async () => {
    req.body.email = ""; // Missing email
    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Invalid email or password",
    });
  });

  test("should return error when user is not found", async () => {
    userModel.findOne = jest.fn().mockResolvedValue(null); // User not found
    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Email is not registerd",
    });
  });

  test("should return error when password is incorrect", async () => {
    userModel.findOne = jest.fn().mockResolvedValue({
      email: "john.doe@example.com",
      password: "hashedpassword",
    });
    comparePassword.mockResolvedValue(false); // Password doesn't match
    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Invalid Password",
    });
  });

  test("should login successfully and return token when credentials are correct", async () => {
    const mockUser = {
      _id: "user123",
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "12344000",
      address: "123 Street",
      role: "user",
      password: "hashedpassword",
    };

    userModel.findOne = jest.fn().mockResolvedValue(mockUser); // User found
    comparePassword.mockResolvedValue(true); // Password matches
    JWT.sign = jest.fn().mockReturnValue("mockToken"); // Mock JWT token generation

    await loginController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "login successfully",
      user: {
        _id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
        phone: mockUser.phone,
        address: mockUser.address,
        role: mockUser.role,
      },
      token: "mockToken",
    });
  });

  test("should return error if an exception occurs during login", async () => {
    userModel.findOne = jest
      .fn()
      .mockRejectedValue(new Error("Database Error"));
    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error in login",
      error: expect.any(Error),
    });
  });
});

describe("Forgot Password Controller Test", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {
        email: "john.doe@example.com",
        answer: "Football",
        newPassword: "newpassword123",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  test("should return error when email is missing", async () => {
    req.body.email = ""; // Missing email
    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ message: "Email is required" });
  });

  test("should return error when answer is missing", async () => {
    req.body.answer = ""; // Missing answer
    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ message: "answer is required" });
  });

  test("should return error when new password is missing", async () => {
    req.body.newPassword = ""; // Missing new password
    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      message: "New Password is required",
    });
  });

  test("should return error if no user is found with the provided email and answer", async () => {
    userModel.findOne = jest.fn().mockResolvedValue(null); // User not found
    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Wrong Email Or Answer",
    });
  });

  test("should reset password successfully when correct email and answer are provided", async () => {
    const mockUser = {
      _id: "user123",
      email: "john.doe@example.com",
      answer: "Football",
      password: "oldpassword123",
    };

    userModel.findOne = jest.fn().mockResolvedValue(mockUser); // User found
    hashPassword.mockResolvedValue("hashedNewPassword"); // Mock password hashing

    await forgotPasswordController(req, res);

    expect(hashPassword).toHaveBeenCalledWith(req.body.newPassword); // Ensure password hashing is called
    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(mockUser._id, {
      password: "hashedNewPassword",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Password Reset Successfully",
    });
  });

  test("should return error if an exception occurs during password reset", async () => {
    userModel.findOne = jest
      .fn()
      .mockRejectedValue(new Error("Database Error")); // Simulate DB error
    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Something went wrong",
      error: expect.any(Error),
    });
  });
});

describe("Update Profile Controller Test", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {},
      user: {
        _id: "user123",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  test("should update user profile successfully without password change", async () => {
    const mockUser = {
      _id: "user123",
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
      address: "123 Main St",
    };

    req.body = {
      name: "John Updated",
      address: "456 New St",
    };
    userModel.findById = jest.fn().mockResolvedValue(mockUser);
    userModel.findByIdAndUpdate = jest.fn().mockResolvedValue({
      ...mockUser,
      name: req.body.name,
      address: req.body.address,
    });
    await updateProfileController(req, res);
    expect(userModel.findById).toHaveBeenCalledWith(req.user._id);
    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
      req.user._id,
      {
        name: req.body.name,
        phone: mockUser.phone,
        address: req.body.address,
      },
      { new: true }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Profile Updated Successfully",
      updatedUser: expect.any(Object),
    });
  });

  test("should update password when provided", async () => {
    const mockUser = {
      _id: "user123",
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
      address: "123 Main St",
    };
    req.body = {
      name: "John Doe",
      password: "newpassword123",
    };
    userModel.findById = jest.fn().mockResolvedValue(mockUser);
    userModel.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUser);
    hashPassword.mockResolvedValue("hashedNewPassword");
    await updateProfileController(req, res);
    expect(hashPassword).toHaveBeenCalledWith(req.body.password);
    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
      req.user._id,
      {
        name: req.body.name,
        phone: mockUser.phone,
        address: mockUser.address,
        password: "hashedNewPassword",
      },
      { new: true }
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("should return error for short password", async () => {
    const mockUser = {
      _id: "user123",
      name: "John Doe",
      email: "john@example.com",
    };
    req.body = {
      password: "short",
    };
    userModel.findById = jest.fn().mockResolvedValue(mockUser);
    await updateProfileController(req, res);
    expect(res.send).toHaveBeenCalledWith({
      error: "Password must be at least 6 characters long",
    });
    expect(userModel.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  test("should update email if it's new and not already in use", async () => {
    const mockUser = {
      _id: "user123",
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
      address: "123 Main St",
    };
    req.body = {
      email: "newemail@example.com",
    };
    userModel.findById = jest.fn().mockResolvedValue(mockUser);
    userModel.findOne = jest.fn().mockResolvedValue(null); // email not in use
    userModel.findByIdAndUpdate = jest.fn().mockResolvedValue({
      ...mockUser,
      email: req.body.email,
    });
    await updateProfileController(req, res);
    expect(userModel.findOne).toHaveBeenCalledWith({ email: req.body.email });
    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
      req.user._id,
      {
        name: mockUser.name,
        phone: mockUser.phone,
        address: mockUser.address,
        email: req.body.email,
      },
      { new: true }
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("should not update email if it's the same as current", async () => {
    const mockUser = {
      _id: "user123",
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
      address: "123 Main St",
    };
    req.body = {
      email: "john@example.com", // Same as current
    };

    userModel.findById = jest.fn().mockResolvedValue(mockUser);
    userModel.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUser);
    await updateProfileController(req, res);
    expect(userModel.findOne).not.toHaveBeenCalled();
    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
      req.user._id,
      {
        name: mockUser.name,
        phone: mockUser.phone,
        address: mockUser.address,
      },
      { new: true }
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("should return error if email is already in use", async () => {
    const mockUser = {
      _id: "user123",
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
      address: "123 Main St",
    };

    req.body = {
      email: "existing@example.com",
    };

    userModel.findById = jest.fn().mockResolvedValue(mockUser);
    userModel.findOne = jest.fn().mockResolvedValue({ _id: "another-user" }); // email already in use
    await updateProfileController(req, res);
    expect(userModel.findOne).toHaveBeenCalledWith({ email: req.body.email });
    expect(res.send).toHaveBeenCalledWith({
      error: "Email already in use",
    });
    expect(userModel.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  test("should handle error during update process", async () => {
    const mockError = new Error("Database error");
    userModel.findById = jest.fn().mockRejectedValue(mockError);
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    await updateProfileController(req, res);
    expect(consoleLogSpy).toHaveBeenCalledWith(mockError);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error While Updating profile",
      error: mockError,
    });
    consoleLogSpy.mockRestore();
  });
});

describe("All users controller test", () => {
  let res;

  beforeEach(() => {
    jest.clearAllMocks();

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
  });

  test("should return all users successfully", async () => {
    const mockedUser = {
      _id: "1",
      name: "Daniel",
      email: "Daniel@gmail.com",
      phone: "91234567",
      address: "60 Rochor Road",
      answer: "Singapore",
      role: 1,
    };

    const mockSelect = jest.fn().mockResolvedValue([mockedUser]);
    userModel.find = jest.fn().mockReturnValue({
      select: mockSelect,
    });

    await getAllUsersController({}, res);

    expect(res.json).toHaveBeenCalledWith([mockedUser]);
  });

  test("should handle database error when retrieving users", async () => {
    const mockError = new Error("Database error");

    const mockSelect = jest.fn().mockRejectedValue(mockError);
    userModel.find = jest.fn().mockReturnValue({
      select: mockSelect,
    });

    await getAllUsersController({}, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error Getting All Users",
      error: mockError,
    });
  });
});
