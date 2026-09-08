<?php
// upload.php - menerima upload dan menampilkan ringkasan
$config = require __DIR__ . '/config.php';
$uploadDir = $config['upload_dir'];
$maxFileSize = $config['max_file_size'];
$allowedExt = $config['allowed_ext'];
$allowedMime = $config['allowed_mime'];

// Pastikan direktori ada
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$message = '';
$isError = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_FILES['file'])) {
        $message = 'Tidak ada file yang dikirim.';
        $isError = true;
    } else {
        $file = $_FILES['file'];

        if ($file['error'] !== UPLOAD_ERR_OK) {
            $message = 'Error saat upload: ' . $file['error'];
            $isError = true;
        } elseif ($file['size'] > $maxFileSize) {
            $message = 'File terlalu besar. Maksimum ' . ($maxFileSize / 1024 / 1024) . ' MB.';
            $isError = true;
        } else {
            $origName = $file['name'];
            $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));

            if (!in_array($ext, $allowedExt)) {
                $message = 'Tipe file (ekstensi) tidak diperbolehkan.';
                $isError = true;
            } else {
                // Periksa MIME type menggunakan finfo
                $finfo = finfo_open(FILEINFO_MIME_TYPE);
                $mime = finfo_file($finfo, $file['tmp_name']);
                finfo_close($finfo);

                $expectedMime = $allowedMime[$ext] ?? null;
                // Untuk CSV kita terima text/plain atau text/csv
                if ($ext === 'csv' && !in_array($mime, ['text/plain','text/csv','application/vnd.ms-excel'])) {
                    $message = 'MIME type CSV tidak cocok: ' . $mime;
                    $isError = true;
                } elseif ($expectedMime && strpos($mime, $expectedMime) === false && $ext !== 'csv') {
                    $message = 'MIME type tidak valid: ' . $mime;
                    $isError = true;
                } else {
                    // Sanitasi nama file dan buat nama unik
                    $base = preg_replace('/[^A-Za-z0-9_\-\.]/', '_', pathinfo($origName, PATHINFO_FILENAME));
                    $newName = $base . '_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
                    $target = $uploadDir . $newName;

                    if (move_uploaded_file($file['tmp_name'], $target)) {
                        @chmod($target, 0644);
                        $message = 'Upload berhasil: ' . htmlspecialchars($newName);
                    } else {
                        $message = 'Gagal memindahkan file ke folder uploads.';
                        $isError = true;
                    }
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
    body { font-family: Arial, sans-serif; max-width:900px; margin:40px auto; }
    .box { border:1px solid #ddd; padding:20px; border-radius:6px; }
    .msg { margin-bottom:12px; color: #006600; }
    .err { color: #cc0000; }
    ul.files { list-style:none; padding-left:0; }
    ul.files li { margin:6px 0; }
    table { width:100%; border-collapse:collapse; }
    th,td { text-align:left; padding:8px; border-bottom:1px solid #eee; }
  </style>
</head>
<body>
  <div class="box">
    <h2>Upload File</h2>
    <?php if ($message): ?>
      <div class="<?= $isError ? 'err' : 'msg' ?>">
        <?= htmlspecialchars($message) ?>
      </div>
    <?php endif; ?>

    <form action="upload.php" method="post" enctype="multipart/form-data">
      <input type="file" name="file" required>
      <button type="submit">Upload</button>
    </form>

    <h3>File yang sudah diupload</h3>
    <?php if (empty($uploadedFiles)): ?>
      <p>Belum ada file.</p>
    <?php else: ?>
      <table>
        <thead><tr><th>Nama</th><th>Ukuran</th><th>Diunggah</th><th>Aksi</th></tr></thead>
        <tbody>
        <?php foreach ($uploadedFiles as $f): $path = $uploadDir . $f; ?>
          <tr>
            <td><a href="uploads/<?= rawurlencode($f) ?>" target="_blank"><?= htmlspecialchars($f) ?></a></td>
            <td><?= number_format(filesize($path) / 1024, 2) ?> KB</td>
            <td><?= date("Y-m-d H:i:s", filemtime($path)) ?></td>
            <td>
              <a href="uploads/<?= rawurlencode($f) ?>" download>Download</a>
              <!-- Hapus melalui halaman admin (dilindungi) -->
              &nbsp;|&nbsp;
              <a href="admin.php">Kelola</a>
            </td>
          </tr>
        <?php endforeach; ?>
        </tbody>
      </table>
    <?php endif; ?>

    <p style="margin-top:16px;">Untuk menghapus file, buka <a href="admin.php">admin</a> dan lakukan penghapusan.</p>
  </div>
</body>
</html>
