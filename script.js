const posts = document.getElementById("posts")
const guess = document.getElementById('guess')
const logs = document.getElementById('guessLogs')
const submit = document.getElementById('submit')
const mode = document.getElementById('mode')
const difficulty = document.getElementById('difficulty')
const videos = document.getElementById('videos')
const reveal = document.getElementById('reveal_reddit_logo')
const score = document.getElementById('score')
const help_open = document.getElementById('helpopen')
const help_close = document.getElementById('helpclose')
const help_modal = document.getElementById('helpmodal')

var playerscore = localStorage.getItem('score')

let SUBREDDIT_OVERRIDE = ""

let time_start
let time_end

let hard_timeout
let scorelast = ""

const easyWinScore = 25
const normalWinScore = 50
const hardWinScore = 200
const easySkip = 5
const normalSkip = 10
const hardSkip = 50

async function load() {
    posts.innerHTML = "Loading"
    guess.value = ""
    if (playerscore == null) {
        playerscore = 0
        localStorage.setItem('score', 0)
    }
    score.innerText = playerscore + scorelast
    if (localStorage.history != null) {
        localStorage.history = localStorage.history.replaceAll('null', '')
    }

    document.getElementById('help_history').innerHTML = localStorage.history + ""
    const response = await fetch('/data/q?mode='+mode.checked+"&d="+difficulty.checked+"&suboverride="+SUBREDDIT_OVERRIDE+"&videos="+videos.checked)
    const data = await response.json()

    posts.innerHTML = ""
    console.info(data.data.length +" images recieved. ")
    
    for (let i=0;i<data.data.length;i++) {
        if (data.data[i].includes("gifv")) {
            console.log()
            let video = document.createElement('video')
            let source = document.createElement('source')
            source.src = data.data[i].replace("gifv", "mp4")
            source.type = "video/mp4"
            video.appendChild(source)
            video.autoplay = true
            video.loop = true
            video.muted = true
            posts.append(video)
            //posts.innerHTML += '<video controls preload="metadata" autoplay="false" muted loop="loop"><source src="'+(data.data[i].replace("gifv", "mp4"))+'" type="video/mp4"></video>'
        } else {
            let image = new Image()
            image.src = data.data[i]
            image.loading = "lazy"
            image.classList.add('post_image')
            posts.append(image)
        }

    }




    localStorage.setItem('sub', data.subreddit)
    localStorage.setItem('real', data.real)
    logs.innerHTML = ""

    time_start = performance.now()
    if (difficulty.checked == true) {
        hard_timeout = setTimeout(function() {
            if (difficulty.checked == true) {
                submit.click()
            }

        }, 10000)
    }

}

guess.addEventListener('keyup', function(e) {
    if (guess.value.length > 0) {
        submit.innerText = "Guess"
    } else {
        submit.innerText = "Skip"
    }
})


