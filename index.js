import express from "express";
import bodyParser from "body-parser";

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let posts = [];

app.get("/", (req, res) => {
  res.render("home", { title: "My Blog", posts });
});

app.get("/compose", (req, res) => {
  res.render("compose", { title: "Compose" });
});

app.post("/compose", (req, res) => {
  const post = {
    title: req.body.postTitle,
    content: req.body.postBody
  };
  posts.push(post);
  res.redirect("/");
});

app.get("/posts/:postName", (req, res) => {
  const requestedTitle = req.params.postName.toLowerCase();
  const foundPost = posts.find(p => p.title.toLowerCase() === requestedTitle);
  if (foundPost) {
    res.render("post", { title: foundPost.title, content: foundPost.content });
  } else {
    res.send("Post not found!");
  }
});

app.post("/delete", (req, res) => {
  const indexToDelete = parseInt(req.body.postIndex);
  posts.splice(indexToDelete, 1); // remove only that specific post
  res.redirect("/");
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
