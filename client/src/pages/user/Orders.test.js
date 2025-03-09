import React from "react";
import { render, waitFor, screen } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
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

describe("Orders Component", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

  it("should render present orders when user is authenticated", async () => {
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
          { _id: "p2", name: "Product 2", description: "Test Product 2", price: 200 },
        ]
      }
    ];
    
    axios.get.mockResolvedValue({ data: mockOrders });
    
    render(
      <MemoryRouter>
        <Orders />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/orders");
    });

    await waitFor(() => {
      expect(screen.getByText("All Orders")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Not Process")).toBeInTheDocument();
      expect(screen.getByText("Product 1")).toBeInTheDocument();
      expect(screen.getByText("Success")).toBeInTheDocument();
      
      expect(screen.getByText("Product 2")).toBeInTheDocument();
    });
  });

  it("should render order as failed when user payment has failed, when user is authenticated", async () => {
    useAuth.mockReturnValue([{ token: "mockToken" }, jest.fn()]);
    
    const mockOrders = [
      {
        _id: "1",
        status: "Not Process",
        buyer: { name: "John Doe" },
        createAt: "2025-02-04T13:42:16.741Z",
        payment: { success: false },
        products: [
          { _id: "p1", name: "Product 1", description: "Test Product 1", price: 100 },
          { _id: "p2", name: "Product 2", description: "Test Product 2", price: 200 },
        ]
      }
    ];
    
    axios.get.mockResolvedValue({ data: mockOrders });
    
    render(
      <MemoryRouter>
        <Orders />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/orders");
    });

    await waitFor(() => {
      expect(screen.getByText("All Orders")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Not Process")).toBeInTheDocument();
      expect(screen.getByText("Product 1")).toBeInTheDocument();
      expect(screen.getByText("Failed")).toBeInTheDocument();
      expect(screen.getByText("Product 2")).toBeInTheDocument();
    });
  });


  it("should be an empty page if there are not past orders when user is authenticated", async () => {
    useAuth.mockReturnValue([{ token: "mockToken" }, jest.fn()]);
    
    const mockOrders = [];
    
    axios.get.mockResolvedValue({ data: mockOrders });
    
    render(
      <MemoryRouter>
        <Orders />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });
  });

  it("should not render page if user is not authenticated", async () => {
    useAuth.mockReturnValue([{ token: null }, jest.fn()]); 

    render(
      <MemoryRouter>
        <Orders />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(axios.get).not.toHaveBeenCalledWith();
    });
  });

	it("should print error if the api call fails", async () => {
		useAuth.mockReturnValue([{ token: "mockToken" }, jest.fn()]);
    axios.get.mockRejectedValue(new Error("API failure"));
    
    const outputSpy = jest.spyOn(console, "log"); // credits to https://stackoverflow.com/questions/49096093/how-do-i-test-a-jest-console-log

    render(
      <MemoryRouter>
        <Orders />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(outputSpy).toHaveBeenCalledWith(expect.any(Error));
    });

    outputSpy.mockRestore();
  });
});