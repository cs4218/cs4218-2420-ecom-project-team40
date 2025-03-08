import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { MemoryRouter } from "react-router-dom";
import Header from "./Header";
import { useAuth } from "../context/auth";
import { useCart } from "../context/cart";
import axios from "axios";
import toast from "react-hot-toast";
import useCategory from "../hooks/useCategory";

jest.mock("axios");
jest.mock("../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]),
}));
jest.mock("../context/cart", () => ({
  useCart: jest.fn(() => [null]),
}));
jest.mock("../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]),
}));
jest.mock("../hooks/useCategory");
jest.mock("react-hot-toast");

// Localstorage mock referenced from https://stackoverflow.com/questions/32911630/how-do-i-deal-with-localstorage-in-jest-tests/
const localStorageMock = {
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("Header component tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders static elements successfully", () => {
    // Act
    const { getByText } = render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    // Assert
    expect(getByText("🛒 Virtual Vault")).toBeInTheDocument();
    expect(getByText("Home")).toBeInTheDocument();
    expect(getByText("Categories")).toBeInTheDocument();
    expect(getByText("Cart")).toBeInTheDocument();
  });

  test("renders list of categories", async () => {
    // Arrange
    useCategory.mockReturnValue([
      { _id: "1", name: "Books", slug: "books" },
      { _id: "2", name: "Electronics", slug: "slectronics" },
    ]);

    // Act
    const { getByText } = render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(useCategory).toHaveBeenCalled();
    });

    // Assert
    expect(getByText("All Categories")).toBeInTheDocument();
    expect(getByText("Books")).toBeInTheDocument();
    expect(getByText("Electronics")).toBeInTheDocument();
  });

  test("renders authenticated user view", async () => {
    // Arrange
    const mockUser = {
      _id: "67a218decf4efddf1e5358ac",
      name: "CS 4218 Test Account",
      email: "cs4218@test.com",
      phone: "81234567",
      address: "1 Computing Drive",
      role: 0,
    };

    useAuth.mockReturnValue([
      {
        user: mockUser,
        token: "thisistoken",
      },

      jest.fn(),
    ]);

    // Act
    const { getByText } = render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(useAuth).toHaveBeenCalled();
    });

    // Assert
    expect(getByText(mockUser.name)).toBeInTheDocument();
    expect(getByText("Dashboard")).toBeInTheDocument();
    expect(getByText("Logout")).toBeInTheDocument();
  });

  test("renders authenticated admin view", async () => {
    // Arrange
    const mockAdmin = {
      _id: "67a218decf4efddf1e5358ac",
      name: "CS 4218 Test Account",
      email: "cs4218@test.com",
      phone: "81234567",
      address: "1 Computing Drive",
      role: 1,
    };

    useAuth.mockReturnValue([
      {
        user: mockAdmin,
        token: "thisistoken",
      },

      jest.fn(),
    ]);

    // Act
    const { getByText } = render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(useAuth).toHaveBeenCalled();
    });

    // Assert
    expect(getByText(mockAdmin.name)).toBeInTheDocument();
    expect(getByText("Dashboard")).toBeInTheDocument();
    expect(getByText("Logout")).toBeInTheDocument();
  });

  test("renders user not logged in view", async () => {
    // Arrange
    useAuth.mockReturnValue([
      {
        user: null,
        token: null,
      },

      jest.fn(),
    ]);

    // Act
    const { getByText } = render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(useAuth).toHaveBeenCalled();
    });

    // Assert
    expect(getByText("Register")).toBeInTheDocument();
    expect(getByText("Login")).toBeInTheDocument();
  });

  test("Logout works successfully", async () => {
    // Arrange
    const mockUser = {
      _id: "67a218decf4efddf1e5358ac",
      name: "CS 4218 Test Account",
      email: "cs4218@test.com",
      phone: "81234567",
      address: "1 Computing Drive",
      role: 0,
    };

    const setAuth = jest.fn();
    useAuth.mockReturnValue([
      {
        user: mockUser,
        token: "thisistoken",
      },
      setAuth,
    ]);

    // Act
    const { getByText } = render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    // Ensures user is logged in
    await waitFor(() => {
      expect(useAuth).toHaveBeenCalled();
    });

    expect(getByText(mockUser.name)).toBeInTheDocument();
    expect(getByText("Dashboard")).toBeInTheDocument();
    expect(getByText("Logout")).toBeInTheDocument();

    // Proceed to logout
    fireEvent.click(getByText("Logout"));

    expect(localStorage.removeItem).toHaveBeenCalledWith("auth");
    expect(setAuth).toHaveBeenCalledWith({
      user: null,
      token: "",
    });
    expect(toast.success).toHaveBeenCalledWith("Logout Successfully");
  });
});
