import { act, renderHook } from "@testing-library/react";
import { useCart, CartProvider } from "./cart";
 
Object.defineProperty(window, "localStorage", {
	value: {
		setItem: jest.fn(),
		getItem: jest.fn(),
		removeItem: jest.fn(),
		clear: jest.fn(),
	},
	writable: true,
});

describe("CartProvider Component", () => {
	beforeEach(() => {
		localStorage.clear();
		jest.clearAllMocks();
	});

	it("initializes cart state with empty array", () => {
		// credits to https://vaskort.medium.com/how-to-unit-test-your-custom-react-hook-with-react-testing-library-and-jest-8bdefafdc8a2
		const { result } = renderHook(() => useCart(), {
			wrapper: CartProvider,
		});

		expect(result.current[0]).toEqual([]);
	});

	it("loads data from localStorage", () => {
		const mockCartData = [{ id: 1, name: "TestProduct", price: 100 }];
		localStorage.getItem.mockReturnValue(JSON.stringify(mockCartData));

		const { result } = renderHook(() => useCart(), {
			wrapper: CartProvider,
		});

		expect(localStorage.getItem).toHaveBeenCalledWith("cart");
		expect(result.current[0]).toEqual(mockCartData);
	});

	it("update cart with additional purchases", () => {
		const mockCartData = [{ id: 1, name: "TestProduct", price: 100 }];
		localStorage.getItem.mockReturnValue(JSON.stringify(mockCartData));

		const { result } = renderHook(() => useCart(), {
			wrapper: CartProvider,
		});

		expect(localStorage.getItem).toHaveBeenCalledWith("cart");
		expect(result.current[0]).toEqual(mockCartData);

		const mockNewCartData = [
			{ id: 2, name: "TestNewProduct2", price: 200 },
		];

		act(() => {
			result.current[1]([...result.current[0], ...mockNewCartData]);
		});

		const supposedUpdatedData = [
			{ id: 1, name: "TestProduct", price: 100 },
			{ id: 2, name: "TestNewProduct2", price: 200 },
		];	

		expect(result.current[0]).toEqual(supposedUpdatedData);
	});
});
