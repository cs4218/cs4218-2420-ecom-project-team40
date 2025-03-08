import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    products: [
      {
        type: mongoose.ObjectId,
        ref: "Products",
        required: true
      },
    ],
    payment: {},
    buyer: {
      type: mongoose.ObjectId,
      ref: "users",
    },
    status: {
      type: String,
      default: "Not Process",
      enum: ["Not Process", "Processing", "Shipped", "deliverd", "cancel"],
    },
  },
  { timestamps: true }
);

orderSchema.path("products").validate(function (value) {
  return value.length > 0; // Ensure at least one product
}, "Order must contain at least one product.");

export default mongoose.model("Order", orderSchema);