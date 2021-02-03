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

  $title = $slug = $body = $password = "";
  $secretPassword = "12345678";
  $titleErr = $passwordErr = "";
  if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (empty($_POST["title"])) {
      $titleErr = "Title empty.";
    } else if (strlen($_POST["title"]) >= 255) {
      $titleErr = "Title too long.";
    } else {
      $title = $_POST["title"];
      $slug = get_slug($title);
    }
    if (!empty($_POST["body"])) {
      $body = $_POST["body"];
    }
    if (empty($_POST["password"]) || $_POST["password"] != $secretPassword) {
      $passwordErr = "Incorrect password.";
    } else {
      $password = $_POST["password"];
    }
    if (empty($titleErr) && empty($passwordErr)) {
      $sql = "INSERT INTO posts (slug, title, body) VALUES (?, ?, ?)";
      if ($stmt = mysqli_prepare($conn, $sql)) {
        mysqli_stmt_bind_param($stmt, "sss", $slug, $title, $body);
        $title = $_REQUEST['title'];
        $body = $_REQUEST['body'];

        if (mysqli_stmt_execute($stmt)) {
          echo "Post submitted successfully";
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

  function get_slug($text)
  {
    $slug = strtolower($text);
    $slug = preg_replace('/[^\w ]+/', '', $slug);  // remove all non-words except for whitespaces, including '-'
    $slug = preg_replace('/^\s*|\s*$/', '', $slug);  // remove all leading and trailing whitespaces
    $slug = preg_replace('/ +/', '-', $slug);  // replace all consecutive whitespaces to '-'
    if (strlen($slug) > 32) {
      $slug = ($slug[31] == '-') ? substr($slug, 0, 31) : substr($slug, 0, 32);
    }
    return $slug;
  }
?>


<html>
<head>
  <title>Create a Post</title>
  <link rel="stylesheet" type="text/css" href="css/style.css">
  <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
</head>
<body>
  <h1>Frederick's Web Journal</h1>
  <div class="create-post">
    <h2>Create a Post</h2>
    <form method="post" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]);?>">
      <label for="title">Title * </label>
      <input name="title" value="<?php echo htmlspecialchars($title);?>"></input>
      <label for="body">Post Body</label>
      <textarea name="body"><?php echo htmlspecialchars($body);?></textarea>
      <label for="password">Secret Password * </label>
      <input type="password" name="password" value="<?php echo $password;?>"></input>
      <input type="submit" name="submit" value="Create Post"></input>
      <a href="weblog.php">Back to home</a>
      <p><?php echo $titleErr;?></p>
      <p><?php echo $passwordErr;?></p>
    </form>
  </div>
</body>
</html>
