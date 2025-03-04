import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
import "@testing-library/jest-dom/extend-expect";

jest.mock("./../../components/Layout", () => ({ children, ...props }) => (
  <div {...props}>{children}</div>
));

jest.mock("./../../context/auth", () => ({
  useAuth: jest.fn(() => [
    {
      user: {
        name: "admin test",
        email: "admin@gmail.com",
        phone: "655353535",
      },
    },
    jest.fn(),
  ]),
}));

describe("Admin Dashboard Page Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders Admin Dashboard Page", () => {
    // Act
    const { getByText } = render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    // Assert
    // Check for contactus image using alt text
    expect(getByText(/Admin Name : admin test/)).toBeInTheDocument();
    expect(getByText(/Admin Email : admin@gmail.com/)).toBeInTheDocument();
    expect(getByText(/Admin Contact : 655353535/)).toBeInTheDocument();
  });
});
