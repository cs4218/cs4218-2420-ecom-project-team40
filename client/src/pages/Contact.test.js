import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Contact from "./Contact";
import "@testing-library/jest-dom/extend-expect";

jest.mock("./../components/Layout", () => ({ children, ...props }) => (
  <div {...props}>{children}</div>
));

describe("Contact Page Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders Contact Page", () => {
    // Act
    const { getByText, getByAltText } = render(
      <MemoryRouter>
        <Contact />
      </MemoryRouter>
    );

    // Assert
    // Using regex below for text to better match texts with various spacingss
    expect(getByText(/CONTACT US/)).toBeInTheDocument();
    expect(
      getByText(
        /For any query or info about product, feel free to call anytime. We are available 24X7./
      )
    ).toBeInTheDocument();
    expect(getByText(/www.help@ecommerceapp.com/)).toBeInTheDocument();
    expect(getByText(/012-3456789/)).toBeInTheDocument();
    expect(getByText(/1800-0000-0000 \(toll free\)/)).toBeInTheDocument();
    // Check for contact image on the left using alt
    expect(getByAltText("contact")).toBeInTheDocument();
  });
});
