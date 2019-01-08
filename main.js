#!/usr/bin/env node

const fs = require('fs');
const request = require('request');
const jsdom = require("jsdom");
const argv = require('minimist')(process.argv.slice(2));
const ora = require('ora');

var loader = ora('downloading...').start();
var download = function (uri, filename, callback) {
    request.head(uri, function (err, res, body) {
        //console.log('content-type:', res.headers['content-type']);
        //console.log('content-length:', res.headers['content-length']);
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};

request(argv._[0], function (error, response, body) {
    if (error !== null) {
        loader.stop();
        console.log("please type a correct url");
        return error;
    }

    const {
        JSDOM
    } = jsdom;
    const dom = new JSDOM(body);

    var metaImage = dom.window.document.querySelector("meta[property='og:image']");
    var metaVideo = dom.window.document.querySelector("meta[property='og:video:secure_url']");

    // set file name
    function setName(fileFormat) {
        var date = new Date().getTime();
        var name;
        if (argv._[1] == undefined) {
            name = date + fileFormat;
        } else {
            name = argv._[1] + fileFormat;
        }
        return name;
    }

    if (metaVideo) {
        download(metaVideo.getAttribute("content"), setName(".mp4"), function () {
            loader.stopAndPersist({
                symbol: "video",
                text: 'succesfully downloaded'
            });
        });
    } else {
        download(metaImage.getAttribute("content"), setName(".png"), function () {
            loader.stopAndPersist({
                symbol: "image",
                text: 'succesfully downloaded'
            });
        });
    }
});