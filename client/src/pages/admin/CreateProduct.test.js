import React from "react";
import {
  fireEvent,
  render,
  waitFor,
  screen,
  act,
} from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import axios from "axios";
import toast from "react-hot-toast";
import CreateProduct from "./CreateProduct";

jest.mock("axios");
jest.mock("react-hot-toast");
jest.mock("./../../components/Layout", () => ({ children, ...props }) => (
  <div {...props}>{children}</div>
));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("Create Products Page tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Stub axios category call
    axios.get.mockResolvedValue({
      data: {
        success: true,
        category: [
          {
            _id: "0",
            name: "Electronics",
            slug: "electronics",
          },
          {
            _id: "1",
            name: "Books",
            slug: "books",
          },
        ],
      },
    });
  });

  test("renders Create product page successfully", async () => {
    // Act
    render(
      <MemoryRouter>
        <CreateProduct />
      </MemoryRouter>
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Select a category")).toBeInTheDocument(); // Ant design select component does not use native placeholder hence by text
    });
    expect(screen.getByPlaceholderText("Write a name")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Write a description")
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Write a price")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Write a quantity")).toBeInTheDocument();
    expect(screen.getByText("Select Shipping")).toBeInTheDocument();
    expect(screen.getByText("Upload Photo")).toBeInTheDocument();
    expect(screen.getAllByText("Create Product")).toHaveLength(2);
  });
});

describe("Create Products form test", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Stub axios category call
    axios.get.mockResolvedValue({
      data: {
        success: true,
        category: [
          {
            _id: "0",
            name: "Electronics",
            slug: "electronics",
          },
          {
            _id: "1",
            name: "Books",
            slug: "books",
          },
        ],
      },
    });
  });

  // Replace the select component as could not get it to work using event
  jest.mock("antd", () => ({
    Select: () => <div data-testid="mock-select"></div>,
    Option: () => null,
  }));

  test("All fields have valid inputs", async () => {
    // Arrange product
    const newProduct = {
      category: "Electronics",
      photo: new File(["thisisalightstickphoto"], "lightstick.jpg", {
        type: "image/jpeg",
      }),
      name: "Lightstick",
      description: "The brightest lightstick in the world",
      price: 88,
      quantity: 100,
      shipping: "Yes",
    };

    // Mock axios create product calls
    axios.post = jest.fn();

    // Act
    render(
      <MemoryRouter>
        <CreateProduct />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    // Get all the native input elements
    const nameInput = screen.getByPlaceholderText("Write a name");
    const descriptionInput = screen.getByPlaceholderText("Write a description");
    const priceInput = screen.getByPlaceholderText("Write a price");
    const quantityInput = screen.getByPlaceholderText("Write a quantity");

    fireEvent.change(nameInput, {
      target: { value: newProduct.name },
    });
    fireEvent.change(descriptionInput, {
      target: { value: newProduct.description },
    });
    fireEvent.change(priceInput, {
      target: { value: newProduct.price },
    });
    fireEvent.change(quantityInput, {
      target: { value: newProduct.quantity },
    });

    // await fireEvent.click(screen.getByTestId("create-button"));

    // Modify shipping to true as needed for backend
    // const afterSubmitProduct = { ...newProduct, shipping: true };

    await waitFor(() => {
      expect(nameInput.value).toBe(newProduct.name);
      expect(descriptionInput.value).toBe(newProduct.description);
      expect(priceInput.value).toBe(newProduct.price.toString());
      expect(quantityInput.value).toBe(newProduct.quantity.toString());
    });
  });

  test("Missing field inputs such as category, photo upload and shipping", async () => {
    // Arrange product
    const newProduct = {
      category: "Electronics",
      photo: new File(["thisisalightstickphoto"], "lightstick.jpg", {
        type: "image/jpeg",
      }),
      name: "Lightstick",
      description: "The brightest lightstick in the world",
      price: 88,
      quantity: 100,
      shipping: "Yes",
    };

    // Mock axios create product calls
    axios.post = jest
      .fn()
      .mockRejectedValue(new Error("Missing required fields"));

    // Act
    render(
      <MemoryRouter>
        <CreateProduct />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    // Get all the native input elements
    const nameInput = screen.getByPlaceholderText("Write a name");
    const descriptionInput = screen.getByPlaceholderText("Write a description");
    const priceInput = screen.getByPlaceholderText("Write a price");
    const quantityInput = screen.getByPlaceholderText("Write a quantity");

    fireEvent.change(nameInput, {
      target: { value: newProduct.name },
    });
    fireEvent.change(descriptionInput, {
      target: { value: newProduct.description },
    });
    fireEvent.change(priceInput, {
      target: { value: newProduct.price },
    });
    fireEvent.change(quantityInput, {
      target: { value: newProduct.quantity },
    });

    await fireEvent.click(screen.getByTestId("create-button"));

    // Modify shipping to true as needed for backend
    // const afterSubmitProduct = { ...newProduct, shipping: true };

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith(
        "something went wrong creating product"
      );
    });
  });

  test("Successful submission triggers toast notification", async () => {
    // Will omit the category, shipping and photo field as the selector could not select them
    // Arrange product
    const newProduct = {
      category: "Electronics",
      photo: new File(["thisisalightstickphoto"], "lightstick.jpg", {
        type: "image/jpeg",
      }),
      name: "Lightstick",
      description: "The brightest lightstick in the world",
      price: 88,
      quantity: 100,
      shipping: "Yes",
    };

    // Mock axios create product calls
    axios.post = jest.fn().mockResolvedValue({
      data: {
        success: true,
      },
    });

    // Act
    render(
      <MemoryRouter>
        <CreateProduct />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    // Get all the native input elements
    const nameInput = screen.getByPlaceholderText("Write a name");
    const descriptionInput = screen.getByPlaceholderText("Write a description");
    const priceInput = screen.getByPlaceholderText("Write a price");
    const quantityInput = screen.getByPlaceholderText("Write a quantity");

    fireEvent.change(nameInput, {
      target: { value: newProduct.name },
    });
    fireEvent.change(descriptionInput, {
      target: { value: newProduct.description },
    });
    fireEvent.change(priceInput, {
      target: { value: newProduct.price },
    });
    fireEvent.change(quantityInput, {
      target: { value: newProduct.quantity },
    });

    await fireEvent.click(screen.getByTestId("create-button"));

    // Modify shipping to true as needed for backend
    // const afterSubmitProduct = { ...newProduct, shipping: true };

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith(
        "Product Created Successfully"
      );
      expect(mockNavigate).toHaveBeenCalled();
    });
  });
});
