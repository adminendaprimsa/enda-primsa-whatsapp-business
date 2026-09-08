<?php
// config.php - konfigurasi untuk upload dan admin
return [
    // Direktori uploads relatif terhadap file ini
    'upload_dir' => __DIR__ . '/uploads/',

    // Maks ukuran file (bytes)
    'max_file_size' => 5 * 1024 * 1024, // 5 MB

    // Ekstensi yang diizinkan
    'allowed_ext' => [
        'jpg','jpeg','png','gif','pdf','doc','docx','txt','csv','zip'
    ],

    // Mapping ekstensi ke MIME yang diizinkan (periksa menggunakan finfo)
    'allowed_mime' => [
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png' => 'image/png',
        'gif' => 'image/gif',
        'pdf' => 'application/pdf',
        'doc' => 'application/msword',
        'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'txt' => 'text/plain',
        'csv' => 'text/plain',
        'zip' => 'application/zip',
    ],

    // Admin credentials untuk akses admin.php (ubah sebelum dipublikasikan)
    'admin_user' => 'admin',
    'admin_pass' => 'change_me',
];
