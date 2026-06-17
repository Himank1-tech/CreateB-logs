import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// 🔗 Connect to MongoDB Atlas using environment variable
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// 📦 Schema + Model
const postSchema = new mongoose.Schema({
  title: String,
  content: String
});
const Post = mongoose.model("Post", postSchema);

// 🏠 Home route – show all posts
app.get("/", async (req, res) => {
  const posts = await Post.find();
  res.render("home", { title: "My Blog", posts });
});

// ✍️ Compose page
app.get("/compose", (req, res) => {
  res.render("compose", { title: "Compose" });
});

// ➕ Add new post
app.post("/compose", async (req, res) => {
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody
  });
  await post.save();
  res.redirect("/");
});

// 📖 View single post
app.get("/posts/:postName", async (req, res) => {
  const requestedTitle = req.params.postName.toLowerCase();
  const foundPost = await Post.findOne({ title: new RegExp("^" + requestedTitle + "$", "i") });
  if (foundPost) {
    res.render("post", { title: foundPost.title, content: foundPost.content });
  } else {
    res.send("Post not found!");
  }
});

// 🗑️ Delete post by index (or better: by ID)
app.post("/delete", async (req, res) => {
  const indexToDelete = parseInt(req.body.postIndex);
  const posts = await Post.find();
  if (posts[indexToDelete]) {
    await Post.findByIdAndDelete(posts[indexToDelete]._id);
  }
  res.redirect("/");
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
