import { renderHook, act } from "@testing-library/react";
import React, { useState, useContext, createContext } from "react";
import { useSearch, SearchProvider } from "./search";

describe("test useSearch custom hook", () => {
  test("should return the default initial state", () => {
    const wrapper = ({ children }) => <SearchProvider>{children}</SearchProvider>;
    const { result } = renderHook(() => useSearch(), { wrapper });
    expect(result.current[0]).toEqual({
      keyword: "",
      results: [],
    });
  });

  test("should update the search context successfully", () => {
    const wrapper = ({ children }) => <SearchProvider>{children}</SearchProvider>;
    const { result } = renderHook(() => useSearch(), { wrapper });
    const [, setAuth] = result.current;
    act(() => {
      setAuth({ keyword: "test", results: ["result1", "result2"] });
    });
    expect(result.current[0]).toEqual({
      keyword: "test",
      results: ["result1", "result2"],
    });
  });

  test("should handle setting empty keyword and results", () => {
    const wrapper = ({ children }) => <SearchProvider>{children}</SearchProvider>;
    const { result } = renderHook(() => useSearch(), { wrapper });
    const [, setAuth] = result.current;
    act(() => {
      setAuth({ keyword: "", results: [] });
    });
    expect(result.current[0]).toEqual({
      keyword: "",
      results: [],
    });
  });
});