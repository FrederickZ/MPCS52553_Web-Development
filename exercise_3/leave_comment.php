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

  $postID = (empty($_GET['post_id'])) ? 0 : $_GET['post_id'];

  $comment = $name = "";
  $commentErr = $nameErr = "";
  if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (empty($_POST["comment"])) {
      $commentErr = "Comment empty.";
    } else {
      $comment = $_POST["comment"];
    }
    if (empty($_POST["name"])) {
      $nameErr = "Name empty.";
    } else if (strlen($_POST["name"]) >= 30) {
      $nameErr = "Name too long.";
    } else {
      $name = $_POST["name"];
    }
    if (empty($commentErr) && empty($nameErr)) {
      $sql = "INSERT INTO comments (post_id, body, author) VALUES (?, ?, ?)";
      if ($stmt = mysqli_prepare($conn, $sql)) {
        mysqli_stmt_bind_param($stmt, "iss", $post_id, $comment, $name);
        $post_id = $postID;
        $comment = $_REQUEST['comment'];
        $name = $_REQUEST['name'];

        if (mysqli_stmt_execute($stmt)) {
          echo "Comment submitted successfully";
        } else {
          sql_error($conn, $sql, "execute");
        }

        mysqli_stmt_close($stmt);
      } else {
        sql_error($conn, $sql, "prepare");
      }
    }
  }

  function sql_error($conn, $sql, $action)
  {
    echo "<p>ERROR: Could not $action query `$sql`.</p>";
    echo mysqli_error($conn);
  }
?>

<html>
<head>
  <title>Leave a Comment</title>
  <link rel="stylesheet" type="text/css" href="css/style.css">
  <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
</head>
<body>
  <h1>Frederick's Web Journal</h1>
  <div class="leave-comment">
  <?php 
    $sql = "SELECT 
      p.id pid, p.slug, p.title, p.body body, 
      c.id cid, c.body comment, c.author
      FROM posts p 
      LEFT JOIN comments c ON p.id = c.post_id
      WHERE p.id = $postID 
      ORDER BY c.id DESC;";
    if ($result = mysqli_query($conn, $sql)) {
      $nResults = mysqli_num_rows($result);
      if (mysqli_num_rows($result) > 0) {
        // post exists, no matter having comments or not
        $row = mysqli_fetch_array($result);
        // build common site
        echo '<h2>Leave a Comment on <a href="weblog.php#' . $row['slug'] . '">' . $row['title'] . '</a></h2>';
        echo '<div class="post-body">' . $row['body'] . '</div>';
        if ($row['cid'] == null) {
          // no comment
          echo '<h3>0 Comment</h3>';
        } else {
          // has comments
          // move cursor back to the first result
          mysqli_data_seek($result, 0);
          if ($nResults == 1) {
            echo '<h3>1 Comment</h3>';
          } else {
            echo "<h3>$nResults Comments</h3>";
          }
        }
        echo '<div class="comment-block">';
        while ($row = mysqli_fetch_array($result)) {
          echo '<div class="comment">';
          echo '<div class="comment-body">' . $row['comment'] . '</div>';
          echo '<div class="comment-author">' . $row['author'] . '</div>';
          echo '</div>';
        }
        echo '</div>';
      ?>
        <form method="post" action="<?php echo htmlspecialchars($_SERVER['REQUEST_URI']);?>">
          <label for="comment">Comment * </label>
          <textarea name="comment"><?php echo htmlspecialchars($comment);?></textarea>
          <label for="name">Your name * </label>
          <input name="name" value="<?php echo htmlspecialchars($name);?>"></input>
          <input type="hidden" name="post_id" value="<?php echo $postID;?>"></input>
          <input type="submit" name="submit" value="Leave Comment"></input>
        </form>
    <?php 
      } else { 
        if ($postID == 0) {
          echo "<p>This is a template page with no post. Please go back to homepage.</p>";
        } else {
          echo "<p>Post does not exist.</p>";
        }
      }
    ?>
      <a href="weblog.php">Back to home</a>
      <p><?php echo $commentErr;?></p>
      <p><?php echo $nameErr;?></p>
    <?php
      mysqli_free_result($result);
    } else {
      sql_error($conn, $sql, "execute");
    }
  ?>
  </div>
</body>
</html>
