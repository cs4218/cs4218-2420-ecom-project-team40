import { expect, jest } from "@jest/globals";
import bcrypt from "bcrypt";
import { hashPassword, comparePassword } from "./authHelper";
import { beforeEach } from "node:test";

jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("mockedhash"),
  compare: jest.fn(),
}));

describe("Auth Helper Test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("hashPassword returns hashed password", async () => {
    const result = await hashPassword("password");

    expect(result).toEqual("mockedhash");
    expect(bcrypt.hash).toHaveBeenCalledTimes(1);
  });

  test("given correct password to compare", async () => {
    // arrange mocks and variables
    const givenPassword = "password";
    bcrypt.compare.mockResolvedValue(true);

    const hashResult = await hashPassword(givenPassword);

    // act on comparePassword function
    const compareResult = await comparePassword(givenPassword, hashResult);

    // assert the function is called accordingly
    expect(bcrypt.compare).toHaveBeenCalledWith(givenPassword, hashResult);
    expect(compareResult).toBe(true);
  });

  test("given wrong password to compare", async () => {
    // arrange mocks and variables
    const wrongPassword = "wrongPassword";
    bcrypt.compare.mockResolvedValue(false);

    const hashResult = await hashPassword(wrongPassword);

    // act on comparePassword function
    const compareResult = await comparePassword(wrongPassword, hashResult);

    // assert the function is called accordingly
    expect(bcrypt.compare).toHaveBeenCalledWith(wrongPassword, hashResult);
    expect(compareResult).toBe(false);
  });

  test("hash password error", async () => {
    const logSpy = jest.spyOn(console, "log");
    bcrypt.hash.mockRejectedValue("Hashing error");

    const hashResult = await hashPassword("");

    expect(hashResult).toBe(undefined);
    expect(logSpy).toHaveBeenCalledWith("Hashing error");
  });
});
