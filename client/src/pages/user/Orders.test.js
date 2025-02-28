import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import toast from "react-hot-toast";
import Orders from "./Orders";
import { useAuth } from "../../context/auth";

// Mocking axios.post
jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]), // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]), // Mock useCart hook to return null state and a mock function
}));

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
}));

jest.mock("../../hooks/useCategory", () => jest.fn(() => []));

const mockedUsedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
   ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));

describe("Login Component", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should render orders when user is authenticated", async () => {
    useAuth.mockReturnValue([{ token: "mockToken" }, jest.fn()]);
    
    const mockOrders = [
      {
        _id: "1",
        status: "Not Process",
        buyer: { name: "John Doe" },
        createAt: "2025-02-04T13:42:16.741Z",
        payment: { success: true },
        products: [
          { _id: "p1", name: "Product 1", description: "Test Product 1", price: 100 },
					{ _id: "p2", name: "Product 2", description: "Test Product 2", price: 200 }
        ]
      }
    ];
    
    axios.get.mockResolvedValue({ data: mockOrders });
    
    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter>
        <Orders />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(getByText("All Orders")).toBeInTheDocument();
      expect(getByText("John Doe")).toBeInTheDocument();
      expect(getByText("Not Process")).toBeInTheDocument();
      expect(getByText("Product 1")).toBeInTheDocument();
    });
  });
});