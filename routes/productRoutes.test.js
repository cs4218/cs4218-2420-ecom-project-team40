import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import dotenv from 'dotenv';
import request from 'supertest';
import app from '../server.js';
import productModel from '../models/productModel.js';
import categoryModel from '../models/categoryModel.js';
import userModel from '../models/userModel.js';
import bcrypt from "bcrypt";

dotenv.config();

let mongoServer;
let adminToken;
let testCategory;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
  await userModel.deleteMany({});
  await productModel.deleteMany({});
  await categoryModel.deleteMany({});

  // Create admin user and get token
  await userModel.create({
    name: "Admin User",
    email: "admin@test.com",
    password: await bcrypt.hash("password", 10),
    phone: '1234',
    address: 'Kent Ridge NUS',
    answer: 'testing',
    role: 1
  });
  
  const loginRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: "admin@test.com", password: "password" });
  adminToken = loginRes.body.token;
  testCategory = await categoryModel.create({
    name: "Test Category",
    slug: "test-category"
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await productModel.deleteMany({});
});

const createProduct = async (productData) => {
  return request(app)
    .post('/api/v1/product/create-product')
    .set('Authorization', `${adminToken}`)
    .attach('photo', 'routes/test/a1.png')
    .field('name', productData.name)
    .field('slug', productData.slug)
    .field('description', productData.description)
    .field('price', productData.price)
    .field('category', productData.category.toString())
    .field('quantity', productData.quantity)
    .field('shipping', productData.shipping);
};

const getProductBySlug = async (slug) => {
  return request(app)
    .get(`/api/v1/product/get-product/${slug}`);
};

const getAllProducts = async () => {
  return request(app)
    .get('/api/v1/product/get-product');
};

describe('Product Creation and Retrieval', () => {
  test('should create a product and retrieve it by slug', async () => {
    const productData = {
      name: "Test Product",
      slug: "Test-Product",
      description: "This is a test product",
      price: 100,
      category: testCategory._id,
      quantity: 10,
      shipping: false
    };

    // Create the product
    const createResponse = await createProduct(productData);
    const { products: { slug }} = createResponse.body
    expect(createResponse.statusCode).toBe(201);
    expect(createResponse.body.products).toHaveProperty('_id');
    
    // Retrieve the product by slug
    const getResponse = await getProductBySlug(slug);
    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.body.product.name).toBe(productData.name);
    expect(getResponse.body.product.slug).toBe('Test-Product');
  });

  test('should return null product when trying to get non-existent product', async () => {
    const res = await request(app).get('/api/v1/product/get-product/non-existent-slug');
    expect(res.statusCode).toBe(200);
    expect(res.body.product).toBeNull();
  });

  test('should create a product and verify count in the list of products', async () => {
    const productData = {
      name: "Test Product 2",
      slug: "Test Product 2",
      description: "This is another test product",
      price: 100,
      category: testCategory._id,
      quantity: 10,
      shipping: false
    };

    const productData2 = {
      name: "Test Product 2",
      slug: "Test Product 2",
      description: "This is another test product",
      price: 100,
      category: testCategory._id,
      quantity: 10,
      shipping: false
    };

    // Create the product
    const createResponse = await createProduct(productData);
    const createResponse2 = await createProduct(productData2);
    expect(createResponse.statusCode).toBe(201);
    expect(createResponse2.statusCode).toBe(201);

    // Retrieve all products
    const getAllResponse = await getAllProducts();
    expect(getAllResponse.statusCode).toBe(200);
    expect(getAllResponse.body.products.length).toBe(2);
    expect(getAllResponse.body.products[0].name).toBe(productData.name);
  });
});

