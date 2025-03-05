import React from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import Profile from "./Profile";
import { useAuth } from "../../context/auth";
import toast from "react-hot-toast";

// Mocking axios.post
jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]), // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]), // Mock useCart hook to return null state and a mock function
}));

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
}));

jest.mock("../../hooks/useCategory", () => jest.fn(() => []));

const mockedUsedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
   ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));

Object.defineProperty(window, "localStorage", {
  value: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
});

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };

describe("Profile Component", () => {
  const mockUser = {
    name: "John Doe",
    email: "test@example.com",
    password: "password123",
    phone: "1234567890",
    address: "NUS Street",
  }

  const mockUpdatedUser = {
    name: "Johnathon Dough",
    email: "newemail@example.com",
    password: "newpassword123",
    phone: "0987654321",
    address: "123 Street",
  }

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue([
      {
        user: mockUser,
        token: "mockToken",
      },
      jest.fn(),
    ]);
  });

  it("renders profile page", () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    expect(screen.getByText("USER PROFILE")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Your Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Your Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Your Password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Your Phone")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Your Address")).toBeInTheDocument();
  });

  it("should have input fields with prefilled values", () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    expect(screen.getByText("USER PROFILE")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Your Name").value).toBe(mockUser.name);
    expect(screen.getByPlaceholderText("Enter Your Email").value).toBe(mockUser.email);
    expect(screen.getByPlaceholderText("Enter Your Password").value).toBe("");
    expect(screen.getByPlaceholderText("Enter Your Phone").value).toBe(mockUser.phone);
    expect(screen.getByPlaceholderText("Enter Your Address").value).toBe(mockUser.address);
  });

  it("should allow typing in of fields", () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    expect(screen.getByText("USER PROFILE")).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText("Enter Your Name"), {
      target: { value: mockUpdatedUser.name },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Email"), {
      target: { value: mockUpdatedUser.email },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Password"), {
      target: { value: mockUpdatedUser.password },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Phone"), {
      target: { value: mockUpdatedUser.phone },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Address"), {
      target: { value: mockUpdatedUser.address },
    });
  });

  it("should submit the update request when the update button is clicked", async () => {
    axios.put.mockResolvedValue({ 
      data: 
        { 
          success: true,
          updatedUser: mockUpdatedUser, 
          token: "mockToken",
        }
      }
    );
    
    window.localStorage.getItem.mockReturnValue(
      JSON.stringify(
        { 
          user: mockUser, 
          token: "mockToken",
        }
      )
    );

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    expect(screen.getByText("USER PROFILE")).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText("Enter Your Name"), {
      target: { value: mockUpdatedUser.name },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Email"), {
      target: { value: mockUpdatedUser.email },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Password"), {
      target: { value: mockUpdatedUser.password },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Phone"), {
      target: { value: mockUpdatedUser.phone },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Address"), {
      target: { value: mockUpdatedUser.address },
    });

    fireEvent.click(screen.getByText("UPDATE"));
    await waitFor(() => expect(axios.put).toHaveBeenCalledWith("/api/v1/auth/profile", {
      name: mockUpdatedUser.name,
      email: mockUpdatedUser.email,
      password: mockUpdatedUser.password,
      phone: mockUpdatedUser.phone,
      address: mockUpdatedUser.address,
    }));

    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "auth", 
      JSON.stringify(
        { 
          user: mockUpdatedUser, 
          token : "mockToken", 
        }
      )
    );

    expect(toast.success).toHaveBeenCalledWith("Profile Updated Successfully");
  });

  it("should show a toast error if the api response is an error", async () => {
    axios.put.mockResolvedValue({ data: { error: "Error in response" } });

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    expect(screen.getByText("USER PROFILE")).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText("Enter Your Name"), {
      target: { value: mockUpdatedUser.name },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Email"), {
      target: { value: mockUpdatedUser.email },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Password"), {
      target: { value: mockUpdatedUser.password },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Phone"), {
      target: { value: mockUpdatedUser.phone },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Address"), {
      target: { value: mockUpdatedUser.address },
    });

    fireEvent.click(screen.getByText("UPDATE"));
    await waitFor(() => expect(axios.put).toHaveBeenCalledWith("/api/v1/auth/profile", {
      name: mockUpdatedUser.name,
      email: mockUpdatedUser.email,
      password: mockUpdatedUser.password,
      phone: mockUpdatedUser.phone,
      address: mockUpdatedUser.address,
    }));

    expect(toast.error).toHaveBeenCalledWith("Error in response");
  });

  it("should log and show a toast error if there is an error in the api call", async () => {
    axios.put.mockRejectedValue(new Error("API failure"));
    const outputSpy = jest.spyOn(console, "log"); // credits to https://stackoverflow.com/questions/49096093/how-do-i-test-a-jest-console-log
    
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    expect(screen.getByText("USER PROFILE")).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText("Enter Your Name"), {
      target: { value: mockUpdatedUser.name },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Email"), {
      target: { value: mockUpdatedUser.email },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Password"), {
      target: { value: mockUpdatedUser.password },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Phone"), {
      target: { value: mockUpdatedUser.phone },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Address"), {
      target: { value: mockUpdatedUser.address },
    });

    fireEvent.click(screen.getByText("UPDATE"));
    await waitFor(() => expect(axios.put).toHaveBeenCalledWith("/api/v1/auth/profile", {
      name: mockUpdatedUser.name,
      email: mockUpdatedUser.email,
      password: mockUpdatedUser.password,
      phone: mockUpdatedUser.phone,
      address: mockUpdatedUser.address,
    }));

    await waitFor(() => {
			expect(outputSpy).toHaveBeenCalledWith(expect.any(Error));
		});
    expect(toast.error).toHaveBeenCalledWith("Something went wrong");
		outputSpy.mockRestore();
  });
});
