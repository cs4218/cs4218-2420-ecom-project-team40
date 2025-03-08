import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import About from "./About";
import '@testing-library/jest-dom/extend-expect';

// Mock the Layout component to isolate About from Header
jest.mock("../components/Layout", () => ({ children, title }) => (
  <div data-testid="layout">
    <h1>{title}</h1>
    {children}
  </div>
));

describe("About Component", () => {
  it("should render the About page with correct title and content", () => {
    const { getByTestId, getByAltText, getByText } = render(
      <MemoryRouter>
        <About />
      </MemoryRouter>
    );

    // Scope our queries to the Layout to avoid header interference
    const layout = getByTestId("layout");
    expect(getByText("About us - Ecommerce app")).toBeInTheDocument();
    expect(getByAltText("contactus")).toBeInTheDocument();
    expect(getByText("Add text")).toBeInTheDocument();
  });
});
