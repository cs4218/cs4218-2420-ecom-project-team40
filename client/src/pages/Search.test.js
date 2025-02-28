import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useSearch } from "../context/search";
import Layout from "./../components/Layout";
import Search from "./Search";

jest.mock("../context/search");

jest.mock("./../components/Layout", () => ({ children }) => (
  <div>{children}</div>
));
describe("test Search Component", () => {
  const mockProducts = [
    {
      _id: "1",
      name: "Test 1",
      description: "Description 1",
      price: 10,
    },
    {
      _id: "2",
      name: "Test 2",
      description: "Description 2",
      price: 20,
    },
  ];

  const emptySearchResult = { results: [] };
  const filledSearchResult = { results: mockProducts };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should display 'No Products Found' when there are no search results", () => {
    useSearch.mockReturnValue([emptySearchResult, jest.fn()]);
    render(<Search />);

    expect(screen.getByText(/No Products Found/i)).toBeInTheDocument();
  });

  test("should display the number of products", () => {
    useSearch.mockReturnValue([filledSearchResult, jest.fn()]);
    render(<Search />);

    expect(screen.getByText(/Found 2/i)).toBeInTheDocument();
  });

  test("should display product details successfully", () => {
    useSearch.mockReturnValue([filledSearchResult, jest.fn()]);

    render(<Search />);
    mockProducts.forEach((product) => {
      expect(screen.getByText(product.name)).toBeInTheDocument();
      expect(screen.getByText(new RegExp(product.description.substring(0, 30)))).toBeInTheDocument();
      expect(screen.getByText(`$ ${product.price}`)).toBeInTheDocument();
    });
  });
});