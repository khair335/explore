"use strict";

var express = require('express');

var app = express();

var path = require("path");

var request = require('request');

var bodyParser = require('body-parser');

var fs = require('fs');

var ejs = require('ejs');

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views'); // Set our server views directory.
// TODO: For now we are just hand coding it. Later search directory if file exists then serve it up

app.use('/js', express.static(__dirname + './../../public/js'));
app.use('/css', express.static(__dirname + './../../public/css'));
app.use('/img', express.static(__dirname + './../../public/img'));
app.use('/_placeholder', express.static(__dirname + './../../public/_placeholder'));
app.use(bodyParser.urlencoded({
  extended: false
})); // parse application/x-www-form-urlencoded

app.use(bodyParser.json()); // parse application/json

var getHead = function getHead(locale, data) {
  return {
    locale: locale,
    title: data.BrowserTitle || "Broadcom Inc. | Connecting Everything",
    status: parseInt(data.StatusCode) || 200,
    meta: {
      "og:title": "Broadcom Limited | Connecting Everything",
      "meta_keywords": data["meta_keywords"],
      "meta_description": data["meta_description"],
      "og:description": data["og:description"],
      "og:url": data["og:url"],
      "canonical": data["canonical"],
      "twitter:card": data["twitter:card"],
      "twitter:site": data["twitter:site"]
    }
  };
};

app.get('/justlayout', function (req, res) {
  var locale = "en-us"; // Get our locale from whoever requested us.

  if (req.headers['locale']) {
    locale = req.headers['locale'];
  } // Just get our home meta data.


  request("".concat(req.protocol, "://").concat(req.headers.host, "/api/getmetadata?vanityurl=&locale=").concat(locale), {
    json: true
  }, function (err, response, data) {
    if (err) {
      return console.log(err);
    }

    var dynamic = getHead(locale, data); //dynamic.content = "test";//ReactDOMServer.renderToString(element)
    // Use ejs to render our page, since we are dynamically setting data.

    res.status(dynamic.status).render('pages/justlayout', dynamic);
  });
});
app.get('/justheader', function (req, res) {
  var locale = "en-us"; // Get our locale from whoever requested us.

  if (req.headers['locale']) {
    locale = req.headers['locale'];
  } // Just get our home meta data.


  request("".concat(req.protocol, "://").concat(req.headers.host, "/api/getmetadata?vanityurl=&locale=").concat(locale), {
    json: true
  }, function (err, response, data) {
    if (err) {
      return console.log(err);
    }

    var dynamic = getHead(locale, data); //dynamic.content = "test";//ReactDOMServer.renderToString(element)
    // Use ejs to render our page, since we are dynamically setting data.

    res.status(dynamic.status).render('pages/justheader', dynamic);
  });
});
app.get('/justfooter', function (req, res) {
  var locale = "en-us"; // Get our locale from whoever requested us.

  if (req.headers['locale']) {
    locale = req.headers['locale'];
  } // Just get our home meta data.


  request("".concat(req.protocol, "://").concat(req.headers.host, "/api/getmetadata?vanityurl=&locale=").concat(locale), {
    json: true
  }, function (err, response, data) {
    if (err) {
      return console.log(err);
    }

    var head = getHead(locale, data); // Use ejs to render our page, since we are dynamically setting data.

    res.status(head.status).render('pages/justfooter', head);
  });
});
app.use(function (req, res, next) {
  if (path.extname(req.path).length > 0) {
    // normal static file request		
    var filepath = path.resolve(__dirname + '/../../public' + req.path);
    var publicpath = path.resolve(__dirname + '/../../public'); // Make sure we don't go beyond our public directory.

    if (filepath.startsWith(publicpath) && fs.existsSync(filepath)) {
      res.sendFile(filepath);
    } else {
      next();
    }
  } else {
    var locale = "en-us"; // Get our locale from whoever requested us.

    if (req.headers['locale']) {
      locale = req.headers['locale'];
    } //console.log(req.headers.host, req.url, req.protocol, req.baseUrl);
    // HACK: We need to remove the leading forward slash.


    var _path = req.url.replace(/^\//g, ''); // We need to figure out if we are good.


    request("".concat(req.protocol, "://").concat(req.headers.host, "/api/getmetadata?vanityurl=").concat(_path, "&locale=").concat(locale), {
      json: true
    }, function (err, response, data) {
      if (err) {
        return console.log(err);
      }

      var head = getHead(locale, data); // Use ejs to render our page, since we are dynamically setting data.

      res.status(head.status).render('pages/index', head);
    });
  }
});
app.listen(3000); //listens on port 3000 -> http://localhost:3000/

console.log("UI server listening on port 3000");
