var index = require('./controllers/index');

exports.attach = function(app) {
  app.get('/'            , index.ping);
  app.get('/webhook/'    , index.ping);
  app.post('/webhook/'   , index.tumblr);
  // These are used to fetch oAuth tokens from Tumblr
  //  for configuration of the demo.
  // REMOVE THESE ROUTES AFTER GETTING TOKENS
  app.get('/get_tokens/' , index.get_tokens);
  app.get('/oauth/'      , index.oauth_callback);
};
