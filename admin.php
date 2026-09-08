<?php
// admin.php - manajemen file (dengan HTTP Basic Auth)
$config = require __DIR__ . '/config.php';
$uploadDir = $config['upload_dir'];

// Simple HTTP Basic Auth
$USER = $config['admin_user'];
$PASS = $config['admin_pass'];

if (!isset($_SERVER['PHP_AUTH_USER'])) {
    header('WWW-Authenticate: Basic realm="Admin Upload"');
    header('HTTP/1.0 401 Unauthorized');
    echo 'Authentication required.';
    exit;
} else {
    if (!hash_equals($USER, $_SERVER['PHP_AUTH_USER']) || !hash_equals($PASS, $_SERVER['PHP_AUTH_PW'])) {
        header('WWW-Authenticate: Basic realm="Admin Upload"');
        header('HTTP/1.0 401 Unauthorized');
        echo 'Invalid credentials.';
        exit;
    }
}

// Pastikan direktori ada
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Hapus file jika diminta
$message = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'delete' && isset($_POST['file'])) {
    $file = basename($_POST['file']); // basename untuk mencegah traversal
    $path = $uploadDir . $file;
    if (is_file($path)) {
        if (unlink($path)) {
            $message = 'Berhasil menghapus: ' . htmlspecialchars($file);
        } else {
            $message = 'Gagal menghapus: ' . htmlspecialchars($file);
        }
    } else {
        $message = 'File tidak ditemukan.';
    }
}

$uploadedFiles = array_diff(scandir($uploadDir), ['..', '.']);
?>
<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>Admin - Upload Manager</title>
  <style>
    body { font-family: Arial, sans-serif; max-width:900px; margin:40px auto; }
    table { width:100%; border-collapse:collapse; }
    th,td { text-align:left; padding:8px; border-bottom:1px solid #eee; }
    .msg { color: #006600; }
  </style>
</head>
<body>
  <h2>Admin - Upload Manager</h2>
  <?php if ($message): ?><p class="msg"><?= htmlspecialchars($message) ?></p><?php endif; ?>
  <p>Login sebagai: <?= htmlspecialchars($_SERVER['PHP_AUTH_USER']) ?> | <a href="index.php">Kembali ke halaman upload</a></p>

  <?php if (empty($uploadedFiles)): ?>
    <p>Tidak ada file.</p>
  <?php else: ?>
    <table>
      <thead><tr><th>Nama</th><th>Ukuran</th><th>Diunggah</th><th>Aksi</th></tr></thead>
      <tbody>
      <?php foreach ($uploadedFiles as $f): $path = $uploadDir . $f; ?>
        <tr>
          <td><?= htmlspecialchars($f) ?></td>
          <td><?= number_format(filesize($path) / 1024, 2) ?> KB</td>
          <td><?= date("Y-m-d H:i:s", filemtime($path)) ?></td>
          <td>
            <a href="uploads/<?= rawurlencode($f) ?>" target="_blank">Lihat</a>
            &nbsp;|&nbsp;
            <form method="post" style="display:inline" onsubmit="return confirm('Hapus file <?= addslashes($f) ?>?');">
              <input type="hidden" name="action" value="delete">
              <input type="hidden" name="file" value="<?= htmlspecialchars($f) ?>">
              <button type="submit">Hapus</button>
            </form>
          </td>
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table>
  <?php endif; ?>

  <p style="margin-top:16px;">Catatan: ubah kredensial di file <code>config.php</code> sebelum menggunakan di lingkungan publik.</p>
</body>
</html>
