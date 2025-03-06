import React from "react";
import { render, screen, fireEvent, waitFor, act, within } from "@testing-library/react";
import axios from "axios";
import CreateCategory from "./CreateCategory";
import { MemoryRouter } from "react-router-dom";
import toast from "react-hot-toast";
import "@testing-library/jest-dom";

// Mock axios
jest.mock("axios");

// Mock custom hooks
jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [{ user: null, token: "" }, jest.fn()]), // Mock `useAuth`
}));
jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [[]]), // Mock `useCart`
}));
jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [[]]), // Mock `useSearch`
}));

// Mock toast notifications
jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

jest.mock("../../components/Layout", () => ({ children }) => <div>{children}</div>);

describe("CreateCategory Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders the component with category form and table", async () => {
    // Mock API response for fetching categories
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        category: [
          { _id: "1", name: "Electronics" },
          { _id: "2", name: "Clothing" },
        ],
      },
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <CreateCategory />
        </MemoryRouter>
      );
    });

    // Check if headings and form elements render correctly
    expect(await screen.findByText("Manage Category")).toBeInTheDocument();
    expect(await screen.findByPlaceholderText("Enter new category")).toBeInTheDocument();
    expect(await screen.findByText("Electronics")).toBeInTheDocument();
    expect(await screen.findByText("Clothing")).toBeInTheDocument();
  });

  test("submits new category successfully", async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, category: [] } });
    axios.post.mockResolvedValueOnce({ data: { success: true } });

    await act(async () => {
      render(
        <MemoryRouter>
          <CreateCategory />
        </MemoryRouter>
      );
    });

    // Enter category name
    const input = screen.getByPlaceholderText("Enter new category");
    fireEvent.change(input, { target: { value: "Books" } });

    // Submit form
    const submitButton = screen.getByText("Submit");
    fireEvent.click(submitButton);

    // Wait for API call to complete
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("/api/v1/category/create-category", { name: "Books" });
      expect(toast.success).toHaveBeenCalledWith("Books is created");
    });
  });

  test("handles category creation failure", async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, category: [] } });
    axios.post.mockRejectedValueOnce(new Error("API Error"));

    await act(async () => {
      render(
        <MemoryRouter>
          <CreateCategory />
        </MemoryRouter>
      );
    });

    fireEvent.change(screen.getByPlaceholderText("Enter new category"), { target: { value: "Toys" } });
    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("somthing went wrong in input form");
    });
  });

  test("updates a category", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        category: [{ _id: "1", name: "Electronics" }],
      },
    });

    axios.put.mockResolvedValueOnce({ data: { success: true } });

    await act(async () => {
      render(
        <MemoryRouter>
          <CreateCategory />
        </MemoryRouter>
      );
    });

    const editButton = await screen.findByText("Edit");
    fireEvent.click(editButton);

    // Change category name
    const modal = screen.getByRole("dialog"); // Select modal
    const modalInput = within(modal).getByPlaceholderText("Enter new category");
    
    fireEvent.change(modalInput, { target: { value: "Tech Gadgets" } });
    
    // Submit update
    const modalSubmitButton = within(modal).getByText("Submit"); // Find submit inside modal
    fireEvent.click(modalSubmitButton);
    
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith("/api/v1/category/update-category/1", { name: "Tech Gadgets" });
      expect(toast.success).toHaveBeenCalledWith("Tech Gadgets is updated");
    });
  });

  test("deletes a category", async () => {
    axios.get.mockResolvedValueOnce({
      data: { success: true, category: [{ _id: "1", name: "Electronics" }] },
    });
    axios.delete.mockResolvedValueOnce({ data: { success: true } });

    await act(async () => {
      render(
        <MemoryRouter>
          <CreateCategory />
        </MemoryRouter>
      );
    });

    // Click delete button
    const deleteButton = await screen.findByText("Delete");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith("/api/v1/category/delete-category/1");
      expect(toast.success).toHaveBeenCalledWith("category is deleted");
    });
  });

  test("handles API error when deleting a category", async () => {
    axios.get.mockResolvedValueOnce({
      data: { success: true, category: [{ _id: "1", name: "Electronics" }] },
    });
    axios.delete.mockRejectedValueOnce(new Error("API Error"));

    await act(async () => {
      render(
        <MemoryRouter>
          <CreateCategory />
        </MemoryRouter>
      );
    });

    const deleteButton = await screen.findByText("Delete");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Somtihing went wrong");
    });
  });
});
