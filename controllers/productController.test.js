import { 
createProductController, 
getProductController, 
getSingleProductController, 
productPhotoController,
deleteProductController,
updateProductController,
productFiltersController,
productCountController,
productListController,
searchProductController,
realtedProductController,
productCategoryController,
brainTreePaymentController,
braintreeTokenController
} from './productController';
import productModel from '../models/productModel';
import categoryModel from '../models/categoryModel';
import orderModel from "../models/orderModel.js";
import fs from 'fs';
import slugify from 'slugify';

jest.mock('../models/productModel');
jest.mock('../models/categoryModel');
jest.mock('../models/orderModel.js')
jest.mock('fs');
jest.mock('slugify');
jest.mock('braintree', () => {
  return {
    BraintreeGateway: jest.fn(() => {
      return {
        transaction : {
          sale: jest.fn((options, callback) => {
            callback(null, { success: true, transaction: { id: 'test-transaction-id' } })
          })
        },
        clientToken: {
          generate: jest.fn((options, callback) => {
            callback(null, { clientToken: 'test-client-token' });
          })
        }
      }
    }),
    Environment: {
      Sandbox: 'test-sandbox'
    }

  };
});

//Test creating products
describe('createProductController', () => {
  let req, res, mockProduct;

  beforeEach(() => {
    mockProduct = { 
      photo: { data: "test", contentType: "image/jpeg" }, 
      save: jest.fn().mockResolvedValue(true) 
    }
    productModel.mockImplementation(() => mockProduct);
  
    slugify.mockReturnValue('test-product');
    
    req = {
      fields: {
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        category: 'Test Category',
        quantity: 10,
        shipping: true,
      },
      files: {
        photo: {
          path: 'path/to/photo',
          type: 'image/jpeg',
          size: 500000,
        },
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  test('should create a product successfully', async () => {
    await createProductController(req, res);
    
    const successfulResponse = {
      success: true,
      message: 'Product Created Successfully',
      products: mockProduct,
    }

    expect(productModel).toHaveBeenCalledWith({
      ...req.fields,
      slug: 'test-product',
    });
    expect(fs.readFileSync).toHaveBeenCalledWith(req.files.photo.path);
    expect(mockProduct.photo.contentType).toBe(req.files.photo.type);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith(successfulResponse);
  });

  test('should return an error if name is missing', async () => {
    req.fields.name = '';

    await createProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: 'Name is Required' });
  });

  test('should return an error if description is missing', async () => {
    req.fields.description = '';

    await createProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: 'Description is Required' });
  });

  test('should return an error if price is missing', async () => {
    req.fields.price = '';

    await createProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: 'Price is Required' });
  });

  test('should return an error if category is missing', async () => {
    req.fields.category = '';

    await createProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: 'Category is Required' });
  });

  test('should return an error if quantity is missing', async () => {
    req.fields.quantity = '';

    await createProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: 'Quantity is Required' });
  });

  test('should return an error if photo size exceeds limit', async () => {
    req.files.photo.size = 2000000;

    await createProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      error: 'photo is Required and should be less then 1mb',
    });
  });

  test('should return error if there are errors during product creation', async () => {
    const error = new Error('Database error')
    productModel.mockImplementation(() => {
      throw error;
    });
    await createProductController(req, res);

    const errorResponse = {
      success: false,
      error,
      message: 'Error in crearing product',
    }

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(errorResponse);
  });
});

//Test getting all products
describe('getProductController', () => {
  let req, res, mockProducts;

  beforeEach(() => {
    mockProducts = [{ name: 'test-product-1' }, { name: 'test-product-2' }];
    productModel.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(mockProducts),
    });

    req = { params: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  test('should return products successfully', async () => {
    await getProductController(req, res);

    const successfulReponse = {
      success: true,
      counTotal: mockProducts.length,
      message: "ALlProducts ",
      products: mockProducts,
    }
  
    expect(productModel.find).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(successfulReponse);
  });

  test('should handle errors when fetching products', async () => {
    const mockError = new Error('Database error');
    productModel.find.mockReturnValueOnce({
      populate: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockRejectedValue(mockError),
    });

    await getProductController(req, res);

    expect(productModel.find).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Erorr in getting products",
      error: mockError.message,
    });
  });
});

