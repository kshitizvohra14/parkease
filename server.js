const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const app = express();
app.use(cors());
app.use(express.json());

// ✅ MongoDB Connection
mongoose
  .connect("mongodb://127.0.0.1:27017/parkease", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

// ✅ Schemas
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
}, { timestamps: true });

const slotSchema = new mongoose.Schema({
  label: { type: String, required: true },
  status: { type: String, enum: ["available", "booked"], default: "available" },
}, { timestamps: true });

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  slot: { type: mongoose.Schema.Types.ObjectId, ref: "Slot", required: true },
  time: { type: String, required: true },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
const Slot = mongoose.model("Slot", slotSchema);
const Booking = mongoose.model("Booking", bookingSchema);

// ✅ Routes
app.get("/", (req, res) => res.send("Backend is working!"));

// ✅ Signup
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || "your_jwt_secret", {
      expiresIn: "1h",
    });

    res.json({ message: "Login successful", token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Slots Routes
app.get("/slots", async (req, res) => {
  const slots = await Slot.find();
  res.json(slots);
});

app.post("/slots", async (req, res) => {
  const { label, status } = req.body;
  if (!label) return res.status(400).json({ message: "Slot label is required" });

  try {
    const slot = new Slot({ label, status });
    await slot.save();
    res.status(201).json(slot);
  } catch (err) {
    res.status(500).json({ message: "Error creating slot", error: err.message });
  }
});

app.put("/slots/:id/toggle", async (req, res) => {
  try {
    const slot = await Slot.findById(req.params.id);
    if (!slot) return res.status(404).json({ message: "Slot not found" });

    slot.status = slot.status === "available" ? "booked" : "available";
    await slot.save();
    res.json(slot);
  } catch (err) {
    res.status(500).json({ message: "Error updating slot", error: err.message });
  }
});

// ✅ Bookings Routes

app.post("/bookings", async (req, res) => {
  const { userId, slotId, time } = req.body;

  // Basic validation
  if (!userId || !slotId || !time) {
    return res.status(400).json({ message: "All fields (userId, slotId, time) are required." });
  }

  // Validate MongoDB ObjectId format
  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(slotId)) {
    return res.status(400).json({ message: "Invalid userId or slotId format." });
  }

  try {
    // Check existence of user and slot
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const slot = await Slot.findById(slotId);
    if (!slot) return res.status(404).json({ message: "Slot not found" });

    // Create booking
    const booking = new Booking({ user: userId, slot: slotId, time });
    await booking.save();

    // Optionally update slot status
    slot.status = "booked";
    await slot.save();

    res.status(201).json({
      message: "Booking created successfully",
      booking: await booking.populate("user slot"),
    });
  } catch (err) {
    console.error("Booking Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

app.get("/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find().populate("user").populate("slot");
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Error fetching bookings", error: err.message });
  }
});



// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
