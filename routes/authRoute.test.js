// Testing the communication between backend and database


import userModel from '../models/userModel.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import request from 'supertest';
import app from '../server.js';
import { MongoMemoryServer } from 'mongodb-memory-server';

dotenv.config();

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
  
    // Only connect if mongoose is not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }
  });

afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
    
});

describe('Auth Routes Integration Tests', () => {

  describe('POST /api/v1/auth/register', () => {

    test('should register a valid user', async () => {
      const reqBody = {
        name: 'John Doe',
        email: 'valid-test@example.com',
        password: 'passwordtest',
        phone: '33333333',
        address: 'Test street',
        answer: 'Valid Answer'
      };

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(reqBody);

      expect(res.statusCode).toBe(200);
    });

    test.failing('should not allow duplicate emails', async () => {
      const reqBody = {
        name: 'John Doe',
        email: 'valid-test@example.com',
        password: 'passwordtest',
        phone: '33333333',
        address: 'Test street',
        answer: 'Valid Answer'
      };

      await request(app)
        .post('/api/v1/auth/register')
        .send(reqBody);

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(reqBody);

      expect(res.statusCode).toBe(409); 
      expect(res.body.error).toBeDefined();
      expect(res.body.error).toContain('Email already exists');
    });

    test.failing('should fail if required fields are missing', async () => {
      const reqBody = {
        email: 'valid-test@example.com',
        password: 'passwordtest'
      };

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(reqBody);

      expect(res.statusCode).toBe(400); 
      expect(res.body.error).toBeDefined();
      expect(res.body.error).toContain('Name is required');
      expect(res.body.error).toContain('Phone is required');
      expect(res.body.error).toContain('Address is required');
      expect(res.body.error).toContain('Answer is required');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    let uniqueEmail = `${Date.now()}@gmail.com`
    beforeEach(async () => {
      // Register a user to test login functionality
      await request(app)
        .post('/api/v1/auth/register')
        .send({
            name: 'John Doe',
            email: uniqueEmail,
            password: 'passwordtest',
            phone: '33333333',
            address: 'Test street',
            answer: 'Valid Answer'
        });
    });

    test('should log in successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: uniqueEmail,
          password: 'passwordtest',
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("login successfully");
      expect(res.body.user).toBeDefined();
    });

    test.failing('should return error with incorrect password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login@example.com',
          password: 'WrongPassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid email or password");
    });

    test('should return error when logging in with non-existent email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password1234',
        });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Email is not registerd");
    });

    test.failing('should return error if email or password is missing', async () => {
      let res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          password: 'Password1234',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Email and password are required");

      res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login@example.com',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Email and password are required");
    });
  });

  describe('POST /api/v1/auth/forgot-password', () => {
    let uniqueEmail = `${Date.now()}@gmail.com`
    const user = {
      name: 'John Doe',
      email: uniqueEmail,
      password: 'passwordtest',
      phone: '33333333',
      address: 'Test street',
      answer: 'Valid Answer'
    }
    const newPassword = "newPassword";
    beforeEach(async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send(user);
    });

    test('should reset password successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({
          email: user.email,
          answer: user.answer,
          newPassword: newPassword
        })

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Password Reset Successfully");

      const check = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: user.email,
          password: newPassword,
        });
      expect(check.status).toBe(200);
      expect(check.body.message).toBe("login successfully");
    })

    test('should return 404 if user is not found', async () => {
      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({
          email: "notanemail",
          answer: user.answer,
          newPassword: newPassword,
        })

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Wrong Email Or Answer");
    })
  })
});