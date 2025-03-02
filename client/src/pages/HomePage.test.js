
import React from "react";
import {
  render,
  fireEvent,
  waitFor,
  getByRole,
  queryByText,
} from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import "@testing-library/jest-dom/extend-expect";
import toast from "react-hot-toast";
import { Prices } from "../components/Prices";

// Mock dependencies
jest.mock("axios");
jest.mock("../context/cart", () => ({
  useCart: () => [[], jest.fn()],
}));
jest.mock("./../components/Layout", () => ({ children, ...props }) => (
  <div data-testid="layout-mock" {...props}>
    {children}
  </div>
));

jest.mock("react-hot-toast");
jest.mock("../styles/Homepages.css", () => ({}), { virtual: true }); // TODO: Temporary fix, remove before commit

describe("HomePage Component", () => {
  beforeEach(() => {
    // stub APIs
    jest.clearAllMocks();

    axios.get.mockImplementation((url) => {
      // Mock get category call
      if (url === "/api/v1/product/product-list/1") {
        return Promise.resolve({
          data: {
            success: true,
            products: [],
          },
        });
      } else if (url === "/api/v1/product/product-count") {
        return Promise.resolve({
          data: { total: 0 },
        });
      } else if (url === "/api/v1/category/get-category") {
        return Promise.resolve({
          data: {
            success: true,
            category: [],
          },
        });
      }
      // Default mock for other API calls
      return Promise.resolve({ data: {} });
    });
  });

  it("render homepage successfully", async () => {
    // Act
    const { getByText, getByPlaceholderText, getByRole } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    // Assert
    await waitFor(() => {
      // Has to wait for state update if not jest would show error
      expect(getByText("Filter By Category")).toBeInTheDocument();
    });
    expect(getByText("Filter By Price")).toBeInTheDocument();
    expect(getByText("All Products")).toBeInTheDocument();
    expect(getByText("RESET FILTERS")).toBeInTheDocument();
    const banner = getByRole("img", { name: "bannerimage" }); // Check for banner image
    expect(banner).toBeInTheDocument();
  });

  it("category component is loaded", async () => {
    // Arrange
    axios.get.mockImplementation((url) => {
      // Mock get category call
      if (url === "/api/v1/category/get-category") {
        return Promise.resolve({
          data: {
            success: true,
            category: [
              { _id: "1", name: "Books" },
              { _id: "2", name: "Electronics" },
            ],
          },
        });
      }
      // Default mock for other API calls
      return Promise.resolve({ data: {} });
    });

    // Act
    const { getByText } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    // Assert
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/category/get-category");
      expect(getByText("Books")).toBeInTheDocument();
    });

    expect(getByText("Electronics")).toBeInTheDocument();
  });

  it("filter prices component is loaded", async () => {
    // Arrange for product related tests below
    axios.get.mockImplementation((url) => {
      // Mock get category call
      if (url === "/api/v1/product/product-list/1") {
        return Promise.resolve({
          data: {
            success: true,
            products: [
              {
                _id: "1",
                name: "Nice book",
                description: "A bestselling book",
                slug: "nice-book",
                price: 54.99,
                quantity: 200,
                shipping: true,
              },
              {
                _id: "2",
                name: "Nice computer",
                description: "A fast computer",
                slug: "nice-computer",
                price: 1000.99,
                quantity: 100,
                shipping: true,
              },
            ],
          },
        });
      } else if (url === "/api/v1/product/product-count") {
        return Promise.resolve({
          data: { total: 2 },
        });
      } else if (url === "/api/v1/category/get-category") {
        return Promise.resolve({
          data: {
            success: true,
            category: [],
          },
        });
      }
      // Default mock for other API calls
      return Promise.resolve({ data: {} });
    });
    // Arrange
    jest.mock("../components/Prices", () => ({
      Prices: [
        {
          _id: 0,
          name: "$0 to 19",
          array: [0, 19],
        },
        {
          _id: 1,
          name: "$20 to 39",
          array: [20, 39],
        },
      ],
    }));

    // Act
    const { getByText } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    //Assert
    await waitFor(() => {
      expect(getByText("$0 to 19")).toBeInTheDocument();
    });
    expect(getByText("$20 to 39")).toBeInTheDocument();
  });

  it("product component is loaded", async () => {
    // Arrange for product
    axios.get.mockImplementation((url) => {
      // Mock get category call
      if (url === "/api/v1/product/product-list/1") {
        return Promise.resolve({
          data: {
            success: true,
            products: [
              {
                _id: "1",
                name: "Nice book",
                description: "A bestselling book",
                slug: "nice-book",
                price: 54.99,
                quantity: 200,
                shipping: true,
              },
              {
                _id: "2",
                name: "Nice computer",
                description: "A fast computer",
                slug: "nice-computer",
                price: 1000.99,
                quantity: 100,
                shipping: true,
              },
            ],
          },
        });
      } else if (url === "/api/v1/product/product-count") {
        return Promise.resolve({
          data: { total: 2 },
        });
      } else if (url === "/api/v1/category/get-category") {
        return Promise.resolve({
          data: {
            success: true,
            category: [],
          },
        });
      }
      // Default mock for other API calls
      return Promise.resolve({ data: {} });
    });
    // Act
    const { getByText, getAllByText } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    // Assert
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/product-list/1");
      expect(getByText("Nice book")).toBeInTheDocument();
    });

    expect(getByText("$54.99")).toBeInTheDocument();
    expect(getByText("Nice computer")).toBeInTheDocument();
    expect(getByText("$1,000.99")).toBeInTheDocument();
    expect(getAllByText("More Details")).toHaveLength(2);
    expect(getAllByText("ADD TO CART")).toHaveLength(2);
  });

  it("product component is added to cart", async () => {
    // Arrange for product
    axios.get.mockImplementation((url) => {
      // Mock get category call
      if (url === "/api/v1/product/product-list/1") {
        return Promise.resolve({
          data: {
            success: true,
            products: [
              {
                _id: "1",
                name: "Nice book",
                description: "A bestselling book",
                slug: "nice-book",
                price: 54.99,
                quantity: 200,
                shipping: true,
              },
            ],
          },
        });
      } else if (url === "/api/v1/product/product-count") {
        return Promise.resolve({
          data: { total: 1 },
        });
      } else if (url === "/api/v1/category/get-category") {
        return Promise.resolve({
          data: {
            success: true,
            category: [],
          },
        });
      }
      // Default mock for other API calls
      return Promise.resolve({ data: {} });
    });

    // Act
    const { getByText, findByText } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/product-list/1");
    });

    const addCartButton = await findByText("ADD TO CART");
    fireEvent.click(addCartButton);
    expect(toast.success).toHaveBeenCalledWith("Item Added to cart");
  });

  it("filter 1 product out of 2 using category successfully", async () => {
    // Arrange for product
    axios.get.mockImplementation((url) => {
      // Mock get category call
      if (url === "/api/v1/product/product-list/1") {
        return Promise.resolve({
          data: {
            success: true,
            products: [
              {
                _id: "1",
                name: "Nice book",
                description: "A bestselling book",
                category: "1",
                slug: "nice-book",
                price: 54.99,
                quantity: 200,
                shipping: true,
              },
              {
                _id: "2",
                name: "Nice computer",
                description: "A fast computer",
                category: "2",
                slug: "nice-computer",
                price: 1000.99,
                quantity: 100,
                shipping: true,
              },
            ],
          },
        });
      } else if (url === "/api/v1/product/product-count") {
        return Promise.resolve({
          data: { total: 2 },
        });
      } else if (url === "/api/v1/category/get-category") {
        return Promise.resolve({
          data: {
            success: true,
            category: [
              { _id: "1", name: "Books" },
              { _id: "2", name: "Electronics" },
            ],
          },
        });
      }
      // Default mock for other API calls
      return Promise.resolve({ data: {} });
    });

    axios.post.mockImplementation((url, data) => {
      // Mock get category call
      if (url === "/api/v1/product/product-filters") {
        if (data.checked[0] === "1") {
          return Promise.resolve({
            data: {
              success: true,
              products: [
                {
                  _id: "1",
                  name: "Nice book",
                  description: "A bestselling book",
                  category: "1",
                  slug: "nice-book",
                  price: 54.99,
                  quantity: 200,
                  shipping: true,
                },
              ],
            },
          });
        }
      }
      // Default mock for other API calls
      return Promise.resolve({ data: {} });
    });

    // Act
    const { getByText, getByLabelText, queryByText } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    // Assert initial load
    await waitFor(() => {
      expect(getByText("Nice book")).toBeInTheDocument();
      expect(getByText("Nice computer")).toBeInTheDocument();
    });

    // Find checkbox using label
    const booksCheckbox = await waitFor(() => {
      return getByLabelText("Books");
    });
    fireEvent.click(booksCheckbox);

    // Assert after filter
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/api/v1/product/product-filters",
        { checked: ["1"], radio: [] }
      );
      // Query by text to check if computer product is not in the document (does not throw error)
      expect(queryByText("Nice computer")).not.toBeInTheDocument();
    });

    // Assert only one product is shown and loadmore button should not show despite total count is 2
    expect(getByText("Nice book")).toBeInTheDocument();
    expect(queryByText("Loadmore")).not.toBeInTheDocument();
  });

  it("filter 1 product out of 2 using price successfully", async () => {
    // Arrange
    const radioSelected = [100, 9999]; // setup radio selected price

    axios.get.mockImplementation((url) => {
      // Mock get category call
      if (url === "/api/v1/product/product-list/1") {
        return Promise.resolve({
          data: {
            success: true,
            products: [
              {
                _id: "1",
                name: "Nice book",
                description: "A bestselling book",
                category: "1",
                slug: "nice-book",
                price: 54.99,
                quantity: 200,
                shipping: true,
              },
              {
                _id: "2",
                name: "Nice computer",
                description: "A fast computer",
                category: "2",
                slug: "nice-computer",
                price: 1000.99,
                quantity: 100,
                shipping: true,
              },
            ],
          },
        });
      } else if (url === "/api/v1/product/product-count") {
        return Promise.resolve({
          data: { total: 2 },
        });
      } else if (url === "/api/v1/category/get-category") {
        return Promise.resolve({
          data: {
            success: true,
            category: [],
          },
        });
      }
      // Default mock for other API calls
      return Promise.resolve({ data: {} });
    });

    axios.post.mockImplementation((url, data) => {
      // Mock get category call
      if (url === "/api/v1/product/product-filters") {
        if (
          data.radio[0] === radioSelected[0] &&
          data.radio[1] === radioSelected[1]
        ) {
          return Promise.resolve({
            data: {
              success: true,
              products: [
                {
                  _id: "2",
                  name: "Nice computer",
                  description: "A fast computer",
                  category: "2",
                  slug: "nice-computer",
                  price: 1000.99,
                  quantity: 100,
                  shipping: true,
                },
              ],
            },
          });
        }
      }
      // Default mock for other API calls
      return Promise.resolve({ data: {} });
    });

    // Act
    const { getByText, getByLabelText, queryByText } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    // Assert initial load
    await waitFor(() => {
      expect(getByText("Nice book")).toBeInTheDocument();
      expect(getByText("Nice computer")).toBeInTheDocument();
    });

    // Find radio using label
    const booksCheckbox = await waitFor(() => {
      return getByLabelText("$100 or more");
    });
    fireEvent.click(booksCheckbox);

    // Assert after filter
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/api/v1/product/product-filters",
        { checked: [], radio: [radioSelected[0], radioSelected[1]] }
      );

      expect(queryByText("Nice book")).not.toBeInTheDocument();
    });

    // Assert only one product is shown and loadmore button should not show despite total count is 2
    expect(getByText("Nice computer")).toBeInTheDocument();
    expect(queryByText("Loadmore")).not.toBeInTheDocument();
  });

  it("filter 1 product out of 2 using price and categories successfully", async () => {
    // Arrange
    const radioSelected = [40, 59]; // setup radio selected price
    const categorySelected = ["1"]; // setup category selected

    axios.get.mockImplementation((url) => {
      // Mock get category call
      if (url === "/api/v1/product/product-list/1") {
        return Promise.resolve({
          data: {
            success: true,
            products: [
              {
                _id: "1",
                name: "Nice book",
                description: "A bestselling book",
                category: "1",
                slug: "nice-book",
                price: 54.99,
                quantity: 200,
                shipping: true,
              },
              {
                _id: "2",
                name: "Nice computer",
                description: "A fast computer",
                category: "2",
                slug: "nice-computer",
                price: 1000.99,
                quantity: 100,
                shipping: true,
              },
            ],
          },
        });
      } else if (url === "/api/v1/product/product-count") {
        return Promise.resolve({
          data: { total: 2 },
        });
      } else if (url === "/api/v1/category/get-category") {
        return Promise.resolve({
          data: {
            success: true,
            category: [
              { _id: "1", name: "Books" },
              { _id: "2", name: "Electronics" },
            ],
          },
        });
      }
      // Default mock for other API calls
      return Promise.resolve({ data: {} });
    });

    axios.post.mockImplementation((url, data) => {
      // Mock get category call
      if (url === "/api/v1/product/product-filters") {
        if (
          data.radio[0] === radioSelected[0] &&
          data.radio[1] === radioSelected[1] &&
          data.checked[0] === categorySelected[0]
        ) {
          return Promise.resolve({
            data: {
              success: true,
              products: [
                {
                  _id: "1",
                  name: "Nice book",
                  description: "A bestselling book",
                  category: "1",
                  slug: "nice-book",
                  price: 54.99,
                  quantity: 200,
                  shipping: true,
                },
              ],
            },
          });
        }
      }
      // Default mock for other API calls
      return Promise.resolve({ data: {} });
    });

    // Act
    const { getByText, getByLabelText, queryByText } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    // Assert initial load
    await waitFor(() => {
      expect(getByText("Nice book")).toBeInTheDocument();
      expect(getByText("Nice computer")).toBeInTheDocument();
    });

    // Find radio using label
    const booksCheckbox = await waitFor(() => {
      return getByLabelText("$40 to 59");
    });
    fireEvent.click(booksCheckbox);
    fireEvent.click(getByLabelText("Books"));

    // Assert after filter
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/api/v1/product/product-filters",
        {
          checked: [categorySelected[0]],
          radio: [radioSelected[0], radioSelected[1]],
        }
      );

      expect(queryByText("Nice computer")).not.toBeInTheDocument();
    });

    // Assert only one product is shown and loadmore button should not show despite total count is 2
    expect(getByText("Nice book")).toBeInTheDocument();
    expect(queryByText("Loadmore")).not.toBeInTheDocument();
  });

  it("renders loadmore button", async () => {
    // Arrange for more than 1 page
    axios.get.mockImplementation((url) => {
      // Mock get category call
      if (url === "/api/v1/product/product-list/1") {
        return Promise.resolve({
          data: {
            success: true,
            products: [
              {
                _id: "1",
                name: "Nice book",
                description: "A bestselling book",
                slug: "nice-book",
                price: 54.99,
                quantity: 200,
                shipping: true,
              },
              {
                _id: "2",
                name: "Nice computer",
                description: "A fast computer",
                slug: "nice-computer",
                price: 1000.99,
                quantity: 100,
                shipping: true,
              },
            ],
          },
        });
      } else if (url === "/api/v1/product/product-list/2") {
        return Promise.resolve({
          data: {
            success: true,
            products: [
              {
                _id: "3",
                name: "Nice phone",
                description: "A minimalistic phone",
                slug: "nice-phone",
                price: 500.99,
                quantity: 100,
                shipping: true,
              },
            ],
          },
        });
      } else if (url === "/api/v1/product/product-count") {
        return Promise.resolve({
          data: { total: 3 },
        });
      }
      // Default mock for other API calls
      return Promise.resolve({ data: {} });
    });

    // Act
    const { getByText } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/product-count");

      // Assert loadmore button is present
      expect(getByText("Loadmore")).toBeInTheDocument();
    });
  });

  it("loadmore button gets second page successfully", async () => {
    // Arrange for more than 1 page
    axios.get.mockImplementation((url) => {
      // Mock get category call
      if (url === "/api/v1/product/product-list/1") {
        return Promise.resolve({
          data: {
            success: true,
            products: [
              {
                _id: "1",
                name: "Nice book",
                description: "A bestselling book",
                slug: "nice-book",
                price: 54.99,
                quantity: 200,
                shipping: true,
              },
              {
                _id: "2",
                name: "Nice computer",
                description: "A fast computer",
                slug: "nice-computer",
                price: 1000.99,
                quantity: 100,
                shipping: true,
              },
            ],
          },
        });
      } else if (url === "/api/v1/product/product-list/2") {
        return Promise.resolve({
          data: {
            success: true,
            products: [
              {
                _id: "3",
                name: "Nice phone",
                description: "A minimalistic phone",
                slug: "nice-phone",
                price: 500.99,
                quantity: 100,
                shipping: true,
              },
            ],
          },
        });
      } else if (url === "/api/v1/product/product-count") {
        return Promise.resolve({
          data: { total: 3 },
        });
      }
      // Default mock for other API calls
      return Promise.resolve({ data: {} });
    });

    // Act
    const { getByText } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/product-count");

      // Assert loadmore button is present
      expect(getByText("Loadmore")).toBeInTheDocument();
    });

    fireEvent.click(getByText("Loadmore"));

    await waitFor(() => {
      // Assert loadmore button works
      expect(getByText("Nice phone")).toBeInTheDocument();
    });
  });
});
