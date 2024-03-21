//required common core modules
const http = require('http');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;


const logEvents = require('./logEvents');

const EventEmitter = require('events'); //importing the events module

class Emitter extends EventEmitter {}; //creating a new instance of the EventEmitter class
//initialize object
const myEmitter = new Emitter();

myEmitter.on('log', (msg, fileName) => logEvents(msg, fileName));

//Define a port for our web server

const PORT = process.env.PORT || 3500;


//A function to be created before server and after the port
//This function will serve the file and send the response
const serveFile = async (filePath, contentType, response) => {
    try{
        const rawData = await fsPromises.readFile(
            filePath, 
            !contentType.includes('image') ? 'utf-8' : '' //if the content type is not an image, read the file as utf-8 else read it as binary
        );
        const data = contentType === 'application/json' ? JSON.parse(rawData) : rawData; //parse the data if it's JSON
        response.writeHead(
            filePath.includes('404.html') ? 404 : 200, //if the file is 404.html, send a 404 status code else send 200 
            {'Content-Type': contentType}

        );
        response.end(
            contentType === 'application/json' ? JSON.stringify(data) : data //stringify the data if it's JSON
        );
    } catch (err){
        console.log(err);
        myEmitter.emit('log', `${err.name}: ${err.message}`, 'errLog.txt'); //emit the log event with the error name and message
        response.statusCode = 500;
        response.end();
    }
};

//Create a web server

const server = http.createServer((req, res) => {
    console.log(req.url, req.method); //log the request url and method '/' and 'GET'
    myEmitter.emit('log', `${req.url}\t${req.method}`, 'reqLog.txt'); //emit the log event with the request url and method

    const extension = path.extname(req.url); //get the file extension of the request url

    let contentType;

    switch (extension){
        case '.css':
            contentType = 'text/css';
            break;
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
            contentType = 'image/jpeg';
            break;
        case '.txt':
            contentType = 'text/plain';
            break;
        default:
            contentType = 'text/html';
    }

    // chained ternary statements
    let filePath =
        contentType === 'text/html' && req.url === '/'
            ? path.join(__dirname, 'views', 'index.html')
            : contentType === 'text/html' && req.url.slice(-1) === '/'
                ? path.join(__dirname, 'views', req.url, 'index.html')
                : contentType === 'text/html'
                    ? path.join(__dirname, 'views', req.url)
                    : path.join(__dirname, req.url);
    
    // makes .html extension not required in the browser
    if (!extension && req.url.slice(-1) !== '/') filePath += '.html';

    const fileExists = fs.existsSync(filePath);

    if (fileExists){
        //serve the file
        serveFile(filePath, contentType, res);  

    } else{
        switch(path.parse(filePath).base){
            case 'old-page.html':
                res.writeHead(301, {'Location': '/new-page.html'}); //redirect to new page
                res.end();
                break;
            case 'www-page.html':
                res.writeHead(301, {'Location': '/'}); //redirect to home page
                res.end();
                break;
            default:
                //serve a 404 response
                serveFile(path.join(__dirname, 'views', '404.html'), 'text/html', res); 
        }
    }


});

//Listen for requests
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));