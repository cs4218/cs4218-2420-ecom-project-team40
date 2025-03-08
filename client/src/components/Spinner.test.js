import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useNavigate, useLocation } from "react-router-dom";
import Spinner from "./Spinner";
import "@testing-library/jest-dom/extend-expect";

// Mock react-router-dom hooks
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
  useLocation: jest.fn(),
}));

describe("Spinner Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the countdown and spinner", () => {
    render(
      <MemoryRouter>
        <Spinner path="dashboard" />
      </MemoryRouter>
    );

    expect(screen.getByText(/redirecting to you in 3 second/i)).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("redirects after countdown ends", async () => {
    const mockNavigate = jest.fn();
    const mockLocation = { pathname: "/current" };

    useNavigate.mockReturnValue(mockNavigate);
    useLocation.mockReturnValue(mockLocation);

    render(
      <MemoryRouter>
        <Spinner path="dashboard" />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard", { state: "/current" });
    }, { timeout: 3500 }); // Ensure enough time for countdown to reach 0
  });
});
