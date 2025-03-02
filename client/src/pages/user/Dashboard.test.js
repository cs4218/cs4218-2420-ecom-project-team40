import React from "react";
import { render, waitFor, screen, getByTestId } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import Dashboard from "./Dashboard";
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

describe("Dashboard Component", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should render user dashboard when user is authenticated", () => {
    useAuth.mockReturnValue([
      {
        token : "mockToken",
        user: {
          name: "John Doe",
          email: "test@example.com",
          address: "NUS Street",
        },
      },
    ]);

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
    
    // credits to https://stackoverflow.com/questions/58976251/checking-text-appears-inside-an-element-using-react-testing-library
    expect(screen.getByTestId("name")).toHaveTextContent("John Doe");
    expect(screen.getByTestId("email")).toHaveTextContent("test@example.com");
    expect(screen.getByTestId("address")).toHaveTextContent("NUS Street");
  });

  it("should not render user dashboard if user is not authenticated", () => {
    useAuth.mockReturnValue([
      {
        token : null,
      },
    ]);

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
    
    // credits to https://stackoverflow.com/questions/58976251/checking-text-appears-inside-an-element-using-react-testing-library
    expect(screen.getByTestId("name")).not.toHaveTextContent("John Doe");
    expect(screen.getByTestId("email")).not.toHaveTextContent("test@example.com");
    expect(screen.getByTestId("address")).not.toHaveTextContent("NUS Street");
  });
});