describe('Create Product negative tests with missing fields', () => {
  const baseData = {
    name: "Test Product",
    slug: "Test-product",
    description: "Missing field test",
    price: 100,
    category: 123,
    quantity: 10,
    shipping: false
  };

  test('should return error when name is missing', async () => {
    const res = await request(app)
      .post('/api/v1/product/create-product')
      .set('Authorization', `${adminToken}`)
      .attach('photo', '/Users/weijieong/Documents/MyProjects/CS4218 MERN/routes/test/a1.png')
      .field('description', baseData.description)
      .field('price', baseData.price)
      .field('category', baseData.category.toString())
      .field('quantity', baseData.quantity)
      .field('shipping', baseData.shipping);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/Name is Required/);
  });

  test('should return error when description is missing', async () => {
    const res = await request(app)
      .post('/api/v1/product/create-product')
      .set('Authorization', `${adminToken}`)
      .attach('photo', '/Users/weijieong/Documents/MyProjects/CS4218 MERN/routes/test/a1.png')
      .field('name', baseData.name)
      .field('price', baseData.price)
      .field('category', baseData.category.toString())
      .field('quantity', baseData.quantity)
      .field('shipping', baseData.shipping);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/Description is Required/);
  });

  test('should return error when price is missing', async () => {
    const res = await request(app)
      .post('/api/v1/product/create-product')
      .set('Authorization', `${adminToken}`)
      .attach('photo', '/Users/weijieong/Documents/MyProjects/CS4218 MERN/routes/test/a1.png')
      .field('name', baseData.name)
      .field('description', baseData.description)
      .field('category', baseData.category.toString())
      .field('quantity', baseData.quantity)
      .field('shipping', baseData.shipping);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/Price is Required/);
  });

  test('should return error when category is missing', async () => {
    const res = await request(app)
      .post('/api/v1/product/create-product')
      .set('Authorization', `${adminToken}`)
      .attach('photo', '/Users/weijieong/Documents/MyProjects/CS4218 MERN/routes/test/a1.png')
      .field('name', baseData.name)
      .field('description', baseData.description)
      .field('price', baseData.price)
      .field('quantity', baseData.quantity)
      .field('shipping', baseData.shipping);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/Category is Required/);
  });

  test('should return error when quantity is missing', async () => {
    const res = await request(app)
      .post('/api/v1/product/create-product')
      .set('Authorization', `${adminToken}`)
      .attach('photo', '/Users/weijieong/Documents/MyProjects/CS4218 MERN/routes/test/a1.png')
      .field('name', baseData.name)
      .field('description', baseData.description)
      .field('price', baseData.price)
      .field('category', baseData.category.toString())
      .field('shipping', baseData.shipping);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/Quantity is Required/);
  });

  test('should return error when photo is too large (mocked)', async () => {
    const res = await request(app)
      .post('/api/v1/product/create-product')
      .set('Authorization', `${adminToken}`)
      // Manually mock large photo size via buffer
      .attach('photo', Buffer.alloc(1_100_000), {
        filename: 'large.png',
        contentType: 'image/png',
      })
      .field('name', baseData.name)
      .field('description', baseData.description)
      .field('price', baseData.price)
      .field('category', baseData.category.toString())
      .field('quantity', baseData.quantity)
      .field('shipping', baseData.shipping);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/should be less then 1mb/);
  });
});

describe('Update Product', () => {
  test('should update a product', async () => {
    const productData = {
      name: "Test Product",
      slug: "Test-Product",
      description: "This is a test product",
      price: 100,
      category: testCategory._id,
      quantity: 10,
      shipping: false
    };
    const createResponse = await createProduct(productData);
    const createdProductId = createResponse.body.products._id;

    const res = await request(app)
      .put(`/api/v1/product/update-product/${createdProductId}`)
      .set('Authorization', `${adminToken}`)
      .field('name', 'Updated Name')
      .field('name', 'Updated Name')
      .field('description', 'Updated description')
      .field('price', 120)
      .field('category', testCategory._id.toString())
      .field('quantity', 15)
      .field('shipping', false);

    expect(res.statusCode).toBe(201);
    expect(res.body.products.name).toBe('Updated Name');
  });

  test('should fail to update product with missing fields', async () => {
    const productData = {
      name: "Test Product",
      slug: "Test-Product",
      description: "This is a test product",
      price: 100,
      category: testCategory._id,
      quantity: 10,
      shipping: false
    };
    const product = await createProduct(productData);

    const res = await request(app)
      .put(`/api/v1/product/update-product/${product.body.products._id}`)
      .set('Authorization', `${adminToken}`)
      .field('description', 'No description provided');

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/Name is Required/);
  });

});


describe('Delete Product', () => {
  test('should delete a product', async () => {
    const created = await createProduct({
      name: "Test Product",
      slug: "Test Product",
      description: "This is a test product",
      price: 100,
      category: testCategory._id,
      quantity: 10,
      shipping: false
    });

    const createdProductId = created.body.products._id;
    const createdProductSlug = created.body.products.slug;

    const deleteResponse = await request(app)
      .delete(`/api/v1/product/delete-product/${createdProductId}`)
      .set('Authorization', `${adminToken}`);
    expect(deleteResponse.statusCode).toBe(200);

    const getResponse = await request(app)
      .get(`/api/v1/product/get-product/${createdProductSlug}`);
    expect(getResponse.body.product).toBeNull();
  });

  test('should fail when deleting non-existent product', async () => {
    const res = await request(app)
      .delete(`/api/v1/product/delete-product/143214`)
      .set('Authorization', `${adminToken}`);
    expect(res.statusCode).toBe(500);
  });
});

