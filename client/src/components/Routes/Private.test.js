import React from "react";
import { render, waitFor, screen } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import { useAuth } from "../../context/auth";
import PrivateRoute from "./Private";

jest.mock("axios");
jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]), // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock('../Spinner', () => {
  return jest.fn(() => <div>Loading...</div>); // stubbing the Spinner component
});

describe("PrivateRoute Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders spinner when user is not authenticated", async () => {
    useAuth.mockReturnValue([{ token: null }, jest.fn()]);
    render(
      <MemoryRouter>
        <PrivateRoute />
      </MemoryRouter>
    );
    
    expect(axios.get).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
  });

  it("calls API when user is authenticated", async () => {
    useAuth.mockReturnValue([{ token: "mockToken" }, jest.fn()]);
    render(
      <MemoryRouter>
        <PrivateRoute />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/user-auth");
    });
  });

  it("renders spinner when user is authenticated but data response is not ok", async () => {
    useAuth.mockReturnValue([{ token: "mockToken" }, jest.fn()]);
    axios.get.mockResolvedValue({ data: { ok: false } });
    render(
      <MemoryRouter>
        <PrivateRoute />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/user-auth");
    });

    await waitFor(() => {
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
  });

  it("renders spinner when user is authenticated but the api fails", async () => {
    useAuth.mockReturnValue([{ token: "mockToken" }, jest.fn()]);
    axios.get.mockResolvedValue(new Error("API failure"));

    const outputSpy = jest.spyOn(console, "log"); // credits to https://stackoverflow.com/questions/49096093/how-do-i-test-a-jest-console-log
    
    render(
      <MemoryRouter>
        <PrivateRoute />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/user-auth");
    });

    await waitFor(() => {
      expect(outputSpy).toHaveBeenCalledWith(expect.any(Error));
    });

    await waitFor(() => {
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    outputSpy.mockRestore();
  });

  it("should not render spinner if the response is ok", async () => {
    useAuth.mockReturnValue([{ token: "mockToken" }, jest.fn()]);
    axios.get.mockResolvedValue({ data: { ok: true } });

    render(
      <MemoryRouter>
        <PrivateRoute />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/user-auth");
    });

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });
  });
});
