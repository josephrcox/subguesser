const axios = require('axios')
const express = require('express')
const app = express()
const path = require('path')

app.use(express.static(path.join(__dirname, './')));

// START OF ENDPOINTS

app.get('/', function(req,res) {
    res.sendFile(path.join(__dirname, '/index.html'));
})

app.get('/data/q', async function(req,res) {
    var endpoint = ""
    console.log(req.query.mode)
    if (req.query.mode == "clean") {
        endpoint = "https://www.reddit.com/r/random/top/.json?t=all" 
    } else if (req.query.mode == "nsfw") {
        endpoint = "https://www.reddit.com/r/randnsfw/top/.json?t=all" 
    }
    
    var posts = []
    var subreddit = ""
    while (posts.length < 5) {
        try {
            posts = []
            console.log("fetching "+endpoint)
            const response = await axios(endpoint)

            for (let i=0;i<response.data.data.children.length;i++) {
                let post = response.data.data.children[i]
                if (post.data.post_hint == "image" && (post.data.url_overridden_by_dest.includes("imgur") || post.data.url_overridden_by_dest.includes("redd.it")) && !post.data.subreddit.toLowerCase().includes("onlyfans")) {
                    posts.push(post.data.url_overridden_by_dest)
        
                } else {
                    console.log(post.data)
                }
            }
            if (posts.length >= 5) {
                console.log(response.data.data.children[0])
                subreddit = response.data.data.children[0].data.subreddit
            }
        } catch(err) {
            console.log(err.message)
        }
        
        
    }

    res.json({data:posts, subreddit:subreddit})
})

// KEEP AT BOTTOM OF PAGE NOMATTER WHAT
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log('Listening on port', port);
});