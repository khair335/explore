/**
 *  @file proxy.local.js
 *  @brief Local proxy for development
 */
import http from 'http';
import httpProxy from 'http-proxy';
import path from "path";

//
// Create a proxy server with custom application logic
//
var proxy = httpProxy.createProxyServer({});

// To modify the proxy connection before data is sent, you can listen
// for the 'proxyReq' event. When the event is fired, you will receive
// the following arguments:
// (http.ClientRequest proxyReq, http.IncomingMessage req,
//  http.ServerResponse res, Object options). This mechanism is useful when
// you need to modify the proxy request before the proxy connection
// is made to the target.
//
proxy.on('proxyReq', function (proxyReq, req, res, options) {
	proxyReq.setHeader('locale', 'en-us');
});

var server = http.createServer(function (req, res) {
	// You can define here your custom logic to handle the request
	// and then proxy the request.


	if (req.url.startsWith('/api') || req.url.startsWith('/media') || req.url.startsWith('/pubdate') || req.url.startsWith('/json')) {				// For local development.
		proxy.web(req, res, {
			changeOrigin: true,
			target: 'https://stage-symantec.aws.broadcom.com/',
			auth: 'avagoredo:PA55',
		});
	}
	else {
		proxy.web(req, res, {
			target: 'http://localhost:3000'
		});
	}
});

console.log("proxy listening on port 3001")
server.listen(3001); //listens on port 3000 -> http://localhost:3001/