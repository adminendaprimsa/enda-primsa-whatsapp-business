<?php
// Konfigurasi
$uploadDir = __DIR__ . '/uploads/';
$maxFileSize = 5 * 1024 * 1024; // 5 MB
$allowedExt = ['jpg','jpeg','png','gif','pdf','doc','docx','txt','csv','zip'];

// Buat folder uploads kalau belum ada
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$message = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_FILES['file'])) {
        $message = 'Tidak ada file yang dikirim.';
    } else {
        $file = $_FILES['file'];

        if ($file['error'] !== UPLOAD_ERR_OK) {
            $message = 'Error saat upload: ' . $file['error'];
        } elseif ($file['size'] > $maxFileSize) {
            $message = 'File terlalu besar. Maksimum ' . ($maxFileSize / 1024 / 1024) . ' MB.';
        } else {
            // Ekstensi
            $origName = $file['name'];
            $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));

            if (!in_array($ext, $allowedExt)) {
                $message = 'Tipe file tidak diperbolehkan.';
            } else {
                // Sanitasi nama file dan buat nama unik
                $base = preg_replace('/[^A-Za-z0-9_\-\.]/', '_', pathinfo($origName, PATHINFO_FILENAME));
                $newName = $base . '_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
                $target = $uploadDir . $newName;

                if (move_uploaded_file($file['tmp_name'], $target)) {
                    // Set permission yang aman
                    @chmod($target, 0644);
                    $message = 'Upload berhasil: ' . htmlspecialchars($newName);
                } else {
                    $message = 'Gagal memindahkan file ke folder uploads.';
                }
            }
        }
    }
}

// Ambil daftar file untuk ditampilkan
$uploadedFiles = array_diff(scandir($uploadDir), ['..', '.']);
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
    <?php if ($message): ?>
      <div class="<?= strpos($message, 'berhasil') !== false ? 'msg' : 'err' ?>">
        <?= htmlspecialchars($message) ?>
      </div>
    <?php endif; ?>

    <form method="post" enctype="multipart/form-data">
      <input type="file" name="file" required>
      <button type="submit">Upload</button>
    </form>

    <h3>File yang sudah diupload</h3>
    <?php if (empty($uploadedFiles)): ?>
      <p>Belum ada file.</p>
    <?php else: ?>
      <ul class="files">
        <?php foreach ($uploadedFiles as $f): ?>
          <li>
            <a href="uploads/<?= rawurlencode($f) ?>" target="_blank"><?= htmlspecialchars($f) ?></a>
            (<?= number_format(filesize($uploadDir . $f) / 1024, 2) ?> KB)
          </li>
        <?php endforeach; ?>
      </ul>
    <?php endif; ?>
  </div>
</body>
</html>
