var tumblr  = require('tumblr.js'),
    qs      = require('querystring'),
    crypto  = require('crypto'),
    request = require('request');

// Camayak will do a "GET" to the webhook url to verify it's available.
//  just return a 200 response.
exports.ping = function(req, res) {
  res.send("Ok.", 200);
};

exports.tumblr = function(req, res) {
  var event     = req.body.event,         // The Camayak Publishing API Event type
      id        = req.body.event_id,      // The Camayak Publishing API Event ID
      url       = req.body.resource_uri;  // The URL to the Assignment in the Content API

  if (event === "validate") {
    //  Camayak will send a validate request to ensure that the webhook url
    //  entered conforms to the spec and returns an expected string "pong".
    res.send('pong', { 'Content-Type': 'text/plain' }, 200);
  } else if (event === "publish" || event === "retract") {

    //  If we have received a publish or a retract event, we need to fetch
    //  the assignment from the Camayak Content API using the url specified
    //  in the webhook response.
    //  We need to add our API key to the url specified in the webhook response
    params = {
      api_key: process.env.CAMAYAK_API_KEY
    };
    //  If we have specified a shared secret when creating the Content API
    //  publishing destination, then we add the signature to the url
    if (process.env.CAMAYAK_SHARED_SECRET) {
      params.api_sig = generate_sig();
    };

    // Add the query string paramaters to the url
    url += "?" + qs.stringify(params)
    
    // Make an HTTP GET to the content API to fetch the assignment
    request.get(url, function(err, response, body) {

      // If the content API returns an error, respond to the webhook with an error.
      if (err) {
        res.send(err, 500);
      }

      // Parse the Content API response into Javascript
      var content = JSON.parse(body);

      // Create a Tumblr client instance
      var client = tumblr.createClient({
        consumer_key:     process.env.TUMBLR_CONSUMER_KEY,
        consumer_secret:  process.env.TUMBLR_CONSUMER_SECRET,
        token:            process.env.TUMBLR_OAUTH_TOKEN,
        token_secret:     process.env.TUMBLR_OAUTH_SECRET
      });

      // Depending on whether we're publishing (new or edited), or
      //  retracting a post, call the appropriate method on the
      //  tumblr client instance.

      if (event === "publish" && content.published_id) {
        // The Content API response contained a "published_id" value
        //  which gets set when we first publish a post to tumbler.
        //  therefore, let's edit that post.
        client.edit(process.env.TUMBLR_BLOG_NAME, {
          id: content.published_id,
          title: content.heading,
          body: content.content,
          state: "published"
        }, function(err, data) {
          var webhook_response = {
            published_id: data.id
          };
          res.send(webhook_response, 200);
        });


      } else if (event === "publish") {
        // Create a new post
        client.text(process.env.TUMBLR_BLOG_NAME, {
          title: content.heading,
          body: content.content,
          state: "published"
        }, function(err, data) {
          // Return the Tumblr post id back to Camayak
          //  so it will get sent in any subsequent API
          //  responses and we can use it to edit or retract
          var webhook_response = {
            published_id: data.id
          };
          res.send(webhook_response, 200);
        });


      } else if (event === "retract" && content.published_id) {
        // If we're retracting, make the post offline by setting
        //  the status in Tumblr to "private".  This way, we can
        //  make it live again if we want.
        client.edit(process.env.TUMBLR_BLOG_NAME, {
          id: content.published_id,
          state: 'private'
        }, function(err, data) {
          var webhook_response = {
            published_id: data.id
          };
          res.send(webhook_response, 200);
        });


      } else {
        // Something unusual happened.  For instance, a retract event
        //  with no published_at.
        res.send(500);
      };
    });
  } else {
    // Event was not "validate", "publish", or "retract".  
    res.send("Unknown event type!", 500);
  };
};

// Used for fetching oAuth keys from Tumblr
exports.get_tokens = function(req, res) {
  var options = {
    url: "http://www.tumblr.com/oauth/request_token",
    oauth: {
      consumer_key:     process.env.TUMBLR_CONSUMER_KEY,
      consumer_secret:  process.env.TUMBLR_CONSUMER_SECRET,
      callback:         '<your apps url>/oauth/'       // Enter the url of where the app is running.
    }
  }
  request.post(options, function(e,r,b) {
    access_token = req.session.access_token = qs.parse(b);
    res.redirect("http://www.tumblr.com/oauth/authorize?oauth_token=" + access_token.oauth_token);
  });
};
// oAuth callback after Tumbler authentication
exports.oauth_callback = function(req,res) {
  var options = {
      url: "http://www.tumblr.com/oauth/access_token",
      oauth: {
        consumer_key:    process.env.TUMBLR_CONSUMER_KEY,
        consumer_secret: process.env.TUMBLR_CONSUMER_SECRET,
        token:           req.session.access_token.oauth_token,
        token_secret:    req.session.access_token.oauth_token_secret,
        verifier:        req.query.oauth_verifier
      }
    }
    request.post(options, function(e,r,b) {
      oauth_tokens = qs.parse(b);
      res.send(oauth_tokens);
    });
};

// Generates an HMAC signature to sign Content API request
generate_sig = function() {
  date = Math.floor(Date.now() / 1000).toString();
  hmac = crypto.createHmac("sha1", process.env.CAMAYAK_SHARED_SECRET);
  hmac.update(date);
  hmac.update(process.env.CAMAYAK_API_KEY);
  return hmac.digest("hex");
}