// Test getting of a single product
describe('getSingleProductController', () => {
  let req, res, mockProduct;

  beforeEach(() => {
    req = { params: { slug: 'test-product' } };
    res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    mockProduct = { name: 'Test Product', category: 'Test Category' };

    productModel.findOne.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue(mockProduct),
    });
  });

  test('should return a single product successfully', async () => {
    await getSingleProductController(req, res);

    expect(productModel.findOne).toHaveBeenCalledWith({ slug: 'test-product' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: 'Single Product Fetched',
      product: mockProduct
    })
  });

  test('should handle database errors', async () => {
    productModel.findOne.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      populate: jest.fn().mockRejectedValue(new Error('Database error')),
    });

    await getSingleProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: 'Eror while getitng single product',
      error: new Error('Database error'),
    });
  });
});

//Test getting photo
describe('productPhotoController', () => {
  let req, res, mockProduct;

  beforeEach(() => {
    req = { params: { pid: '123' } };
    res = { status: jest.fn().mockReturnThis(), send: jest.fn(), set: jest.fn() };

    mockProduct = {
      photo: {
        data: Buffer.from('fake image data'),
        contentType: 'image/jpeg',
      },
    };

    productModel.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockProduct),
    });
  });

  test('should return the product photo successfully', async () => {
    await productPhotoController(req, res);

    expect(productModel.findById).toHaveBeenCalledWith('123');
    expect(res.set).toHaveBeenCalledWith('Content-type', 'image/jpeg');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(mockProduct.photo.data);
  });

  test('should return an error when photo data is missing', async () => {
    productModel.findById.mockReturnValueOnce({
      select: jest.fn().mockResolvedValue({ photo: {} }),
    });

    await productPhotoController(req, res);

    expect(res.status).not.toHaveBeenCalledWith(200);
    expect(res.send).not.toHaveBeenCalled();
  });

  test('should handle database errors', async () => {
    productModel.findById.mockReturnValueOnce({
      select: jest.fn().mockRejectedValue(new Error('Database error')),
    });

    await productPhotoController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: 'Erorr while getting photo',
      error: new Error('Database error'),
    });
  });
});

//Test deleting prodcts 
describe('deleteProductController', () => {
  let req, res;

  beforeEach(() => {
    req = { params: { pid: '123' } };
    res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    productModel.findByIdAndDelete.mockReturnValue({
      select: jest.fn()
    });
  });

  test('should delete a product successfully', async () => {
    await deleteProductController(req, res);

    expect(productModel.findByIdAndDelete).toHaveBeenCalledWith('123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: 'Product Deleted successfully',
    });
  });

  test('should handle database errors', async () => {
    productModel.findByIdAndDelete.mockReturnValue({
      select: jest.fn().mockRejectedValue(new Error('Database error'))
    });

    await deleteProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: 'Error while deleting product',
      error: new Error('Database error'),
    });
  });
});

// Test updating product 
describe('updateProductController', () => {
  let res, mockProduct;
  let req = {
    params: { pid: '123' },
    fields: {
      name: 'Updated Product',
      description: 'Updated Description',
      price: 200,
      category: 'Updated Category',
      quantity: 5,
      shipping: true,
    },
    files: {},
  };

  beforeEach(() => {
    mockProduct = {
      save: jest.fn().mockResolvedValue(true),
      photo: { data: '', contentType: '' },
    };

    productModel.findByIdAndUpdate.mockResolvedValue(mockProduct);
    slugify.mockReturnValue('updated-product');

    req = {
      params: { pid: '123' },
      fields: {
        name: 'Updated Product',
        description: 'Updated Description',
        price: 200,
        category: 'Updated Category',
        quantity: 5,
        shipping: true,
      },
      files: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  test('should update a product successfully', async () => {
    await updateProductController(req, res);
    expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith(
      '123',
      { ...req.fields, slug: 'updated-product' },
      { new: true }
    );

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: 'Product Updated Successfully',
      products: mockProduct,
    });
  });

  test.each([
    ['name', { ...req.fields, name: '' }, 'Name is Required'],
    ['description', { ...req.fields, description: '' }, 'Description is Required'],
    ['price', { ...req.fields, price: '' }, 'Price is Required'],
    ['category', { ...req.fields, category: '' }, 'Category is Required'],
    ['quantity', { ...req.fields, quantity: '' }, 'Quantity is Required'],
  ])('should return an error if %s is missing', async (_, updatedFields, expectedError) => {
    req.fields = updatedFields;

    await updateProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: expectedError });
  });

  test('should return an error if photo size exceeds limit', async () => {
    req.files.photo = { path: 'path/to/photo', type: 'image/jpeg', size: 2000000 };

    await updateProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      error: 'photo is Required and should be less then 1mb',
    });
  });

  test('should update photo if provided', async () => {
    req.files.photo = { path: 'path/to/photo', type: 'image/jpeg', size: 500000 };
    fs.readFileSync.mockReturnValue('fake_image_data');

    await updateProductController(req, res);

    expect(fs.readFileSync).toHaveBeenCalledWith('path/to/photo');
    expect(mockProduct.photo.data).toBe('fake_image_data');
    expect(mockProduct.photo.contentType).toBe('image/jpeg');
  });

  test('should return an error if database update fails', async () => {
    productModel.findByIdAndUpdate.mockRejectedValue(new Error('Database error'));

    await updateProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: new Error('Database error'),
      message: 'Error in Updte product',
    });
  });
});


