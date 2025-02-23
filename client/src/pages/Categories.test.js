import React from "react";
import { render, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Categories from "./Categories";
import useCategory from "../hooks/useCategory";
import '@testing-library/jest-dom/extend-expect';

// Mock the custom hook for categories.
jest.mock("../hooks/useCategory");

// Mock the Layout component to isolate Categories from Header.
jest.mock("../components/Layout", () => ({ children, title }) => (
  <div data-testid="layout">
    <h1>{title}</h1>
    {children}
  </div>
));

// Mocks for context hooks used by Header/Layout.
jest.mock("../context/auth", () => ({
  useAuth: () => [null, jest.fn()],
}));
jest.mock("../context/cart", () => ({
  useCart: () => [[], jest.fn()],
}));
jest.mock("../context/search", () => ({
  useSearch: () => [{ keyword: "" }, jest.fn()],
}));

describe("Categories Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render category links with correct href and title", () => {
    const mockCategories = [
      { _id: "1", name: "Electronics", slug: "electronics" },
      { _id: "2", name: "Fashion", slug: "fashion" },
    ];
    useCategory.mockReturnValue(mockCategories);

    const { getByTestId } = render(
      <MemoryRouter>
        <Categories />
      </MemoryRouter>
    );

    // Scope our queries to the Layout to avoid header interference.
    const layout = getByTestId("layout");
    expect(within(layout).getByText("All Categories")).toBeInTheDocument();
    expect(within(layout).getByText("Electronics")).toBeInTheDocument();
    expect(within(layout).getByText("Fashion")).toBeInTheDocument();

    const electronicsLink = within(layout).getByText("Electronics").closest("a");
    expect(electronicsLink).toHaveAttribute("href", "/category/electronics");

    const fashionLink = within(layout).getByText("Fashion").closest("a");
    expect(fashionLink).toHaveAttribute("href", "/category/fashion");
  });

  it("should render nothing if no categories are available", () => {
    useCategory.mockReturnValue([]);

    const { getByTestId } = render(
      <MemoryRouter>
        <Categories />
      </MemoryRouter>
    );

    const layout = getByTestId("layout");
    const categoryLinks = layout.querySelectorAll(".btn.btn-primary");
    expect(categoryLinks.length).toBe(0);
  });
});
