<?php

$data_dir = "/abby/hobocomp/sujs/files/";

// Who knows how vulnerable this is!!
$data = file_get_contents("php://input");


$filename = substr(str_shuffle("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"), 0, 12);

file_put_contents("$data_dir/$filename", $data);

echo $filename;
?>

