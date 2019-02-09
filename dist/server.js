
const zlib = require('zlib');
const http = require('http');
const fs = require('fs');
const url = require('url');

// var express = require('express')
// var cors = require('cors');
// var app = express();
// app.use(cors());
// var whitelist = ['http://localhost:1337/', 'http://weloveiconfonts.com/'];
// var corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   }
// }

http.createServer((request, response) => {

	console.log('URL: ' + request.url);
	let myURL = url.parse(request.url);
  console.log('Path Name=> ' + myURL.pathname);

	let fileName = '.' + myURL.pathname;
	if(request.url === '/'){
		fileName = 'index.html';
	}else{

	}
  let contentType = 'application/octet-stream';
  if(fileName.endsWith('.js')|| fileName.endsWith('.JS')){
    contentType = 'application/javascript ; charset=UTF-8';
  }else if(fileName.endsWith('.js.map')){
    contentType = 'application/json';
  }else if(fileName.endsWith('.css') || fileName.endsWith('.CSS')){
    contentType = 'text/css; charset=UTF-8';
  }else if(fileName.endsWith('.html') || fileName.endsWith('.HTML')){
    contentType = 'text/html; charset=UTF-8';
  }else if(fileName.endsWith('.jpg') || fileName.endsWith('.JPG')){
    contentType = 'image/jpeg';
  }else if(fileName.endsWith('.png') || fileName.endsWith('.PNG')){
    contentType = 'image/png';
  }

  const raw = fs.createReadStream(fileName);
  raw.on('error', ()=>{
    console.log('requesting error >>>>>');
    response.statusCode = 404;
  });

  raw.on('open', ()=>{
    let acceptEncoding = request.headers['accept-encoding'];
    if (!acceptEncoding) {
      acceptEncoding = '';
    }
    // Note: This is not a conformant accept-encoding parser.
    // See https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.3
    if (/\bdeflate\b/.test(acceptEncoding)) {
      response.writeHead(200, { 'Content-Encoding': 'deflate' ,'Content-Type': contentType});
      raw.pipe(zlib.createDeflate()).pipe(response);
    } else if (/\bgzip\b/.test(acceptEncoding)) {
      response.writeHead(200, { 'Content-Encoding': 'gzip','Content-Type': contentType });
      raw.pipe(zlib.createGzip()).pipe(response);
    } else {
      response.writeHead(200, {});
      raw.pipe(response);
    }
  });


}).listen(9000);