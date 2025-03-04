import { render, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "./auth";
import "@testing-library/jest-dom";
import React from "react";

const mockGetItem = jest.spyOn(Storage.prototype, "getItem");
jest.mock("axios");

const TestComponent = () => {
  const [auth] = useAuth();
  return (
    <div>
      <span>{auth.user ? auth.user.name : "No User"}</span>
      <span>{auth.token ? auth.token : "No Token"}</span>
    </div>
  );
};

describe("AuthProvider tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should render with default auth values", async () => {
    mockGetItem.mockReturnValueOnce(null); 

    const { getByText } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(getByText("No User")).toBeInTheDocument();
    expect(getByText("No Token")).toBeInTheDocument();
  });

  test("should load auth from localStorage and update", async () => {
    const mockAuthData = {
      user: { name: "Test User" },
      token: "test_token",
    };

    mockGetItem.mockReturnValueOnce(JSON.stringify(mockAuthData));

    const { getByText } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Check if the user and token were updated from localStorage
    await waitFor(() => {
      expect(getByText("Test User")).toBeInTheDocument();
      expect(getByText("test_token")).toBeInTheDocument();
    });
  });
});