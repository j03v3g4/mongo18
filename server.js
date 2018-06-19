var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

// Scraping tools
var axios = require("axios");
var cheerio = require("cheerio");

// Models
var db = require("./models");

var PORT = 3000;

// Express
var app = express();

// Request logger
app.use(logger("dev"));
// Bodyparser for inputs
app.use(bodyParser.urlencoded({ extended: true }));
// Express static
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/mongo18");

// A GET route for scraping
app.get("/scrape", function(req, res) {
  // Grab html body
  axios.get("https://news.ycombinator.com/").then(function(response) {
    // Cheerio $ shorthand
    var $ = cheerio.load(response.data);

    // Grab every tr with "athing" class
    $("athing tr").each(function(i, element) {
      // Empty result object
      var result = {};

      // Grab text and URL and store as props
      result.title = $(this)
        .children("a.storylink")
        .text();
      result.link = $(this)
        .children("a.storylink")
        .attr("href");

      // Create article from result
      db.Article.create(result)
        .then(function(dbArticle) {
          // Log article
          console.log(dbArticle);
        })
        .catch(function(err) {
          // Log errors
          return res.json(err);
        });
    });

    // Send message upon successful scrap
    res.send("Article scrap was successful!");
  });
});

// Get articles from db
app.get("/articles", function(req, res) {
  db.Article.find({})
    .then(function(dbArticle) {
      // Send articles to client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // Log errors
      res.json(err);
    });
});

// Get articles by id
app.get("/articles/:id", function(req, res) {
  // Get signle article
  db.Article.findOne({ _id: req.params.id })
    // Display comments
    .populate("comments")
    .then(function(dbArticle) {
      // Send articles to client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // Log errors
      res.json(err);
    });
});

// Saving comments with articles
app.post("/articles/:id", function(req, res) {
  // Create a new comment
  db.Comments.create(req.body)
    .then(function(dbComments) {
      // Link comment to article id
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { comments: dbComments._id }, { new: true });
    })
    .then(function(dbArticle) {
      // Send articles to client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // Log errors
      res.json(err);
    });
});

// Server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});