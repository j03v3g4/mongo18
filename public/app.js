// Get articles in json format
$.getJSON("/articles", function(data) {
    // Loop through each and display their info
    for (var i = 0; i < data.length; i++) {
      $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
    }
  });
  
  
  // On comment submit
  $(document).on("click", "#submit", function() {
    // Save the id
    var thisId = $(this).attr("data-id");
  
    // Get article
    $.ajax({
      method: "GET",
      url: "/articles/" + thisId
    })
      // And comments to the page
      .then(function(data) {
        console.log(data);
        // The title of the article
        $("#articles").append("<p>" + data.title + "</p>");
        // Textarea for new comments
        $("#comments").append("<textarea id='commentinput' name='body'></textarea>");
        // Button to submit comment and save it with article
        $("#comments").append("<button data-id='" + data._id + "' id='savecomment'>Save Comment</button>");
  
        if (data.comments) {
          // Display comment
          $("#commentinput").val(data.comments.body);
        }
      });
  });
  
  $(document).on("click", "#savecomment", function() {
    var thisId = $(this).attr("data-id");
  
    // Post comment
    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        comment: $("#commentinput").val()
      }
    })
      .then(function(data) {
        // Log data
        console.log(data);
        // Empty comment input
        $("#commentinput").empty();
      });
  
    // Remove commentinput values
    $("#commentinput").val("");
  });
  