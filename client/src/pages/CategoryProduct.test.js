import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import CategoryProduct from "../pages/CategoryProduct";
import { useParams } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect"; // Ensure matchers are available

// Mock axios
jest.mock("axios");

// Mock custom hooks
jest.mock("../context/auth", () => ({
  useAuth: jest.fn(() => [{ user: null, token: "" }, jest.fn()]), // Mock `useAuth`
}));
jest.mock("../context/cart", () => ({
  useCart: jest.fn(() => [[]]), // Mock `useCart`
}));
jest.mock("../context/search", () => ({
  useSearch: jest.fn(() => [[]]), // Mock `useSearch`
}));
jest.mock("../hooks/useCategory", () => jest.fn(() => []));

// Mock useParams to provide a category slug
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));

describe("CategoryProduct Component", () => {
  beforeEach(() => {
    useParams.mockReturnValue({ slug: "electronics" });
    jest.clearAllMocks();
  });

  it("renders the category page with initial loading state", async () => {
    axios.get.mockResolvedValue({ data: { products: [], category: { name: "Electronics" } } });

    await act(async () => {
      render(
        <MemoryRouter>
          <Routes>
            <Route path="/" element={<CategoryProduct />} />
          </Routes>
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/Category - Electronics/i)).toBeInTheDocument();
      expect(screen.getByText(/0 result found/i)).toBeInTheDocument();
    });
  });

  it("fetches and displays products from API", async () => {
    const mockProducts = [
      { _id: "1", name: "Laptop", price: 1000, slug: "laptop", description: "Powerful laptop" },
      { _id: "2", name: "Smartphone", price: 800, slug: "smartphone", description: "Latest smartphone" },
    ];

    axios.get.mockResolvedValue({ data: { products: mockProducts, category: { name: "Electronics" } } });

    await act(async () => {
      render(
        <MemoryRouter>
          <Routes>
            <Route path="/" element={<CategoryProduct />} />
          </Routes>
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getAllByText(/Laptop/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/\$1,000.00/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Smartphone/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/\$800.00/i)).toBeInTheDocument();
    });

    expect(axios.get).toHaveBeenCalledWith("/api/v1/product/product-category/electronics");
  });

  it("handles API errors gracefully", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {}); // Mock error
    
    axios.get.mockRejectedValue(new Error("API Error")); // Simulate API failure
  
    await act(async () => {
      render(
        <MemoryRouter>
          <Routes>
            <Route path="/" element={<CategoryProduct />} />
          </Routes>
        </MemoryRouter>
      );
    });
  
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
      expect(screen.getByText(/Category -/i)).toBeInTheDocument();
      expect(screen.getByText(/0 result found/i)).toBeInTheDocument();
    });
  
    console.error.mockRestore(); // Restore original console.error
  });
  
});
