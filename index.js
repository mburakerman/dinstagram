#!/usr/bin/env node

const fs = require("fs");
const request = require("request");
const argv = require("minimist")(process.argv.slice(2));
const ora = require("ora");

var spinner = ora();
const instagramUrl = argv._[0] + "?__a=1";


request(instagramUrl, function (error, response, body) {
    if (error !== null) {
        spinner.stop();
        console.log("please type a correct url");
        return error;
    }
    const responseJson = JSON.parse(response.body);

    var images = findKeys(responseJson, "display_url")
    var videos = findKeys(responseJson, "video_url")

    // remove duplicates
    images = [...new Set(images)];
    videos = [...new Set(videos)];

    // download images
    if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
            console.log(i)
            downloadFile(images[i], setFileName(images[i]));
        }
    }
    // download videos
    if (videos.length > 0) {
        for (let i = 0; i < videos.length; i++) {
            downloadFile(videos[i], setFileName(videos[i]));
        }
    }
});


function downloadFile(uri, filename) {
    spinner.start()

    request.head(uri, function (err, res, body) {
        request(uri).pipe(fs.createWriteStream(filename)).on("close", function () {
            var fileSize = formatBytes(res.headers["content-length"]);
            console.log("\nsize: " + fileSize);

            spinner.succeed("Download completed");
        });
    });
};

function findKeys(obj, key) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(findKeys(obj[i], key));
        } else if (i == key) {
            objects.push(obj[i]);
        }
    }
    return objects;
}

function setFileName(url) {
    function getFileType(file_url) {
        file_url = file_url.split("?").shift()
        file_type = file_url.split(".").pop()
        file_ext = "." + file_type;
        return file_ext;
    }

    var date = new Date().getTime();
    var file_name = date + getFileType(url);
    return file_name;
}

function formatBytes(bytes) {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(3) + " kb";
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(3) + " mb";
    else return (bytes / 1073741824).toFixed(3) + " gb";
};

