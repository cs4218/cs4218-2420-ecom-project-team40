import React from "react";
import { render, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { MemoryRouter } from "react-router-dom";
import Footer from "./Footer";

describe("Footer component tests", () => {
  test("renders Footer component successfully", () => {
    const { getByText } = render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    expect(getByText("All Rights Reserved © TestingComp")).toBeInTheDocument();
    expect(getByText("About")).toBeInTheDocument();
    expect(getByText("Contact")).toBeInTheDocument();
    expect(getByText("Privacy Policy")).toBeInTheDocument();
  });
});
