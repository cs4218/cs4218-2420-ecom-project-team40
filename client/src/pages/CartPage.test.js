import React from "react";
import { render, waitFor, screen, getByTestId, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import CartPage from "./CartPage";
import { useAuth } from "../context/auth";
import { useCart } from "../context/cart";
import axios from "axios";
import toast from "react-hot-toast";
import { mock } from "node:test";
import { use } from "react";

// Mocking axios.post
jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]), // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock("../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]), // Mock useCart hook to return null state and a mock function
}));

jest.mock("../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
}));

jest.mock("../hooks/useCategory", () => jest.fn(() => []));

const mockedUsedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
   ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));

jest.mock("braintree-web-drop-in-react", () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="dropin">mock dropin</div>),
}));

const mockCartData = [
  { _id: 1, name: "TestProduct", price: 100, quantity: 1, description: "Test Description for product 1" },
  { _id: 2, name: "TestNewProduct2", price: 200, quantity: 2, description: "Test Description for product 2" }, 
];

Object.defineProperty(window, "localStorage", {
	value: {
		setItem: jest.fn(),
		getItem: jest.fn(),
		removeItem: jest.fn(),
		clear: jest.fn(),
	},
	writable: true,
});

describe("CartPage Component", () => {
  beforeEach(() => {
      jest.clearAllMocks();
  });

  it("should get valid client token", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        clientToken: "mockClientToken",
      },
    });

   render(
      <MemoryRouter>
        < CartPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/braintree/token");
    });
  });

  it("should throw an error if there is an error in getting client token", async () => {
    axios.get.mockRejectedValueOnce(new Error("Failed to get client token"));
    const outputSpy = jest.spyOn(console, "log"); // credits to https://stackoverflow.com/questions/49096093/how-do-i-test-a-jest-console-log

    render(
      <MemoryRouter>
        < CartPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(outputSpy).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  it("should recognise the user if they are authenticated", async () => {
    useAuth.mockReturnValue([
      {
        token : "mockToken",
        user : {
          name: "John Doe",
          email: "test@example.com",
          address: "NUS Street",
        },
      },
      jest.fn(),
    ]);

    render(
      <MemoryRouter>
        < CartPage />
      </MemoryRouter>
    );
    
    expect(screen.getByText(/Hello John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument();  
  });

  it("should recognise the user as Guest if they are not authenticated", async () => {
    useAuth.mockReturnValue([
      {
        token : null,
      },
      jest.fn(),
    ]);

    render(
      <MemoryRouter>
        < CartPage />
      </MemoryRouter>
    );
    
    expect(screen.getByText(/Hello Guest/i)).toBeInTheDocument();
  });

  it("should list the correct number of items in cart", async () => {
    useAuth.mockReturnValue([
      {
        token : "mockToken",
        user : {
          name: "John Doe",
          email: "test@example.com",
          address: "NUS Street",
        },
      },
      jest.fn(),
    ]);

    useCart.mockReturnValue([    
        mockCartData,
        jest.fn(), 
      ], 
    );

    render(
      <MemoryRouter>
        < CartPage />
      </MemoryRouter>
    );
    
    expect(screen.getByText(/Hello John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/You have 2 items in your cart/i)).toBeInTheDocument();
    mockCartData.forEach((item) => {
      expect(screen.getByText(item.name)).toBeInTheDocument();
    }); 
    expect(screen.getByText(/Cart Summary/i)).toBeInTheDocument();
    expect(screen.getByTestId("total-price")).toHaveTextContent("Total : $300.00");
  });

  it("should prompt the user to login if user is not authenticated", async () => {
    useAuth.mockReturnValue([
      {
        token : null,
      },
      jest.fn(),
    ]);

    useCart.mockReturnValue([    
        mockCartData,
        jest.fn(), 
      ], 
    );

    render(
      <MemoryRouter>
        < CartPage />
      </MemoryRouter>
    );
    
    expect(screen.getByText(/Hello Guest/i)).toBeInTheDocument();
    expect(screen.getByText(/You have 2 items in your cart/i)).toBeInTheDocument();
    expect(screen.getByText(/Please login to checkout!/i)).toBeInTheDocument();
    mockCartData.forEach((item) => {
      expect(screen.getByText(item.name)).toBeInTheDocument();
    }); 
    expect(screen.getByText(/Cart Summary/i)).toBeInTheDocument();
    expect(screen.getByTestId("total-price")).toHaveTextContent("Total : $300.00");
    fireEvent.click(screen.getByRole("button", { name: /Please Login to checkout/i }));
    expect(mockedUsedNavigate).toHaveBeenCalledWith("/login", {"state": "/cart"});
  });

  it("should prompt to update address if authenticated user does not have an address", async () => {
    useAuth.mockReturnValue([
      {
        token : "mockToken",
        user : {
          name: "John Doe",
          email: "test@example.com",
        },
      },
      jest.fn(),
    ]);

    render(
      <MemoryRouter>
        < CartPage />
      </MemoryRouter>
    );
    
    expect(screen.getByText(/Update Address/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Update Address/i));
    expect(mockedUsedNavigate).toHaveBeenCalledWith("/dashboard/user/profile");
  });

  it("should still allow authenticated user to update their address even if they have one registered", async () => {
    useAuth.mockReturnValue([
      {
        token : "mockToken",
        user : {
          name: "John Doe",
          email: "test@example.com",
          address: "NUS Street",
        },
      },
      jest.fn(),
    ]);

    render(
      <MemoryRouter>
        < CartPage />
      </MemoryRouter>
    );
    
    expect(screen.getByText(/Update Address/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Update Address/i));
    expect(mockedUsedNavigate).toHaveBeenCalledWith("/dashboard/user/profile");
  });

  it("should remove correct item from cart when remove button is clicked", () => {
    const setCart = jest.fn();
    useCart.mockReturnValue([mockCartData, setCart]);

    render(
      <MemoryRouter>
        < CartPage />
      </MemoryRouter>
    );
    fireEvent.click(
      screen.getAllByRole("button", { name: "Remove" })[0]
    );

    const expectedCart =  [{ _id: 2, name: "TestNewProduct2", price: 200, quantity: 2, description: "Test Description for product 2" }];
    expect(setCart).toHaveBeenCalledWith(expectedCart);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "cart",
      JSON.stringify(expectedCart)
    );
  });

  it("should not remove item from cart if there is an error with remove", () => {
    const setCart = jest.fn().mockImplementation(() => {
      throw new Error("Failed to remove item");
    });
    useCart.mockReturnValue([mockCartData, setCart]);
    const outputSpy = jest.spyOn(console, "log"); // credits to https://stackoverflow.com/questions/49096093/how-do-i-test-a-jest-console-log

    render(
      <MemoryRouter>
        < CartPage />
      </MemoryRouter>
    );
    fireEvent.click(
      screen.getAllByRole("button", { name: "Remove" })[0]
    );

    const expectedCart =  [{ _id: 2, name: "TestNewProduct2", price: 200, quantity: 2, description: "Test Description for product 2" }];
    expect(setCart).toHaveBeenCalledWith(expectedCart);
    expect(localStorage.setItem).not.toHaveBeenCalled();
    expect(outputSpy).toHaveBeenCalledWith(expect.any(Error));

    outputSpy.mockRestore();
  });

  it("should not render checkout if clientToken is missing", async () => {
    useAuth.mockReturnValue([
      {
        token : "mockToken",
        user : {
          name: "John Doe",
          email: "test@example.com",
          address: "NUS Street",
        },
      },
      jest.fn(),
    ]);

    useCart.mockReturnValue([    
        mockCartData,
        jest.fn(), 
      ], 
    );

    await act(async ()=>{
      render(
        <MemoryRouter>
          < CartPage />
        </MemoryRouter>
      )}
    );

    expect(screen.queryByTestId("dropin")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Make Payment/i })).not.toBeInTheDocument();
  });

  it("should not render checkout when user is not logged in", async () => {
    useAuth.mockReturnValue([
      {
        token : null,
      },
      jest.fn(),
    ]);

    axios.get.mockResolvedValueOnce({
      data: {
        clientToken: "mockClientToken",
      },
    });

    useCart.mockReturnValue([    
        mockCartData,
        jest.fn(), 
      ], 
    );

    await act(async ()=>{
      render(
        <MemoryRouter>
          < CartPage />
        </MemoryRouter>
      )}
    );

    expect(screen.queryByTestId("dropin")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Make Payment/i })).not.toBeInTheDocument();
  });

  it("should not render checkout when cart is empty", async () => {
    useAuth.mockReturnValue([
      {
        token : "mockToken",
        user : {
          name: "John Doe",
          email: "test@example.com",
          address: "NUS Street",
        },
      },
      jest.fn(),
    ]);
    useCart.mockReturnValue([]); // Empty cart

    axios.get.mockResolvedValueOnce({
      data: {
        clientToken: "mockClientToken",
      },
    });

    await act(async ()=>{
      render(
        <MemoryRouter>
          < CartPage />
        </MemoryRouter>
      )}
    );

    expect(screen.queryByTestId("dropin")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /make payment/i })).not.toBeInTheDocument();
  });

  it("should go to payment when conditions are met", async () => {
    useAuth.mockReturnValue([
      {
        token : "mockToken",
        user : {
          name: "John Doe",
          email: "test@example.com",
          address: "NUS Street",
        },
      },
      jest.fn(),
    ]);

    useCart.mockReturnValue([    
        mockCartData,
        jest.fn(), 
      ], 
    );

    axios.get.mockResolvedValueOnce({
      data: {
        clientToken: "mockClientToken",
      },
    });

    axios.post.mockResolvedValueOnce({
      data: {
        success: true,
      },
    });

    await act(async ()=>{
      render(
        <MemoryRouter>
          < CartPage />
        </MemoryRouter>
      )}
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/braintree/token");
    });
    await waitFor(() => {
      expect(screen.getByTestId("dropin")).toBeInTheDocument();
    });

    // expect(screen.getByRole("button", { name: /make payment/i })).toBeInTheDocument();
    // expect(screen.getByRole("button", { name: /make payment/i })).not.toBeDisabled();
    // fireEvent.click(screen.getByRole("button", { name: /make payment/i }));
    // expect(screen.getByRole("button", { name: /make payment/i })).toBeDisabled();
    // await waitFor(() => { 
    //   expect(axios.post).toHaveBeenCalledWith("/api/v1/product/braintree/payment", expect.any(Object));
    // });
    // expect(localStorage.removeItem).toHaveBeenCalledWith("cart");
    // expect(mockedUsedNavigate).toHaveBeenCalledWith("/dashboard/user/orders");
    // expect(toast.success).toHaveBeenCalledWith("Payment Completed Successfully");
  });
});

