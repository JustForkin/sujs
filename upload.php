<?php

$data_dir = "./files/";

// Who knows how vulnerable this is!!
$data = file_get_contents("php://input");



do {
	$filename = substr(str_shuffle("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-"), 0, 12);
} while (file_exists("$data_dir/$filename"));

file_put_contents("$data_dir/$filename", $data);

echo $filename;


?>

