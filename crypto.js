

$(document).ready(function () {
    if (isAPIAvailable()) {
        $('#file').bind('change', handleFileSelect);
    }

    // If the URL contains a #, we will assume the user is
    // looking to download.
    if (document.location.hash != "") {
        downloadFile();
    }
});


// Combatability Check
function isAPIAvailable() {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        return true;
    } else {
        // source: File API availability - http://caniuse.com/#feat=fileapi
        $('#error').html('The Javascript APIs used in this form are only ' +
                         'available in recent browsers. Please upgrade.');
        return false;
    }
}

// ============================
// Downloading
// ============================
function downloadFile() {
    var path_split = document.location.pathname.split('/')
    var fname = path_split[path_split.length - 2];

    $('#progress').html('Downloading file...');
    $.ajax({
        url: '/sujs/download.php?fname=' + fname,
        type: 'GET',
        success: downloadDone,
        error: downloadError,
    });
}

// Decrypt file returned
function downloadDone(evt) {
    var key = atob(document.location.hash.substr(1));
    $('#progress').html('Decrypting...');
    encrypted_obj = $.parseJSON(evt);
    app_type = encrypted_obj.file_type
    fname = encrypted_obj.file_name;
    delete encrypted_obj["file_type"];
    delete encrypted_obj["file_name"];
    encrypted_data = JSON.stringify(encrypted_obj);
    decrypted_data = sjcl.decrypt(key, encrypted_data);

    // Build data blob
    var binary_data = new Uint8Array(decrypted_data.length);
    for (var i=0; i<decrypted_data.length; i++) {
        binary_data[i] = decrypted_data.charCodeAt(i) & 0xff;
    }
    blob = new Blob([binary_data.buffer], {type: app_type});
    console.log('len: ' + blob.size);
    console.log('decrypt: ' + btoa(decrypted_data.substr(1, 10)));

    $('#progress').html('Done!');

    // Allow user to download
    $('#url').html('Download \'' + fname + "'");
    $('#url')[0].addEventListener('download', function() { saveAs(blob, fname); }, false);
    
    saveAs(blob, fname);
    //window.open("data:" + app_type + ";charset=us-ascii;base64,"+btoa(decrypted_data),fname);
}

function downloadError(evt) {
    console.log('Error download');
    $('#error').html('Error downloading file: ' + evt);
}


// =============================
// File Upload
// =============================
function handleFileSelect(evt) {
    var file = evt.target.files[0];

    console.log(file);
    // file.type
    // file.size

    $('#progress').html('Reading file...');
    var reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = function (evt) { encryptFile(evt, file) };
    console.log('got a file');
}

function uploadDone(evt, key_url) {
    url = document.location + evt.trim() + '/#' + key_url;
    $('#progress').html('Done');
    $('#url').html(url);
    $('#url')[0].href = url;
}

function uploadError(evt) {
    console.log('error' + evt);
}

function encryptFile(evt, file) {

    // Convert array buf to string
    // Cannot use fromCharCode.apply here; large files fail
    var array_data = new Uint8Array(evt.target.result);
    var data = "";
    for (var i=0; i<array_data.length; i++) {
        data += String.fromCharCode(array_data[i]);
    }

    $('#progress').html('Generating key...');
    // Generate 128-bit key
    var key = new Uint8Array(16);
    // What could possibly go wrong here!?!
    window.crypto.getRandomValues(key);

    // Stringify and urlify key
    var key_str = String.fromCharCode.apply(null, key);
    var key_url = btoa(key_str);

    // Encrypt - this returns a json string
    console.log('encrypt: ' + btoa(data.substr(1, 10)));
    encrypted_data = sjcl.encrypt(key_str, data);

    encrypted_data_obj = $.parseJSON(encrypted_data);
    encrypted_data_obj.file_type = file.type;
    encrypted_data_obj.file_name = file.name;
    console.log('file type: ' + file.type);
    console.log('file name: ' + file.name);
    encrypted_data = JSON.stringify(encrypted_data_obj);

    $('#progress').html('Uploading file...');
    // Upload encrypted file, and provide url
    uploadData(key_url, encrypted_data);
}


function uploadData(key_url, encrypted_data) {

    // Make ajax request to upload.php
    $.ajax({
        url: 'upload.php',  //Server script to process data
        type: 'POST',
        xhr: function() {  // Custom XMLHttpRequest
            var myXhr = $.ajaxSettings.xhr();
            if(myXhr.upload) {
                myXhr.upload.addEventListener('progress', handleProgress, false);
            }
            return myXhr;
        },
        //Ajax events
        success: function(evt) { uploadDone(evt, key_url) },
        error: uploadError,
        // Form data
        data: encrypted_data,
        //Options to tell jQuery not to process data or worry about content-type.
        cache: false,
        contentType: false,
        processData: false
    });

}

// Progress for encrypted file upload
function handleProgress(e){
    if(e.lengthComputable){
        $('progress').attr({value:e.loaded,max:e.total});
    }
}
