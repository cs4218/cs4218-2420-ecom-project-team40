import React from 'react';
import { render, waitFor, act } from '@testing-library/react';
import "@testing-library/jest-dom/extend-expect";
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import ProductDetails from './ProductDetails';

jest.mock('axios');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ slug: 'test-product' }),
  useNavigate: () => jest.fn(),
}));

jest.mock(
  "./../components/Layout",
  () => ({ children, ...props }) =>
  <div {...props}>{children}</div>
);

const mockProduct = {
  _id: '123',
  name: 'Test Product',
  description: 'Test Description',
  price: 99.99,
  category: { _id: '456', name: 'Test Category' },
  slug: 'test-product'
};

const mockRelatedProducts = [
  {
    _id: '789',
    name: 'Related Product',
    description: 'Related Description',
    price: 79.99,
    slug: 'related-product'
  }
];

describe('ProductDetails Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    const { getByText } = render(
      <BrowserRouter>
        <ProductDetails />
      </BrowserRouter>
    );
    expect(getByText('Product Details')).toBeInTheDocument();
  });

  test('fetches and displays product details', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('get-product')) {
        return Promise.resolve({ data: { product: mockProduct } });
      }
      if (url.includes('related-product')) {
        return Promise.resolve({ data: { products: mockRelatedProducts } });
      }
    });

    const { getByText } = render(
      <BrowserRouter>
        <ProductDetails />
      </BrowserRouter>
    );

    // Wait for product details to load
    await waitFor(() => {
      expect(getByText(`Name : ${mockProduct.name}`)).toBeInTheDocument();
      expect(getByText(`Description : ${mockProduct.description}`)).toBeInTheDocument();
      expect(getByText(`Category : ${mockProduct.category.name}`)).toBeInTheDocument();
    });
  });

  test('displays error message when no similar products found', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('get-product')) {
        return Promise.resolve({ data: { product: mockProduct } });
      }
      if (url.includes('related-product')) {
        return Promise.resolve({ data: { products: [] } });
      }
      return Promise.resolve({ data: {} });
    });

    const { getByText } = await act(async () => render(
      <BrowserRouter>
        <ProductDetails />
      </BrowserRouter>
    ));

    await waitFor(() => {
      expect(getByText('No Similar Products found')).toBeInTheDocument();
    });
  });

  test('handles API error gracefully', async () => {
    // Mock API error
    axios.get.mockRejectedValue(new Error('API Error'));

    const { getByText } = render(
      <BrowserRouter>
        <ProductDetails />
      </BrowserRouter>
    );

    // Component should not crash
    await waitFor(() => {
      expect(getByText('Product Details')).toBeInTheDocument();
    });
  });
});