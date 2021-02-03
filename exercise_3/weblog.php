<?php
  $servername = "localhost";
  $username = "frederickz";
  $password = "";
  $conn = mysqli_connect($servername, $username, $password);

  if ($conn === false) {
    die("ERROR: Connection failed. " . mysqli_connect_error());
  }

  $sql = "CREATE DATABASE IF NOT EXISTS weblog;";
  if (!mysqli_query($conn, $sql)) {
    sql_error($conn, $sql, "execute");
  }
  mysqli_select_db($conn, 'weblog');

  $sql = "CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(30) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT);";
  if (!mysqli_query($conn, $sql)) {
    sql_error($conn, $sql, "execute");
  };

  $sql = "CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT,
    body TEXT,
    author VARCHAR(30),
    FOREIGN KEY(post_id) REFERENCES posts(id));";
  if (!mysqli_query($conn, $sql)) {
    sql_error($conn, $sql, "execute");
  };

  function sql_error($conn, $sql, $action)
  {
    echo "<p>ERROR: Could not $action query `$sql`.</p>";
    echo mysqli_error($conn);
  }
?>

<html>
<head>
  <title>Exercise 3 - A Web Journal</title>
  <link rel="stylesheet" type="text/css" href="css/style.css">
  <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
</head>
<body>
  <div class="compose-button">
    <a href="create_post.php" title="create post">
      <i class="material-icons">create</i>
    </a>
  </div>

  <h1>Frederick's Web Journal</h1>

  <div id="posts">
  <?php 
    $sql = "SELECT 
      p.id pid, p.slug, p.title, p.body body, 
      c.id cid, c.body comment, c.author
      FROM posts p 
      LEFT JOIN comments c ON p.id = c.post_id
      ORDER BY p.id DESC, c.id DESC;";
    if ($result = mysqli_query($conn, $sql)) {
      $nResults = mysqli_num_rows($result);
      if (mysqli_num_rows($result) > 0) {
        $pid = 0;
        while ($row = mysqli_fetch_array($result)) {
          if ($row['pid'] != $pid) {
            if ($pid != 0) {
              // not the first post, finish last post block
              echo "</div>"; // for <div class='comment-block'>
              echo "<a href='leave_comment.php?post_id=$pid'><i class='material-icons'>create</i>Leave a comment</a>";
              echo "</div>"; // for <div class='post' id='$pid'>
            }
            // next post
            $pid = $row['pid'];
            $slug = $row['slug'];
            $title = $row['title'];
            $body = $row['body'];
            echo "<div class='post' id='$pid'>";
            echo "<h2 class=post-title id='$slug'>$title<a href='#$slug'><i class='material-icons'>link</i></a></h2>";
            echo "<div class='post-body'>$body</div>";
            echo "<h3>Comments</h3>";
            echo "<div class='comment-block'>";
          }
          $comment = $row['comment'];
          $author = $row['author'];
          echo "<div class='comment'>";
          echo "<div class='comment-body'>$comment</div>";
          echo "<div class='comment-author'>$author</div>";
          echo "</div>";
        }
        echo "</div>"; // for <div class='comment-block'>
        echo "<a href='leave_comment.php?post_id=$pid'><i class='material-icons'>create</i>Leave a comment</a>";
        echo "</div>"; // for <div class='post' id='$pid'>
        echo "</div>"; // for <div id="posts">
      } else {
        // no posts
        echo "<p>You have 0 posts. Try creating one first!</p>";
      }
      mysqli_free_result($result);
    } else {
      sql_error($conn, $sql, "execute");
    }
  ?>



  </div> <!-- end of posts block -->
</body>
