import { renderHook, act } from "@testing-library/react";
import axios from "axios";
import useCategory from "../hooks/useCategory"; // Adjust the path if necessary
import { waitFor } from "@testing-library/react";

// Mock axios
jest.mock("axios");

describe("useCategory Hook", () => {
  it("should initially return an empty array", () => {
    const { result } = renderHook(() => useCategory());
    expect(result.current).toEqual([]);
  });

  it("should fetch and return categories on mount", async () => {
    const mockCategories = [{ id: 1, name: "Electronics" }, { id: 2, name: "Fashion" }];

    axios.get.mockResolvedValue({ data: { category: mockCategories } });

    const { result } = renderHook(() => useCategory());

    // Wait for state update
    await waitFor(() => expect(result.current).toEqual(mockCategories));

    expect(axios.get).toHaveBeenCalledWith("/api/v1/category/get-category");
  });

  it("should handle API errors gracefully", async () => {
    axios.get.mockRejectedValue(new Error("API Error"));

    const { result } = renderHook(() => useCategory());

    // Wait for the state update (or ensure it remains empty)
    await waitFor(() => expect(result.current).toEqual([]));

    expect(axios.get).toHaveBeenCalledWith("/api/v1/category/get-category");
  });
});
