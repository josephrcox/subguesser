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
    var SUBREDDIT_OVERRIDE = req.query.suboverride
    var videos = req.query.videos // "videos" == yes, "no videos" == no
    var difficulty = 2
    if (req.query.d.toLowerCase() == "easy") {
        difficulty = 10
    } else {
        difficulty = 3
    }

    if (req.query.mode == "clean") {
        endpoint = "https://www.reddit.com/r/random/top/.json?t=all&count=250" 
    } else if (req.query.mode == "nsfw") {
        endpoint = "https://www.reddit.com/r/randnsfw/top/.json?t=all&count=250" 
    }
    if (SUBREDDIT_OVERRIDE != "" && SUBREDDIT_OVERRIDE != undefined) {
        endpoint = "https://www.reddit.com/r/" + SUBREDDIT_OVERRIDE + "/top/.json?t=all&count=250" 
    }
    
    var posts = []
    var subreddit = ""
    while (posts.length < 5) {
        try {
            var lastpostid = ""
            posts = []
            var subreddit = ""

            console.log("fetching "+endpoint)

            var response = await axios(endpoint)
            for (let j=0;j<difficulty;j++) {
                console.log(response.data.data.children.length + " posts fetched from "+endpoint+"&after="+lastpostid)
                for (let i=0;i<response.data.data.children.length;i++) {
                    let post = response.data.data.children[i]
                    if (post.data.post_hint == "image" && (post.data.url_overridden_by_dest.includes("imgur") || post.data.url_overridden_by_dest.includes("redd.it")) && !post.data.subreddit.toLowerCase().includes("onlyfans")) {
                        posts.push(post.data.url_overridden_by_dest)
            
                    } else {
                        //console.log(post.data)
                    }
                    if (i == response.data.data.children.length -1) {
                        
                        lastpostid = post.data.name
                    }
                }
                if (posts.length >= 5) {
                    subreddit = response.data.data.children[0].data.subreddit
                    response = await axios("https://www.reddit.com/r/"+subreddit+"/top/.json?t=all&count=250"+"&after="+lastpostid)
                    console.log(response.data.data.children)
                    for (let i=0;i<response.data.data.children.length;i++) {
                        let post = response.data.data.children[i]
                        if (post.data.post_hint == "image" && (post.data.url_overridden_by_dest.includes("imgur") || post.data.url_overridden_by_dest.includes("redd.it")) && !post.data.subreddit.toLowerCase().includes("fans")) {
                            posts.push(post.data.url_overridden_by_dest)
                
                        } else if (post.data.post_hint == "link" &&  (post.data.url_overridden_by_dest.includes("imgur")) && !videos.includes("no") && !post.data.subreddit.toLowerCase().includes("fans")) {
                            posts.push(post.data.url_overridden_by_dest)
                        } else {
                            //console.log(post.data)
                        }
                        if (i == response.data.data.children.length -1) {
                            lastpostid = post.data.name
                        }
                    }
                }
            }

        } catch(err) {
            console.log(err.message)
        }
        
        
    }
    let parsed = subreddit.replaceAll('_','')
    res.json({data:posts, subreddit:parsed, real:subreddit})
})

app.get('/testing', function(req,res) {

    res.json({status:'ok'})
})

// KEEP AT BOTTOM OF PAGE NOMATTER WHAT
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log('Listening on port', port);
});