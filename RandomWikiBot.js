// Dependencies
var request = require("request"),
		TwitterBot = require("node-twitterbot").TwitterBot;

// Config options
const POSTS_PER_INTERVAL = 1,
	  	INTERVAL_MINUTES = 120,
	  	categories = ["Mathematical_problems", "Physics", "Memory", "Cognitive_biases", "Algorithms"];

// Twitter Bot credentials
var Bot = new TwitterBot({
  "consumer_secret": "consumer_secret",
  "consumer_key": "consumer_key",
	"access_token": "access_token",
  "access_token_secret": "access_token_secret"
});

RandomWiki();
setInterval(RandomWiki, (INTERVAL_MINUTES * 60 * 1000));

// This function will be called during every interval
function RandomWiki() {

	// Get random value out of array
	Array.prototype.sample = function() {
	  return this[Math.floor(Math.random() * this.length)];
	}

	for (var i = 0; i < POSTS_PER_INTERVAL; i++) {
		// Get random category from above list of categories
		var category = categories.sample();

		// Form API URL to fetch pages of category and send a GET request for the same
		var url = "https://en.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=Category:" + category + "&cmlimit=500&format=json";
		request({
		    url: url,
		    json: true
		}, function (error, response, body) {
			if (!error && response.statusCode === 200) {

				// Get list of members of category
				var pages = body.query.categorymembers;

				// Filter out non-page members (subcategories and users)
				pages = pages.filter(function(i) {
					return (i.ns == 0);
				});

				// Get random page
				var page = pages.sample();
				try {
					var twitter_post = "[" + category + "] - " + page.title + ": https://en.wikipedia.org/?curid=" + page.pageid;
					// Print in console and tweet
					console.log(new Date().getHours() + ":" + new Date().getMinutes() + " - " + twitter_post);
					var tweetAction = Bot.addAction("tweet", function(twitter, action, tweet) {
						Bot.tweet(twitter_post);
					});
		    		Bot.now(tweetAction);
				}
				catch(e) {
					console.error("There might be a problem accessing the category: " + category + ". Check for any misspell. Note that category URLs are case sensitive.");
				}
			}
			else {
		    	console.error("An error occurred while fetching data from: '" + url + "'\nResponse: '" + response.statusCode  + "'\n"  + error);
		    }
		})
	}
}