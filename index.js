import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// 🔗 Connect to MongoDB Atlas using environment variable
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error("❌ MONGO_URI is not defined. Please set it in Render Environment Variables.");
  process.exit(1);
}

mongoose.connect(mongoURI)
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
  try {
    const posts = await Post.find();
    res.render("home", { title: "My Blog", posts });
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).send("Error loading posts.");
  }
});

// ✍️ Compose page
app.get("/compose", (req, res) => {
  res.render("compose", { title: "Compose" });
});

// ➕ Add new post
app.post("/compose", async (req, res) => {
  try {
    const post = new Post({
      title: req.body.postTitle,
      content: req.body.postBody
    });
    await post.save();
    res.redirect("/");
  } catch (err) {
    console.error("Error saving post:", err);
    res.status(500).send("Error saving post.");
  }
});

// 📖 View single post
app.get("/posts/:postName", async (req, res) => {
  try {
    const requestedTitle = req.params.postName.toLowerCase();
    const foundPost = await Post.findOne({ title: new RegExp("^" + requestedTitle + "$", "i") });
    if (foundPost) {
      res.render("post", { title: foundPost.title, content: foundPost.content });
    } else {
      res.send("Post not found!");
    }
  } catch (err) {
    console.error("Error fetching post:", err);
    res.status(500).send("Error loading post.");
  }
});

// 🗑️ Delete post by index (or better: by ID)
app.post("/delete", async (req, res) => {
  try {
    const indexToDelete = parseInt(req.body.postIndex);
    const posts = await Post.find();
    if (posts[indexToDelete]) {
      await Post.findByIdAndDelete(posts[indexToDelete]._id);
    }
    res.redirect("/");
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).send("Error deleting post.");
  }
});

app.listen(3000, () => console.log("🚀 Server running on http://localhost:3000"));
