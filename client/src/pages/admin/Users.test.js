import React from "react";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Users from "./Users";
import "@testing-library/jest-dom/extend-expect";
import axios from "axios";
import toast from "react-hot-toast";

jest.mock("axios");
jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]),
}));
jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]),
}));
jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]),
}));
jest.mock("react-hot-toast");

describe("Users Page Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders Users Page and user successfully", async () => {
    // Arrange users data
    axios.get.mockResolvedValue({
      data: [
        {
          _id: 0,
          name: "Pizza hut",
          email: "hello@test.com",
          phone: "63353535",
          address: "20 Rochor road",
          role: 0,
        },
      ],
    });

    // Act
    const { getByText } = render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>
    );

    // Assert the table renders all the items properly
    expect(getByText("All Users")).toBeInTheDocument();
    expect(getByText("Name")).toBeInTheDocument();
    expect(getByText("Email")).toBeInTheDocument();
    expect(getByText("Phone")).toBeInTheDocument();
    expect(getByText("Address")).toBeInTheDocument();
    expect(getByText("Role")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
      expect(getByText("Pizza hut")).toBeInTheDocument();
    });

    expect(getByText("hello@test.com")).toBeInTheDocument();
    expect(getByText("63353535")).toBeInTheDocument();
    expect(getByText("20 Rochor road")).toBeInTheDocument();
    expect(getByText("User")).toBeInTheDocument();
  });

  test("renders Users Page and admin successfully", async () => {
    // Arrange users data
    axios.get.mockResolvedValue({
      data: [
        {
          _id: 0,
          name: "Daniel",
          email: "Daniel@gmail.com",
          phone: "91234567",
          address: "60 Hougang Road",
          role: 1,
        },
      ],
    });

    // Act
    const { getByText } = render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>
    );

    // Assert the table renders all the items properly
    expect(getByText("All Users")).toBeInTheDocument();
    expect(getByText("Name")).toBeInTheDocument();
    expect(getByText("Email")).toBeInTheDocument();
    expect(getByText("Phone")).toBeInTheDocument();
    expect(getByText("Address")).toBeInTheDocument();
    expect(getByText("Role")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
      expect(getByText("Daniel")).toBeInTheDocument();
    });

    expect(getByText("Daniel@gmail.com")).toBeInTheDocument();
    expect(getByText("91234567")).toBeInTheDocument();
    expect(getByText("60 Hougang Road")).toBeInTheDocument();
    expect(getByText("Admin")).toBeInTheDocument();
  });

  test("renders Users Page and both user and admin successfully", async () => {
    // Arrange users data
    axios.get.mockResolvedValue({
      data: [
        {
          _id: 0,
          name: "Daniel",
          email: "Daniel@gmail.com",
          phone: "91234567",
          address: "60 Hougang Road",
          role: 1,
        },
        {
          _id: 1,
          name: "Pizza hut",
          email: "hello@test.com",
          phone: "63353535",
          address: "20 Rochor road",
          role: 0,
        },
      ],
    });

    // Act
    const { getByText } = render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>
    );

    // Assert the table renders all the items properly
    expect(getByText("All Users")).toBeInTheDocument();
    expect(getByText("Name")).toBeInTheDocument();
    expect(getByText("Email")).toBeInTheDocument();
    expect(getByText("Phone")).toBeInTheDocument();
    expect(getByText("Address")).toBeInTheDocument();
    expect(getByText("Role")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
      expect(getByText("Daniel")).toBeInTheDocument();
    });

    expect(getByText("Daniel@gmail.com")).toBeInTheDocument();
    expect(getByText("91234567")).toBeInTheDocument();
    expect(getByText("60 Hougang Road")).toBeInTheDocument();
    expect(getByText("Admin")).toBeInTheDocument();

    expect(getByText("Pizza hut")).toBeInTheDocument();
    expect(getByText("hello@test.com")).toBeInTheDocument();
    expect(getByText("63353535")).toBeInTheDocument();
    expect(getByText("20 Rochor road")).toBeInTheDocument();
    expect(getByText("User")).toBeInTheDocument();
  });

  test("get user failed triggers toast", async () => {
    // Arrange
    axios.get.mockRejectedValue(new Error("Error fetching users"));

    //Act
    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Error fetching all users");
    });
  });
});
