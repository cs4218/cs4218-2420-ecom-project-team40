import { jest } from "@jest/globals";
import { requireSignIn, isAdmin } from "./authMiddleware";
import userModel from "../models/userModel";
import JWT from "jsonwebtoken";

jest.mock("jsonwebtoken");
jest.mock("../models/userModel.js", () => ({
	findById: jest.fn(),
}));

describe("Require Sign In Test", () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { headers: { authorization: "valid authorization", }, };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    next = jest.fn();
  });
  
  test("successful sign in", async () => {
    const mockDecodedUser = {_id: "0", role: "non-admin user" };
    JWT.verify.mockReturnValue(mockDecodedUser);

    await requireSignIn(req, res, next);

    expect(JWT.verify).toHaveBeenCalledWith("valid authorization", process.env.JWT_SECRET);
    expect(req.user).toEqual(mockDecodedUser);
    expect(next).toHaveBeenCalled(); 
  });

  test("unsuccessful sign in with printed error message", async () => {
    console.log = jest.fn();
    JWT.verify.mockImplementation(() => {
        throw new Error();
    });

    await requireSignIn(req, res, next);

    expect(console.log).toHaveBeenCalledWith(expect.any(Error));
    expect(next).not.toHaveBeenCalled(); 
  });
});

describe("Admin Access Test", () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { user : { _id: "123" }};
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    next = jest.fn();
  });

	
  test("admin users allowed admin access", async () => {
    userModel.findById.mockResolvedValue({ _id: "123", role: 1 });

    await isAdmin(req, res, next);

    expect(userModel.findById).toHaveBeenCalledWith("123");
    expect(next).toHaveBeenCalled(); 
    expect(res.status).not.toHaveBeenCalled(); 
  });

	test("non-admin users denied admin access", async () => {
    userModel.findById.mockResolvedValue({ _id: "123", role: 0 });

    await isAdmin(req, res, next);

    expect(userModel.findById).toHaveBeenCalledWith("123");
		expect(res.status).toHaveBeenCalledWith(401); 
		expect(res.send).toHaveBeenCalledWith({
			success: false,
			message: "UnAuthorized Access",
		});
    expect(next).not.toHaveBeenCalled();
  });

	test("Error", async () => {
		console.log = jest.fn();
    userModel.findById.mockRejectedValue(new Error());

    await isAdmin(req, res, next);

    expect(console.log).toHaveBeenCalledWith(expect.any(Error));
		expect(res.status).toHaveBeenCalledWith(401); 
		expect(res.send).toHaveBeenCalledWith({
			success: false,
			error: expect.any(Error),
			message: "Error in admin middleware",
		});
    expect(next).not.toHaveBeenCalled();
  });
});
