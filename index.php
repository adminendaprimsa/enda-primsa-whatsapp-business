<?php
// index.php - form upload sederhana
$config = require __DIR__ . '/config.php';
?>
<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>Upload File (XAMPP)</title>
  <style>
    body { font-family: Arial, sans-serif; max-width:800px; margin:40px auto; }
    .box { border:1px solid #ddd; padding:20px; border-radius:6px; }
    .msg { margin-bottom:12px; color: #006600; }
    .err { color: #cc0000; }
    ul.files { list-style:none; padding-left:0; }
    ul.files li { margin:6px 0; }
  </style>
</head>
<body>
  <div class="box">
    <h2>Upload File</h2>

    <form action="upload.php" method="post" enctype="multipart/form-data">
      <input type="file" name="file" required>
      <button type="submit">Upload</button>
    </form>

    <p>Untuk mengelola (hapus/download), buka <a href="admin.php">halaman admin</a> (butuh autentikasi).</p>
  </div>
</body>
</html>
