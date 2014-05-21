var express = require('express'),
    routes  = require('./routes'),
    app,
    port;

// Create an express server.
app = express.createServer();
app.use(express.bodyParser());

// Use sessions for the oauth stuff
app.use(express.cookieParser());
app.use(express.session({
    secret: "somesecretstring"
}));

// Mount the routes.
routes.attach(app);

// Heroku specifies the port in "prod", otherwise
//  use port 5000 locally.
port = Number(process.env.PORT || 5000);
// Start the server
app.listen(port, function() {
  console.log("Listening on " + port);
});
