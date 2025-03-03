import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Policy from "./Policy";
import "@testing-library/jest-dom/extend-expect";

jest.mock("./../components/Layout", () => ({ children, ...props }) => (
  <div {...props}>{children}</div>
));

describe("Policy Page Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders Policy Page", () => {
    // Act
    const { getByText, getByAltText } = render(
      <MemoryRouter>
        <Policy />
      </MemoryRouter>
    );

    // Assert
    // Check for contactus image using alt text
    expect(getByAltText("contactus")).toBeInTheDocument();
    expect(getByText(/PRIVACY POLICY/)).toBeInTheDocument();
    expect(
      getByText(
        /This website collects data from users for the purposes of facilitating the services rendered by Virtual Vault./
      )
    ).toBeInTheDocument();
  });
});
