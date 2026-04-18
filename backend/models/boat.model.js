import mongoose from "mongoose";

const boatSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    place: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    // FIX: Hourly pricing structure
    price1h: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
    price2h: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
    price3h: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
    price4h: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
    capacity: {
      type: Number,
      required: true,
      min: [1, "Capacity must be at least 1"],
    },
    image: {
      type: String,
      required: [true, "Image URL is required"],
    },
    imagePublicId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Boat = mongoose.model("Boat", boatSchema);
export default Boat;
