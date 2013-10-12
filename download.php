<?

// Be sure to put an .htaccess file like this in your directory:
/*
RewriteEngine On

RewriteCond %{HTTP_HOST} hobocomp.com
RewriteCond %{REQUEST_URI} !^/sujs/download.php(.*)$
RewriteCond %{REQUEST_URI} !^/sujs/upload.php(.*)$
RewriteRule ^(.*)$ index.html [L,QSA]

*/

$data_dir = "./files/";

$fname = preg_replace("/[^a-zA-Z0-9_-]+/", "", $_GET["fname"]);

echo file_get_contents("$data_dir/$fname");


?>
