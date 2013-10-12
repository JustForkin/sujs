<?

// Be sure to put an .htaccess file like this in your directory:
/*
RewriteEngine On

RewriteCond %{HTTP_HOST} hobocomp.com
RewriteCond %{REQUEST_URI} !^/sujs/$
RewriteRule ^(.*)$ download.php?fname=$1 [L,QSA]
*/


$fname = preg_replace("/[^a-zA-Z0-9_-]+/", "", $_GET["fname"]);

echo $fname


?>
