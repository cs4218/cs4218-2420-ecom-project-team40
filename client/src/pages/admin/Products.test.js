import React from "react";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import axios from "axios";
import toast from "react-hot-toast";
import Products from "./Products";

jest.mock("axios");
jest.mock("react-hot-toast");
jest.mock("./../../components/Layout", () => ({ children, ...props }) => (
  <div {...props}>{children}</div>
));

describe("Admin products page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders Admin products Page", async () => {
    //Arrange
    axios.get.mockResolvedValue({
      data: {
        products: [
          {
            _id: "1",
            name: "Nice book",
            description: "A bestselling book",
            slug: "nice-book",
            price: 54.99,
            quantity: 200,
            shipping: true,
          },
          {
            _id: "2",
            name: "Nice computer",
            description: "A fast computer",
            slug: "nice-computer",
            price: 1000.99,
            quantity: 100,
            shipping: true,
          },
        ],
      },
    });

    // Act
    const { getByText } = render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    //Assert
    //Check the products show up
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
      expect(getByText("Nice book")).toBeInTheDocument();
    });

    expect(getByText("A bestselling book")).toBeInTheDocument();
    expect(getByText("Nice computer")).toBeInTheDocument();
    expect(getByText("A fast computer")).toBeInTheDocument();
  });

  test("toasts shows upon get product error", async () => {
    //Arrange axios call fail
    axios.get.mockRejectedValue(new Error("Get Products Failed"));

    // Act
    const { getByText } = render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    //Assert toast shows error
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    expect(toast.error).toHaveBeenCalledWith("Something Went Wrong");
  });
});
