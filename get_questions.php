<?php

error_reporting(0);

$presetList = array();

$dir = new FilesystemIterator(__DIR__ . '/questions');

foreach ($dir as $fileinfo) {
    if ($fileinfo->getExtension() == "set"){
        array_push($presetList,substr($fileinfo->getFilename(), 0, -4));
    }
}

sort($presetList);

if(array_count_values($presetList)>0){
    foreach ($presetList as &$value) {
        echo $value . "</br>";
    }
}

?>
