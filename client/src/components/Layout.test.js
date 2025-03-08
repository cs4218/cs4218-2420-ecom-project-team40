import React from "react";
import { render, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { MemoryRouter } from "react-router-dom";
import Layout from "./Layout";

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

describe("Layout component tests", () => {
  test("renders Layout component successfully", async () => {
    // Arrange
    const mockProps = {
      title: "Test title",
      description: "Test description",
      keywords: "test, keywords",
      author: "Tester",
    };

    // Act
    const { getByText } = render(
      <MemoryRouter>
        <Layout {...mockProps} />
      </MemoryRouter>
    );

    expect(getByText("All Rights Reserved © TestingComp")).toBeInTheDocument(); // Check for footer
    expect(getByText("🛒 Virtual Vault")).toBeInTheDocument(); // Check for header

    await waitFor(() => {
      expect(document.title).toBe("Test title"); // Referenced from https://stackoverflow.com/questions/44073960/unit-testing-react-helmet-code
    });
  });

  test("renders Layout children component successfully", () => {
    // Arrange
    const TestComponent = () => {
      return <div>Test layout content</div>;
    };

    // Act
    const { getByText } = render(
      <MemoryRouter>
        <Layout>
          <TestComponent />
        </Layout>
      </MemoryRouter>
    );

    // expect(getByText("")).toBeInTheDocument();
    expect(getByText("All Rights Reserved © TestingComp")).toBeInTheDocument(); // Check for footer
    expect(getByText("🛒 Virtual Vault")).toBeInTheDocument(); // Check for header
    expect(getByText("Test layout content")).toBeInTheDocument(); // Check for child content
  });
});