function submit_guess_or_skip() {
    let value = guess.value.toLowerCase()
    if (value.length < 1) {
        return null
    }
    let hint = ""

    if (value == localStorage.getItem('sub').toLowerCase()) {
        time_end = performance.now()
        let m
        if (difficulty.checked == false) {
            let x = ((time_end - time_start)/1000)
            m = normalWinScore + ((60 - x)*2)
            if (m < normalWinScore) {
                m = normalWinScore
            }
            m = Math.floor(m)
            localStorage.setItem('score', parseInt(localStorage.getItem('score')) + m)
        } else if (difficulty.checked == true) {
            let x = ((time_end - time_start)/1000)
            m = hardWinScore + ((10 - x)*50)
            if (m < hardWinScore) {
                m = hardWinScore
            }
            m = Math.floor(m)
            localStorage.setItem('score', parseInt(localStorage.getItem('score')) + m)
        }
        playerscore = localStorage.getItem('score')
        let difficulty_string = ""
        if (difficulty.checked == false) { difficulty_string = "Normal" } else { difficulty_string = "Hard" }
        localStorage.setItem('history', localStorage.getItem('history') +"<strong>"+localStorage.score+" pts</strong>: +"+m+" pts for <strong><a href='https://www.reddit.com/r/"+localStorage.getItem('real')+"'>"+value+"</a></strong> in <strong>"+((time_end - time_start)/1000)+"</strong> seconds (<strong>"+difficulty_string+"</strong>)<br/>")
        localStorage.history = localStorage.history.replaceAll('null', '')
        document.getElementById('help_history').innerHTML = localStorage.history
        scorelast = " (+"+m+")"
        score.innerText = playerscore + scorelast
        clearTimeout(hard_timeout)

        logs.innerHTML = "You got it! 🎉 <br/>This was guessed in " + ((time_end - time_start)/1000) + " seconds.<br/> + " + m + " pts"

        
    } else {
        let guessIndex = localStorage.getItem('sub').toLowerCase().indexOf(value)
        if (guessIndex > -1) {
            hint = ""
            for (let i=0;i<localStorage.getItem('sub').toLowerCase().length;i++) {
                if (i < guessIndex) {
                    hint += "?"
                } else if (i == guessIndex) {
                    hint += value
                    i += value.length
                }
                if (i >= (guessIndex + value.length-1)) {
                    if (hint.charAt(i) == "") {
                        hint += "?"
                    }
                    
                }
                
            }
        }
        console.log(hint.length, localStorage.getItem('sub').toLowerCase().length)
        let parsedHint = ""
        if (hint.length > localStorage.getItem('sub').toLowerCase().length) {
            parsedHint = hint.slice(0,-1)
        } else {
            parsedHint = hint
        }
        console.log(parsedHint)


        if (parsedHint == "") {
            parsedHint = "You guessed <span style='font-style:italic'>"+value+"</span>, Keep trying..."
            logs.innerHTML = parsedHint + "<br>"
        } else {
            logs.innerHTML += "You guessed <span style='font-style:italic'>"+value+"</span>, you were close! - <span style='font-weight:700;'>"+parsedHint + "</span><br>"
        }
        

    }
    
}

submit.onclick = function() {
    clearTimeout(hard_timeout)
    if (!logs.innerHTML.includes('You got it!')) {
        let difficulty_string = ""
        if (difficulty.checked == false) { difficulty_string = "Normal" } else { difficulty_string = "Hard" }
        switch(difficulty.checked) {
            case false:
                localStorage.setItem('score', parseInt(localStorage.getItem('score')) - normalSkip)
                localStorage.setItem('history', localStorage.getItem('history') + "<strong>"+localStorage.score+" pts</strong>: -"+normalSkip+" pts because you couldn't guess <a href='https://www.reddit.com/r/"+localStorage.getItem('real')+"'><strong>"+localStorage.getItem('sub')+"</a></strong> (<strong>"+difficulty_string+"</strong>)<br/>")
                scorelast = " (-"+normalSkip+")"
                break;
            case true:
                localStorage.setItem('score', parseInt(localStorage.getItem('score')) - hardSkip)
                localStorage.setItem('history', localStorage.getItem('history') + "<strong>"+localStorage.score+" pts</strong>: -"+hardSkip+" pts because you couldn't guess <a href='https://www.reddit.com/r/"+localStorage.getItem('real')+"'><strong>"+localStorage.getItem('sub')+"</a></strong> (<strong>"+difficulty_string+"</strong>)<br/>")
                scorelast = " (-"+hardSkip+")"
                break;
        }
        localStorage.history = localStorage.history.replaceAll('null', '')
        
        playerscore = localStorage.getItem('score')

    } 
    load()
}

// videos.addEventListener('change', function() {
//     videos.checked = !videos.checked
// })

reveal.onclick = function() {
    window.open("https://www.reddit.com/r/"+localStorage.getItem('sub')+"/top")
    load()
}

guess.addEventListener('keyup', function(event) {
    if (event.keyCode === 13) {
        event.preventDefault()
        if (logs.innerHTML.includes('You got it!')) {
            submit.click()
        } else {
            submit_guess_or_skip()
        }

    }
})

help_open.addEventListener('click', function() {
    if (help_modal.style.display == 'block') {
        help_modal.style.display = 'none'
    } else {
        help_modal.style.display = 'block'
    }
})
help_close.addEventListener('click', function() {
    help_modal.style.display = 'none'
})



load()

String.prototype.replaceAt = function(index, replacement) {
    return this.substring(0, index) + replacement + this.substring(index + replacement.length);
}