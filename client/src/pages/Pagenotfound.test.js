import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Pagenotfound from "./Pagenotfound";
import "@testing-library/jest-dom/extend-expect";

// Mock the Layout component to isolate testing
jest.mock("../components/Layout", () => ({ children, title }) => (
  <div data-testid="layout">
    <h1>{title}</h1>
    {children}
  </div>
));

describe("Pagenotfound Component", () => {
  it("renders 404 page with correct elements", () => {
    const { getByTestId, getByText } = render(
      <MemoryRouter>
        <Pagenotfound />
      </MemoryRouter>
    );

    // Check if layout component renders correctly
    const layout = getByTestId("layout");
    expect(getByText("go back- page not found")).toBeInTheDocument();

    // Check if the main error message elements are present
    expect(getByText("404")).toBeInTheDocument();
    expect(getByText("Oops ! Page Not Found")).toBeInTheDocument();

    // Check if the 'Go Back' link is present and correct
    const goBackLink = getByText("Go Back");
    expect(goBackLink).toBeInTheDocument();
    expect(goBackLink.closest("a")).toHaveAttribute("href", "/");
  });
});