// Test product filter 
describe('productFiltersController', () => {
  let req, res, mockProducts;

  beforeEach(() => {
    req = { body: { checked: [], radio: [] } };
    res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    mockProducts = [
      { name: 'Product A', price: 100 },
      { name: 'Product B', price: 200 },
    ];
  });

  test('should return filtered products successfully when categories are selected', async () => {
    req.body.checked = ['category1', 'category2'];
    productModel.find.mockResolvedValue(mockProducts);

    await productFiltersController(req, res);

    expect(productModel.find).toHaveBeenCalledWith({ category: ['category1', 'category2'] });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      products: mockProducts,
    });
  });

  test('should return filtered products successfully when price range is selected', async () => {
    req.body.radio = [123, 456];
    productModel.find.mockResolvedValue(mockProducts);

    await productFiltersController(req, res);

    expect(productModel.find).toHaveBeenCalledWith({ price: { $gte: 123, $lte: 456 } });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('should return filtered products successfully when both category and price filters are applied', async () => {
    req.body.checked = ['category1', 'category2'];
    req.body.radio = [123, 456];

    productModel.find.mockResolvedValue(mockProducts);

    await productFiltersController(req, res);

    expect(productModel.find).toHaveBeenCalledWith({
      category: ['category1', 'category2'],
      price: { $gte: 123, $lte: 456 },
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('should return an error when database query fails', async () => {
    productModel.find.mockRejectedValue(new Error('Database error'));

    await productFiltersController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: 'Error WHile Filtering Products',
      error: new Error('Database error'),
    });
  });
});

//Test product count
describe('productCountController', () => {
  let req, res;

  beforeEach(() => {
    productModel.find.mockReturnValue({
      estimatedDocumentCount: jest.fn().mockResolvedValue(123),
    });
    req = {};
    res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
  });

  test('should return the total product count successfully', async () => {
    await productCountController(req, res);

    expect(productModel.find).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      total: 123,
    });
  });

  test('should return an error if database query fails', async () => {
    productModel.find.mockReturnValue({
      estimatedDocumentCount: jest.fn().mockRejectedValue(new Error('Database error')),
    });

    await productCountController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      message: 'Error in product count',
      error: new Error('Database error'),
      success: false,
    });
  });
});

//Test product list controller
describe('productListController', () => {
  let req, res, mockProducts;

  beforeEach(() => {
    mockProducts = [
      { name: 'Product A', createdAt: new Date() },
      { name: 'Product B', createdAt: new Date() },
    ];
    productModel.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(mockProducts),
    });
    req = { params: { page: '2' } };
    res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
  });

  test('should return paginated products successfully', async () => {
    await productListController(req, res);

    expect(productModel.find).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      products: mockProducts,
    });
  });

  test('should default to page 1 if no page param is provided', async () => {
    req.params.page = undefined;
    await productListController(req, res);

    expect(productModel.find).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('should return an error when the database query fails', async () => {
    productModel.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockRejectedValue(new Error('Database error')),
    });

    await productListController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: 'error in per page ctrl',
      error: new Error('Database error'),
    });
  });
});