describe('Paginated Product List', () => {
  test('should return paginated list of products', async () => {
    const productData1 = {
      name: "Test Product 1",
      slug: "Test Product 1",
      description: "This is a test product",
      price: 100,
      category: testCategory._id,
      quantity: 10,
      shipping: true
    }
    const productData2 = {
      name: "Test Product 2",
      slug: "Test Product 2",
      description: "This is a test product",
      price: 100,
      category: testCategory._id,
      quantity: 10,
      shipping: true
    }
    await createProduct(productData1);
    await createProduct(productData2);

    const res = await request(app).get('/api/v1/product/product-list/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.products.length).toBe(2);
  });

  test('should return empty list if no products', async () => {
    const res = await request(app).get('/api/v1/product/product-list/10');
    expect(res.statusCode).toBe(200);
    expect(res.body.products).toEqual([]);
  });
});

describe('Search Product', () => {
  test('should return matching products with keyword', async () => {
    await createProduct({
      name: "Test Product 1",
      slug: "Test Product 1",
      description: "This is a test product",
      price: 100,
      category: testCategory._id,
      quantity: 10,
      shipping: true
    });

    const res = await request(app).get('/api/v1/product/search/Product');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
  });

  test('should return empty array for unmatched keyword', async () => {
    const res = await request(app).get('/api/v1/product/search/fake');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(0);
  });
});

describe('Filter Product', () => {
  test('should filter products by category and price', async () => {
    await createProduct({
      name: "Filter Test",
      slug: "Filter Test",
      description: "Filtering",
      price: 101,
      category: testCategory._id,
      quantity: 10,
      shipping: false
    });

    await createProduct({
      name: "Filter Test",
      slug: "Filter Test",
      description: "Filtering",
      price: 300,
      category: testCategory._id,
      quantity: 10,
      shipping: false
    });

    const res = await request(app)
      .post('/api/v1/product/product-filters')
      .send({
        checked: [testCategory._id],
        radio: [100, 200]
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.products.length).toBe(1);
  });

  test('should return empty list for unmatched filter', async () => {
    const res = await request(app)
      .post('/api/v1/product/product-filters')
      .send({ checked: [testCategory._id], radio: [100, 200] });

    expect(res.statusCode).toBe(200);
    expect(res.body.products.length).toBe(0);
  });
});

describe('Related Products', () => {
  test('should return related products from same category', async () => {
    const productData = await createProduct({
      name: "Test Product",
      slug: "Test Product",
      description: "This is a test product",
      price: 100,
      category: testCategory._id,
      quantity: 10,
      shipping: false
    });

    await createProduct({
      name: "Test Product",
      slug: "Test Product",
      description: "This is a test product",
      price: 100,
      category: testCategory._id,
      quantity: 10,
      shipping: true
    });

    const mainProductId = productData.body.products._id;

    const res = await request(app)
      .get(`/api/v1/product/related-product/${mainProductId}/${testCategory._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.products.length).toBeGreaterThan(0);
  });

  test('should return an error if wrong product id specified', async () => {
    const res = await request(app)
      .get(`/api/v1/product/related-product/123/${testCategory._id}`);
    expect(res.statusCode).toBe(400);
    expect(res.body.products).toBeNull;
  });
});

describe('Category Wise Products', () => {
  test('should return products by category', async () => {
    await createProduct({
      name: "Test Product",
      slug: "Test Product",
      description: "This is a test product",
      price: 100,
      category: testCategory._id,
      quantity: 10,
      shipping: false
    });

    await createProduct({
      name: "Test Product 2",
      slug: "Test Product 2",
      description: "This is a test product",
      price: 100,
      category: testCategory._id,
      quantity: 10,
      shipping: false
    });

    const res = await request(app)
      .get(`/api/v1/product/product-category/${testCategory.slug}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.products.length).toBe(2);
    expect(res.body.category.name).toBe("Test Category");
  });

  test('should return null value for invalid category slug', async () => {
    const res = await request(app)
      .get('/api/v1/product/product-category/invalid-slug');
    expect(res.body.category).toBeNull();
  });
});

describe('Product Count', () => {
  test('should return total number of products', async () => {
    await createProduct({
      name: "Test Product",
      slug: "Test Product",
      description: "This is a test product",
      price: 100,
      category: testCategory._id,
      quantity: 10,
      shipping: true
    });

    await createProduct({
      name: "Test Product 2",
      slug: "Test Product",
      description: "This is a test product",
      price: 100,
      category: testCategory._id,
      quantity: 10,
      shipping: true
    });

    await createProduct({
      name: "Test Product 3",
      slug: "Test Product",
      description: "This is a test product",
      price: 100,
      category: testCategory._id,
      quantity: 10,
      shipping: true
    });

    const res = await request(app).get('/api/v1/product/product-count');
    expect(res.statusCode).toBe(200);
    expect(res.body.total).toBe(3);
  });

  test('should return 0 if no products exist', async () => {
    const res = await request(app).get('/api/v1/product/product-count');
    expect(res.statusCode).toBe(200);
    expect(res.body.total).toBe(0);
  });
});
