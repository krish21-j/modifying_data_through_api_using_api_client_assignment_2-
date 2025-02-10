const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const { resolve } = require("path");

const app = express();
const PORT = process.env.PORT || 3010;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static("static"));

// Connect to MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Define MenuItem Schema
const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
});

const MenuItem = mongoose.model("MenuItem", menuItemSchema);

// Routes

// Serve home page
app.get("/", (req, res) => {
  res.sendFile(resolve(__dirname, "pages/index.html"));
});

// Create a new menu item
app.post("/menu", async (req, res) => {
  try {
    const { name, description, price } = req.body;
    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required." });
    }
    const newItem = new MenuItem({ name, description, price });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: "Error creating menu item", error });
  }
});

// Get all menu items
app.get("/menu", async (req, res) => {
  try {
    const menuItems = await MenuItem.find();
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: "Error fetching menu items", error });
  }
});

// Update an existing menu item
app.put("/menu/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedItem = await MenuItem.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedItem) {
      return res.status(404).json({ message: "Menu item not found." });
    }
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: "Error updating menu item", error });
  }
});

// Delete a menu item
app.delete("/menu/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = await MenuItem.findByIdAndDelete(id);
    if (!deletedItem) {
      return res.status(404).json({ message: "Menu item not found." });
    }
    res.json({ message: "Menu item deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error deleting menu item", error });
  }
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).send("404 - Page Not Found");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});