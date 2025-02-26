import { expect, jest } from "@jest/globals";
import orderModel from "../models/orderModel.js";
import {
  getOrdersController,
  getAllOrdersController,
  orderStatusController,
} from "./authController.js";

describe("GetOrders Controller test", () => {
  let req, res;
  let mockedOrders;

  beforeEach(() => {
    const buyerId = "33333";
    req = {
      user: { _id: buyerId },
      body: {
        name: "John Doe",
        email: "john.doe@example.com",
        password: "password123",
        phone: "12344000",
        address: "123 Street",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };

    mockedOrders = [
      {
        _id: "order1",
        products: ["product1", "product2"],
        buyer: buyerId,
      },
      {
        _id: "order2",
        products: ["product3"],
        buyer: buyerId,
      },
    ];
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return orders if successfully", async () => {
    orderModel.find = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockedOrders),
      }),
    });

    await getOrdersController(req, res);
    expect(orderModel.find).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(mockedOrders);
  });

  test(
    "should return error on failure",
    async () => {
      const error = new Error("Error details here");
      orderModel.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockRejectedValue(error),
        }),
      });

      await getOrdersController(req, res);

      expect(orderModel.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Error While Getting Orders",
        error,
      });
    }
  );
});


describe("GetAllOrders Controller test", () => {
  let req, res;
  let mockedOrders;

  beforeEach(() => {
    const buyerId = "33333";
    req = {
      user: { _id: buyerId },
      body: {
        name: "John Doe",
        email: "john.doe@example.com",
        password: "password123",
        phone: "12344000",
        address: "123 Street",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
    const now = new Date();
    const halfHourAgo = new Date(now.getTime() - (30 * 60 * 1000));
    mockedOrders = [
      {
        _id: "order1",
        products: ["product1", "product2"],
        buyer: buyerId,
        createdAt: now,
      },
      {
        _id: "order2",
        products: ["product3"],
        buyer: buyerId,
        createdAt: halfHourAgo,
      },
    ];
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return 200 if successful", async () => {
    orderModel.find = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockedOrders)
        })
      }),
    });

    await getAllOrdersController(req, res);
    expect(orderModel.find).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(mockedOrders);
  });

  test("should return error on failure", async () => {
    const error = new Error("Error details here");
    orderModel.find = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockRejectedValue(error),
        })
      }),
    });

    await getAllOrdersController(req, res);

    expect(orderModel.find).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error While Getting Orders",
      error,
    })
  })
});

describe("orderStatusController test", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {
        orderId: "33333",
      },
      body: {
        status: "shipped",
      },
    };

    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should update the order status", async () => {
    const updatedOrder = {
      _id: "33333",
      status: "shipped",
    };

    jest.spyOn(orderModel, "findByIdAndUpdate").mockResolvedValue(updatedOrder);

    await orderStatusController(req, res);

    expect(orderModel.findByIdAndUpdate).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(updatedOrder);
  });

  test(
    "should return error if error occurs during the update",
    async () => {
      const error = new Error("Update failed");
      jest.spyOn(orderModel, "findByIdAndUpdate").mockRejectedValue(error);

      await orderStatusController(req, res);

      expect(orderModel.findByIdAndUpdate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Error While Updating Order",
        error,
      });
    }
  );
});