//Test searching product
describe('searchProductController', () => {
  let req, res, mockResults;

  beforeEach(() => {
    mockResults = [
      { name: 'Test Product A', description: 'This is a test product' },
      { name: 'Test Product B', description: 'Another test item' },
    ];
    productModel.find.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockResults),
    });
    req = { params: { keyword: 'test' } };
    res = { status: jest.fn().mockReturnThis(), send: jest.fn(), json: jest.fn() };
  });

  test('should return search results successfully', async () => {
    await searchProductController(req, res);

    expect(productModel.find).toHaveBeenCalledWith({
      $or: [
        { name: { $regex: 'test', $options: 'i' } },
        { description: { $regex: 'test', $options: 'i' } },
      ],
    });
    expect(res.json).toHaveBeenCalledWith(mockResults);
  });

  test('should return an empty array if no products match the keyword', async () => {
    productModel.find.mockReturnValue({
      select: jest.fn().mockResolvedValue([]),
    });

    await searchProductController(req, res);

    expect(res.json).toHaveBeenCalledWith([]);
  });

  test('should handle database errors', async () => {
    productModel.find.mockReturnValue({
      select: jest.fn().mockRejectedValue(new Error('Database error')),
    });

    await searchProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: 'Error In Search Product API',
      error: new Error('Database error'),
    });
  });
});

// Finding similar products
describe('realtedProductController', () => {
  let req, res, mockProducts;

  beforeEach(() => {
    mockProducts = [
      { name: 'Related Product 1', category: '456' },
      { name: 'Related Product 2', category: '456' },
    ];
    productModel.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue(mockProducts),
    });

    req = { params: { pid: '123', cid: '456' } };
    res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

  });

  test('should return related products successfully', async () => {
    await realtedProductController(req, res);

    expect(productModel.find).toHaveBeenCalledWith({
      category: '456',
      _id: { $ne: '123' },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      products: mockProducts,
    });
  });

  test('should return an empty array if no related products are found', async () => {
    productModel.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue([]),
    });

    await realtedProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      products: [],
    });
  });

  test('should handle database errors', async () => {
    productModel.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockRejectedValue(new Error('Database error')),
    });

    await realtedProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: 'error while geting related product',
      error: new Error('Database error'),
    });
  });
});

// Finding products given category
describe('productCategoryController', () => {
  let req, res, mockCategory, mockProducts;

  beforeEach(() => {
    mockCategory = { _id: '123', name: 'Electronics' };
    mockProducts = [
      { name: 'Product 1', category: '123' },
      { name: 'Product 2', category: '123' },
    ];
    categoryModel.findOne.mockResolvedValue(mockCategory);
    productModel.find.mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockProducts),
    });

    req = { params: { slug: 'electronics' } };
    res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
  });

  test('should return products for a specific category', async () => {
    await productCategoryController(req, res);

    expect(categoryModel.findOne).toHaveBeenCalledWith({ slug: 'electronics' });
    expect(productModel.find).toHaveBeenCalledWith({ category: mockCategory });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      category: mockCategory,
      products: mockProducts,
    });
  });

  test('should return an empty array if no products are found', async () => {
    productModel.find.mockReturnValue({
      populate: jest.fn().mockResolvedValue([]),
    })

    await productCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      category: mockCategory,
      products: []
    });
  });

  test('should return an error when the database fails', async () => {
    categoryModel.findOne.mockRejectedValue(new Error('Database error'));

    await productCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: new Error('Database error'),
      message: 'Error While Getting products',
    });
  });
});

describe('braintreeTokenController', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn((x) => x),
      send: jest.fn(),
    };
  });

  test('should generate a client token successfully', async () => {
    await braintreeTokenController(req, res);

    expect(res.send).toHaveBeenCalledWith({ clientToken: 'test-client-token' });
  });
});

describe('brainTreePaymentController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: {
        _id: "123456"
      },
      body: {
        nonce: 'fake-nonce',
        cart: [{ price: 123 }, { price: 456 }],
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
  });

  test('should process payment successfully', async () => {
    await brainTreePaymentController(req, res);

    expect(res.json).toHaveBeenCalledWith({ ok: true });
    expect(orderModel).toHaveBeenCalledWith({
      products: [{ price: 123 }, { price: 456 }],
      payment: { success: true, transaction: { id: 'test-transaction-id' } },
      buyer: "123456",
    });
  });
});