# Exercise #3

5 points

**DUE: Wednesday, February 3 by 1:50pm**

### Instructions

One very common kind database-driven web application is a Content Management
System, or CMS. A CMS provides an interface for users to write content—posts,
articles, whole web pages—that is stored in a database, and then creates web
pages from those entries, without the author needing to know any HTML. And by
far the most popular CMS, [WordPress](https://wordpress.com/),is a PHP
application.

We're going to make our own very simple CMS for a web journal, with posts and
comments. The assignment this week is to modify the `.php` files in `exercise_3`
to make the pages display posts and comments that are stored in a database, and
to enable users to create new posts and leave new comments.

First you'll need your own working version of the LAMP stack, either by
installing it on your laptop (it's all free software), or by following the
instructions to install it on a cloud hosting provider like [Amazon's AWS](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-lamp-amazon-linux-2.html), [Microsoft Azure](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/tutorial-lamp-stack), or [Google Cloud Platform](https://console.cloud.google.com/marketplace/details/click-to-deploy-images/lamp?pli=1).
Both the Amazon and Microsoft offerings should be possible on their respective
free usage tiers, meaning they won't cost you anything to set up or run.

From there:
1. Configure your database to have tables for posts and comments by running the
commands in `create_tables.sql`
1. Modify `weblog.php` to fetch posts and their associated comments from the
database and display them to visitors.
- Use a `JOIN` to get all posts and comments in a single query.
- Display posts in reverse chronological order. That is, with the newest
(highest id) posts at the top. Display Comments in chronological order from
lowest id to highest.
- Put the `id` and `slug` of posts in the appropriate HTML attributes to enable
linking to individual posts on the page and to comment pages for each post.
- When displaying user-entered information like titles, posts, or usernames, use
the [htmlspecialchars](https://www.php.net/manual/en/function.htmlspecialchars.php)
function to make sure special characters like < and > render correctly in HTML.
- Replace `<yourname>` with your name.
1. Modify `create_post.php` to insert a new row in the `posts` table.
  - Be sure to add a secret password in the PHP code, and only add a row if the
  password the user entered matches!
  - Create a `slug` by converting the post title to lowercase and replacing any
  spaces or special characters with underscores. We'll use this slug to let us
  link to individual posts later.
  - Because we're accepting content from users, be sure to
  [sanitize your inputs](https://xkcd.com/327/) using prepared statements to do
  the inserts rather than creating queries with string concatenation.
1. Modify `leave_comment.php` to enable users to leave comments on posts.
  - We'll get a `post_id` as a query param. Fetch the post and its comments from
  the database (you'll have to use a `JOIN`). That will give us:
    - Its slug to use in  our link
    - The post body and comments to preview
  - We'll let any users post comments without authentication. It's become clear
  that's a bad idea on the real internet, but it's fine for this exercise.
  - When a user posts a new comment, add a new row to the `comments` table,
  sanitizing as before.

Don't worry about mobile layouts for this exercise, about or about features like
previewing or editing. When you are done, push the `exercise_3` folder to your
class repository on GitLab.

Remember to include in your submission any classmates you collaborated with and
any materials you consulted.

### Rubric

One point each for:
- SELECT: Correctly fetches posts and comments for the main page. Uses one query with a JOIN (either Left Join from Comments to Posts or Full Outer Join on both).
- Server-side rendering: Correctly builds main page from fecthed data: loops to write Post and Comment divs. Displays oldest posts at the top, and Comments in chronological order.
- Form submission: Correctly handles POSTing new posts and comments and parses them out of the `$_POST` supervariable
- INSERT: Correctly inserts posted comments and posts to the database. Comments have the correct foreign key relationship to posts.
- Escaping: Correctly uses `htmlescape` when rendering user-entered fields, and correctly sanitizes inputs with binding to stored procedures.
