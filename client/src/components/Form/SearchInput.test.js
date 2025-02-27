import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useSearch } from "../../context/search";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SearchInput from "./SearchInput";

jest.mock("../../context/search");
jest.mock("axios");
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn()
}));

describe("SearchInput Component", () => {
  let mockSetValues;
  let mockNavigate;
  
  beforeEach(() => {
    mockSetValues = jest.fn();
    mockNavigate = jest.fn();
    
    useSearch.mockReturnValue([{ keyword: "" }, mockSetValues]);
    useNavigate.mockReturnValue(mockNavigate);
    jest.clearAllMocks();
  });

  test("should render input and search button", () => {
    render(<SearchInput />);
    expect(screen.getByPlaceholderText("Search")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
  });

  test("should update search input value on change", () => {
    render(<SearchInput />);
    const input = screen.getByPlaceholderText("Search");
    fireEvent.change(input, { target: { value: "Laptop" } });
    expect(mockSetValues).toHaveBeenCalledWith({ keyword: "Laptop" });
  });

  test("should submit form and makes API call", async () => {
    const setValuesMock = jest.fn();
    useSearch.mockReturnValue([{ keyword: "Laptop" }, setValuesMock]);
    axios.get.mockResolvedValue({ data: [] });

    render(<SearchInput />);

    const input = screen.getByPlaceholderText("Search");
    fireEvent.change(input, { target: { value: "Laptop" } });

    const submitButton = screen.getByText("Search");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/search/Laptop");
    });

    await waitFor(() => {
      expect(setValuesMock).toHaveBeenCalledWith({
        keyword: "Laptop",
        results: [],
      });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/search");
    });
  });

  test("should handle API error gracefully", async () => {
    const setValuesMock = jest.fn();
    useSearch.mockReturnValue([{ keyword: "Laptop" }, setValuesMock]);
    axios.get.mockRejectedValue(new Error("API error"));

    render(<SearchInput />);

    const input = screen.getByPlaceholderText("Search");
    fireEvent.change(input, { target: { value: "Laptop" } });

    const submitButton = screen.getByText("Search");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/search/Laptop");
    });

    await waitFor(() => {
      expect(setValuesMock).not.toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

});
