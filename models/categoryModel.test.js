import { mock } from "jest-mock-extended";
import categoryModel from "../models/categoryModel.js";

jest.mock("../models/categoryModel.js");

describe("Mocked Category Model Test", () => {
  test("should call save method when creating a new category", async () => {
    const mockCategory = mock();
    categoryModel.prototype.save = jest.fn().mockResolvedValue(mockCategory);

    const newCategory = new categoryModel({ name: "Books", slug: "books" });
    await newCategory.save();

    expect(newCategory.save).toHaveBeenCalled();
  });

//   test("should fail to create a category if name is missing", async () => {
//     categoryModel.prototype.save = jest.fn().mockRejectedValue(new Error("Name is required"));

//     const newCategory = new categoryModel({ slug: "missing-name" });

//     await expect(newCategory.save()).rejects.toThrow("Name is required");
//   });
});
