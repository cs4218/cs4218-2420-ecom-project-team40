import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import UserMenu from "./UserMenu";

describe("UserMenu Component", () => {
  beforeEach(() => {
      jest.clearAllMocks();
  });

  it("should render the page properly", async () => {
    render(
      <MemoryRouter>
        <UserMenu />
      </MemoryRouter>
    );
  
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Profile/i)).toBeInTheDocument();
    expect(screen.getByText(/Orders/i)).toBeInTheDocument();
  });

  it("should navigate the user to the Profile page properly", async () => {
    render(
      <MemoryRouter>
        <UserMenu />
      </MemoryRouter>
    );
  
    expect(screen.getByText(/Profile/i)).toHaveAttribute("href", "/dashboard/user/profile");
  });

  it("should navigate the user to the Orders page properly", async () => {
    render(
      <MemoryRouter>
        <UserMenu />
      </MemoryRouter>
    );
  
    fireEvent.click(screen.getByText(/Orders/i));
    expect(screen.getByText(/Orders/i)).toHaveAttribute("href", "/dashboard/user/orders");
  });
});