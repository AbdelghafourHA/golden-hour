import Boat from "../models/boat.model.js";
import mongoose from "mongoose";
import cloudinary from "../lib/cloudinary.js";
import streamifier from "streamifier";

export const getAllBoats = async (req, res) => {
  try {
    const boats = await Boat.find().sort({ createdAt: -1 });
    res.status(200).json(boats);
  } catch (error) {
    console.error("Get all boats error:", error);
    res.status(500).json({ message: "Failed to fetch boats" });
  }
};

export const addBoat = async (req, res) => {
  try {
    const {
      title,
      place,
      description,
      price1h,
      price2h,
      price3h,
      price4h,
      capacity,
    } = req.body;
    const file = req.file;

    // console.log("Request body:", {
    //   title,
    //   place,
    //   description,
    //   price1h,
    //   price2h,
    //   price3h,
    //   price4h,
    //   capacity,
    // });

    if (!file) {
      return res.status(400).json({ message: "Boat image is required" });
    }

    if (
      !title ||
      !place ||
      !description ||
      !price1h ||
      !price2h ||
      !price3h ||
      !price4h ||
      !capacity
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingBoat = await Boat.findOne({
      title: { $regex: new RegExp(`^${title}$`, "i") },
    });

    if (existingBoat) {
      return res
        .status(400)
        .json({ message: "Boat with this title already exists" });
    }

    let cloudinaryResult;
    try {
      cloudinaryResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "boats",
            resource_type: "image",
            allowed_formats: ["jpg", "jpeg", "png", "webp"],
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error details:", error);
              reject(error);
            } else {
              console.log("Cloudinary upload success:", result.secure_url);
              resolve(result);
            }
          }
        );

        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });
    } catch (uploadError) {
      console.error("Cloudinary upload error:", uploadError);
      return res.status(500).json({
        message: "Failed to upload image to cloud storage",
        error: uploadError.message,
      });
    }

    const newBoat = new Boat({
      title,
      place,
      description,
      price1h: Number(price1h),
      price2h: Number(price2h),
      price3h: Number(price3h),
      price4h: Number(price4h),
      capacity: Number(capacity),
      image: cloudinaryResult.secure_url,
      imagePublicId: cloudinaryResult.public_id,
    });

    const savedBoat = await newBoat.save();
    res.status(201).json(savedBoat);
  } catch (error) {
    console.error("Add boat error:", error);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Boat with this title already exists" });
    }
    res
      .status(500)
      .json({ message: "Failed to add boat", error: error.message });
  }
};

export const updateBoat = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      place,
      description,
      price1h,
      price2h,
      price3h,
      price4h,
      capacity,
    } = req.body;
    const file = req.file;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid boat ID format" });
    }

    const existingBoat = await Boat.findById(id);
    if (!existingBoat) {
      return res.status(404).json({ message: "Boat not found" });
    }

    if (title && title.toLowerCase() !== existingBoat.title.toLowerCase()) {
      const titleExists = await Boat.findOne({
        title: { $regex: new RegExp(`^${title}$`, "i") },
        _id: { $ne: id },
      });

      if (titleExists) {
        return res
          .status(400)
          .json({ message: "Another boat with this title already exists" });
      }
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (place) updateData.place = place;
    if (description) updateData.description = description;
    if (price1h) updateData.price1h = Number(price1h);
    if (price2h) updateData.price2h = Number(price2h);
    if (price3h) updateData.price3h = Number(price3h);
    if (price4h) updateData.price4h = Number(price4h);
    if (capacity) updateData.capacity = Number(capacity);

    if (file) {
      try {
        if (existingBoat.imagePublicId) {
          try {
            await cloudinary.uploader.destroy(existingBoat.imagePublicId);
          } catch (deleteError) {
            console.error("Failed to delete old image:", deleteError);
          }
        }

        const cloudinaryResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "boats",
              resource_type: "image",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });

        updateData.image = cloudinaryResult.secure_url;
        updateData.imagePublicId = cloudinaryResult.public_id;
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return res.status(500).json({ message: "Failed to upload new image" });
      }
    }

    // FIX: Changed new: true to returnDocument: "after"
    const updatedBoat = await Boat.findByIdAndUpdate(id, updateData, {
      returnDocument: "after", // ✅ Returns the updated document
      runValidators: true,
    });

    res.status(200).json(updatedBoat);
  } catch (error) {
    console.error("Update boat error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Boat title must be unique" });
    }
    res.status(500).json({ message: "Failed to update boat" });
  }
};

export const deleteBoat = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid boat ID format" });
    }

    const boat = await Boat.findById(id);

    if (!boat) {
      return res.status(404).json({ message: "Boat not found" });
    }

    if (boat.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(boat.imagePublicId);
      } catch (cloudinaryError) {
        console.error(
          "Failed to delete image from Cloudinary:",
          cloudinaryError
        );
      }
    }

    await Boat.findByIdAndDelete(id);

    res.status(200).json({
      message: "Boat deleted successfully",
      deletedId: id,
    });
  } catch (error) {
    console.error("Delete boat error:", error);
    res.status(500).json({ message: "Failed to delete boat" });
  }
};
