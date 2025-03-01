import React from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import toast from "react-hot-toast";
import ForgotPassword from "./ForgotPassword";

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

describe("ForgotPassword Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders forgot password form", () => {
    render(
      <MemoryRouter initialEntries={["/forgot-password"]}>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("FORGOT PASSWORD FORM")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Your Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Your Answer")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Your New Password")).toBeInTheDocument();
  });

  it("inputs should be initially empty", () => {
    render(
      <MemoryRouter initialEntries={["/forgot-password"]}>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("FORGOT PASSWORD FORM")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Your Email").value).toBe("");
    expect(screen.getByPlaceholderText("Enter Your Answer").value).toBe("");
    expect(screen.getByPlaceholderText("Enter Your New Password").value).toBe("");
  });

  it("should allow typing email, answer and new password", () => {
    render(
      <MemoryRouter initialEntries={["/forgot-password"]}>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </MemoryRouter>
    );
    fireEvent.change(screen.getByPlaceholderText("Enter Your Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Answer"), {
      target: { value: "Football" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your New Password"), {
      target: { value: "password123" },
    });
    expect(screen.getByPlaceholderText("Enter Your Email").value).toBe(
      "test@example.com"
    );
    expect(screen.getByPlaceholderText("Enter Your Answer").value).toBe(
      "Football"
    );
    expect(screen.getByPlaceholderText("Enter Your New Password").value).toBe(
      "password123"
    );
  });

  it("should reset the password successfully", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        success: true,
        user: { id: 1, name: "John Doe", email: "test@example.com" },
        token: "mockToken",
      },
    });

    render(
      <MemoryRouter initialEntries={["/forgot-password"]}>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Enter Your Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Answer"), {
      target: { value: "Football" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your New Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByText("RESET PASSWORD"));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith(undefined, {
      duration: 5000,
      icon: "🙏",
      style: {
        background: "green",
        color: "white",
      },
    });
    expect(mockedUsedNavigate).toHaveBeenCalledWith("/login");
  });

  it("should display error message on failed password reset", async () => {
    axios.post.mockRejectedValueOnce({ message: "Test for Invalid credentials" });

    render(
      <MemoryRouter initialEntries={["/forgot-password"]}>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Enter Your Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Answer"), {
      target: { value: "Football" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your New Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByText("RESET PASSWORD"));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith("Something went wrong");
  });

  it("should not call API if input is empty", async () => {
    render(
      <MemoryRouter initialEntries={["/forgot-password"]}>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("RESET PASSWORD"));

    await waitFor(() => expect(axios.post).not.toHaveBeenCalled());
  });

  it("should not call API if email is invalid format", async () => {
    render(
      <MemoryRouter initialEntries={["/forgot-password"]}>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Enter Your Email"), {
      target: { value: "invalid-email" }, // no @ sign
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Answer"), {
      target: { value: "Football" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your New Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByText("RESET PASSWORD"));
    await waitFor(() => expect(axios.post).not.toHaveBeenCalled());
  });

  it("should show error toast when request fails", async () => {
    axios.post.mockResolvedValueOnce({ data: { success: false, message: "Login Failed" } });

    render(
      <MemoryRouter initialEntries={["/forgot-password"]}>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Enter Your Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Answer"), {
      target: { value: "Football" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your New Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByText("RESET PASSWORD"));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    await waitFor(() => expect(toast.error).toHaveBeenCalled());
  });
});
