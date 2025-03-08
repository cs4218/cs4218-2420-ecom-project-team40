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
import UpdateProduct from "./UpdateProduct";

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

jest.mock("./../../components/Layout", () => ({ children, ...props }) => (
  <div {...props}>{children}</div>
));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const oldProduct = {
  _id: "0",
  category: {
    _id: "0",
    name: "Electronics",
  },
  photo: new File(["thisisalightstickphoto"], "lightstick.jpg", {
    type: "image/jpeg",
  }),
  name: "Lightstick",
  description: "The brightest lightstick in the world",
  price: 88,
  quantity: 100,
  shipping: "Yes",
};

describe("Update Products Page tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Stub axios category call
    axios.get.mockImplementation((url) => {
      if (url === "/api/v1/category/get-category") {
        return Promise.resolve({
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
      } else if (url.includes("/api/v1/product/get-product/")) {
        return Promise.resolve({
          data: {
            product: oldProduct,
          },
        });
      }
    });
  });

  test("renders Update product page with product successfully", async () => {
    // Act
    render(
      <MemoryRouter>
        <UpdateProduct />
      </MemoryRouter>
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Update Product")).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText("Write a name")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Write a description")
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Write a price")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Write a quantity")).toBeInTheDocument();
    expect(screen.getByText("Upload Photo")).toBeInTheDocument();
    expect(screen.getByText("UPDATE PRODUCT")).toBeInTheDocument();
    expect(screen.getByText("DELETE PRODUCT")).toBeInTheDocument();
  });
});

// Arrange new product
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

describe("Update Products form test", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Stub axios category call
    axios.get.mockImplementation((url) => {
      if (url === "/api/v1/category/get-category") {
        return Promise.resolve({
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
      } else if (url.includes("/api/v1/product/get-product/")) {
        return Promise.resolve({
          data: {
            product: oldProduct,
          },
        });
      }
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
      category: "Books",
      photo: new File(["thisisabookphoto"], "mermaidbook.jpg", {
        type: "image/jpeg",
      }),
      name: "The great mermaid book",
      description: "The most interesting mermaid book in the world",
      price: 20,
      quantity: 10,
      shipping: "Yes",
    };

    // Mock axios create product calls
    axios.put = jest.fn();

    // Act
    render(
      <MemoryRouter>
        <UpdateProduct />
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

    // Assert
    await waitFor(() => {
      expect(nameInput.value).toBe(newProduct.name);
      expect(descriptionInput.value).toBe(newProduct.description);
      expect(priceInput.value).toBe(newProduct.price.toString());
      expect(quantityInput.value).toBe(newProduct.quantity.toString());
    });
  });

  test("Missing field inputs such as category, photo upload and shipping", async () => {
    // Mock axios update product calls
    axios.put = jest.fn().mockRejectedValue({
      data: {
        success: false,
        message: "Missing required fields",
      },
    });

    // Act
    render(
      <MemoryRouter>
        <UpdateProduct />
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

    fireEvent.click(screen.getByText("UPDATE PRODUCT"));

    // Assert
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith("something went wrong");
    });
  });

  test("Successful submission triggers toast notification", async () => {
    // Will omit the category, shipping and photo field as the selector could not select them

    // Mock axios update product calls
    axios.put = jest.fn().mockResolvedValue({
      data: {
        success: true,
      },
    });

    // Act
    render(
      <MemoryRouter>
        <UpdateProduct />
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

    fireEvent.click(screen.getByText("UPDATE PRODUCT"));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith(
        "Product Updated Successfully"
      );
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/products");
    });
  });

  test("Successful update triggers toast notification", async () => {
    // Will omit the category, shipping and photo field as the selector could not select them
    // Mock axios create product calls
    axios.put = jest.fn().mockResolvedValue({
      data: {
        success: true,
      },
    });

    // Act
    render(
      <MemoryRouter>
        <UpdateProduct />
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

    fireEvent.click(screen.getByText("UPDATE PRODUCT"));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith(
        "Product Updated Successfully"
      );
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/products");
    });
  });

  test("Successful update triggers toast notification", async () => {
    // Will omit the category, shipping and photo field as the selector could not select them
    // Mock axios update product calls
    axios.put = jest.fn().mockResolvedValue({
      data: {
        success: true,
      },
    });

    // Act
    render(
      <MemoryRouter>
        <UpdateProduct />
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

    fireEvent.click(screen.getByText("UPDATE PRODUCT"));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith(
        "Product Updated Successfully"
      );
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/products");
    });
  });

  test("Delete action successful", async () => {
    //Arrange
    // Mock axios delete product calls
    axios.delete = jest.fn().mockResolvedValue({
      data: {
        success: true,
      },
    });

    // override window prompt
    const promptSpy = jest.spyOn(window, "prompt").mockReturnValue("yes"); // Reference to copilot

    // Act
    render(
      <MemoryRouter>
        <UpdateProduct />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByText("DELETE PRODUCT"));

    expect(promptSpy).toHaveBeenCalled();

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalled();
    });
    expect(toast.success).toHaveBeenCalledWith("Product Deleted Successfully");
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/products");
  });

  test("Delete action throws error", async () => {
    //Arrange
    // Mock axios delete product calls
    axios.delete = jest
      .fn()
      .mockRejectedValue(new Error("Error deleting product"));

    // override window prompt
    const promptSpy = jest.spyOn(window, "prompt").mockReturnValue("yes"); // Reference to copilot

    // Act
    render(
      <MemoryRouter>
        <UpdateProduct />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByText("DELETE PRODUCT"));

    expect(promptSpy).toHaveBeenCalled();

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalled();
    });
    expect(toast.error).toHaveBeenCalledWith("Something went wrong");
  });

  test("Delete action rejected with no prompt input", async () => {
    //Arrange
    // Mock axios delete product calls
    axios.delete = jest
      .fn()
      .mockRejectedValue(new Error("Error deleting product"));

    // override window prompt
    const promptSpy = jest.spyOn(window, "prompt").mockReturnValue(""); // Reference to copilot

    // Act
    render(
      <MemoryRouter>
        <UpdateProduct />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByText("DELETE PRODUCT"));

    expect(promptSpy).toHaveBeenCalled();

    await waitFor(() => {
      expect(axios.delete).not.toHaveBeenCalled();
    });
  });
});
