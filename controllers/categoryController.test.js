import { jest } from "@jest/globals";
import {
  createCategoryController,
  updateCategoryController,
  categoryControlller,
  singleCategoryController,
  deleteCategoryCOntroller,
} from "./categoryController";
import categoryModel from "../models/categoryModel";
import slugify from "slugify";

jest.mock("../models/categoryModel.js"); // Mock all categoryModel functions and properties
jest.mock("slugify", () => jest.fn((name) => name.toLowerCase().replace(/\s+/g, "-"))); // Mock slugify function

describe("Category Controller Tests", () => {
  let req, res;

  beforeEach(() => { // Reset all mocks, clean req and res for each test
    jest.clearAllMocks();
    req = { body: { name: "Electronics" }, params: { id: "category123", slug: "electronics" } };
    res = { status: jest.fn().mockReturnThis(), send: jest.fn(), json: jest.fn() };
  });

  describe("Create Category Controller", () => {
    test("should return error when name is missing", async () => {
      req.body.name = "";
      await createCategoryController(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith({ message: "Name is required" });
    });

    test("should return error when category already exists", async () => {
      categoryModel.findOne = jest.fn().mockResolvedValue({ name: "Electronics" });
      await createCategoryController(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ success: true, message: "Category Already Exisits" });
    });

    test("should create a new category successfully", async () => {
      categoryModel.findOne = jest.fn().mockResolvedValue(null);
      categoryModel.prototype.save = jest.fn().mockResolvedValue(req.body);
      await createCategoryController(req, res);
      expect(categoryModel.prototype.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith({ success: true, message: "new category created", category: req.body });
    });
  });

  describe("Update Category Controller", () => {
    test("should update category successfully", async () => {
      categoryModel.findByIdAndUpdate = jest.fn().mockResolvedValue({ name: "Updated Name", slug: "updated-name" });
      await updateCategoryController(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ success: true, messsage: "Category Updated Successfully", category: { name: "Updated Name", slug: "updated-name" } });
    });
  });

  describe("Get All Categories Controller", () => {
    test("should return all categories", async () => {
      categoryModel.find = jest.fn().mockResolvedValue([{ name: "Electronics" }, { name: "Furniture" }]);
      await categoryControlller(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ success: true, message: "All Categories List", category: [{ name: "Electronics" }, { name: "Furniture" }] });
    });
  });

  describe("Get Single Category Controller", () => {
    test("should return a single category", async () => {
      categoryModel.findOne = jest.fn().mockResolvedValue({ name: "Electronics", slug: "electronics" });
      await singleCategoryController(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ success: true, message: "Get SIngle Category SUccessfully", category: { name: "Electronics", slug: "electronics" } });
    });
  });

  describe("Delete Category Controller", () => {
    test("should delete category successfully", async () => {
      categoryModel.findByIdAndDelete = jest.fn().mockResolvedValue(true);
      await deleteCategoryCOntroller(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ success: true, message: "Categry Deleted Successfully" });
    });
  });
});
