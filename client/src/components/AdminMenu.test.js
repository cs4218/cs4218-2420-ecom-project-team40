import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminMenu from "./AdminMenu";
import "@testing-library/jest-dom/extend-expect";

describe("Admin Menu Page Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders Admin Menu Page", () => {
    // Act
    const { getByText } = render(
      <MemoryRouter>
        <AdminMenu />
      </MemoryRouter>
    );

    // Assert the menu renders all the items properly
    expect(getByText(/Admin Panel/)).toBeInTheDocument();
    expect(getByText(/Create Category/)).toBeInTheDocument();
    expect(getByText(/Create Product/)).toBeInTheDocument();
    expect(getByText(/Products/)).toBeInTheDocument();
    expect(getByText(/Orders/)).toBeInTheDocument();
    expect(getByText(/Users/)).toBeInTheDocument();
  });
});
