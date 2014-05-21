# Camayak - Content API to Tumblr integration

This is a sample Node.js application showing how to use Camayak's Content API to publish assignments to a Tumblr blog.

## Getting Started

This sample application requires Node.js (version 0.10.x).  To install Node.js see the [Node.js Documentation](http://nodejs.org).

The app is also configured to be deployed and run on [Heroku](https://www.heroku.com/) .  It can also be run locally.  To deploy the app to Heroku, first follow the [Heroku Quickstart](https://devcenter.heroku.com/articles/quickstart) to create an account, if you don't already have one, and to get the Heroku tools installed to your development machine.

You will also need a [Tumblr](https://www.tumblr.com/) account to publish content to.

### Building and deploying the sample app

Clone this repo to your development environment:

`git clone https://github.com/camayak/contentapi-node-tumblr.git`

Register the application with Heroku:

`heroku create`

Using the app name/url you got back from the `heroku create` command, you'll need to update the 
`/controllers/index.js#get_tokens()` oauth callback url to point to your app on Heroku.  Save and `git commit` this change.

Deploy the application to Heroku:

`git push heroku master`

### Creating Tumblr oAuth tokens

1. Log into Tumblr
1. Create a new Tumblr App:
  1. Go to http://www.tumblr.com/oauth/apps
  1. Click "Register Application"
  1. Fill out application data
    * "Default Callback URL" is required, but not directly used.  You can enter the URL for your Heroku app deployed in an earlier step
  1. From the Tumblr app page, copy the Consumer Key and Consumer Secret into environment variables in Heroku:
    * `heroku config:set TUMBLR_BLOG_NAME=<your tumblr blog name>`
    * `heroku config:set TUMBLR_CONSUMER_KEY=<consumer key from tumblr>`
    * `heroku config:set TUMBLR_CONSUMER_SECRET=<consumer secret from tumblr>`
  1. In your browser, visit `http://<your heroku url>/get_tokens`.  This should go through the oAuth process on Tumblr to authorize access to your account.  In the end, your oAuth token and secret should be displayed in the web browser.  Copy those into environment variables in Heroku:
    * `heroku config:set TUMBLR_OAUTH_TOKEN=<oauth token from tumblr>`
    * `heroku config:set TUMBLR_OAUTH_SECRET=<oauth secret from tumblr>`

### Create your Publishing API destination in Camayak

1. Copy the API and optional shared secret into environment variables in Heroku:
    * `heroku config:set CAMAYAK_API_KEY=<api_key from Camayak>`
    * `heroku config:set CAMAYAK_SHARED_SECRET=<shared secret from Camayak>` - Only if using a shared secret.  Otherwise, don't create this environment variable.

