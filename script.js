const posts = document.getElementById("posts")
const guess = document.getElementById('guess')
const logs = document.getElementById('guessLogs')
const skip = document.getElementById('skip')
const mode = document.getElementById('mode')
const difficulty = document.getElementById('difficulty')
const reveal = document.getElementById('reveal')
const score = document.getElementById('score')
const help_open = document.getElementById('helpopen')
const help_close = document.getElementById('helpclose')
const help_modal = document.getElementById('helpmodal')

var playerscore = localStorage.getItem('score')

let time_start
let time_end

let hard_timeout

async function load() {
    posts.innerHTML = "LOADING NEW POSTS..."
    guess.value = ""
    if (localStorage.history != null) {
        localStorage.history = localStorage.history.replaceAll('null', '')
    }

    document.getElementById('help_history').innerHTML = localStorage.history
    const response = await fetch('/data/q?mode='+mode.innerText.toLowerCase()+"&d="+difficulty.innerText)
    const data = await response.json()

    posts.innerHTML = ""
    console.info(data.data.length +" images recieved. ")
    for (let i=0;i<data.data.length;i++) {
        let maxHeight = Math.floor(Math.random() * (500 - 200 + 1)) + 200;
        posts.innerHTML += "<img src='"+data.data[i]+"' style='max-height:"+maxHeight+"px;'>"
    }

    localStorage.setItem('sub', data.subreddit)
    logs.innerHTML = ""

    if (playerscore == null) {
        playerscore = 0
        localStorage.setItem('score', 0)
    }
    score.innerHTML = playerscore
    time_start = performance.now()
    if (difficulty.innerText == "Hard") {
        hard_timeout = setTimeout(function() {
            if (difficulty.innerText == "Hard") {
                skip.click()
            }

        }, 10000)
    }
}



function submit() {
    let value = guess.value.toLowerCase()
    if (value.length < 1) {
        return null
    }
    let hint = ""

    if (value == localStorage.getItem('sub').toLowerCase()) {
        time_end = performance.now()
        let m
        if (difficulty.innerText == "Easy") {
            let x = ((time_end - time_start)/1000)
            m = 25 + ((60 - x)*2)
            if (m < 25) {
                m = 25
            }
            m = Math.floor(m)
            localStorage.setItem('score', parseInt(localStorage.getItem('score')) + m)
        } else if (difficulty.innerText == "Normal") {
            let x = ((time_end - time_start)/1000)
            m = 50 + ((60 - x)*3)
            if (m < 50) {
                m = 50
            }
            m = Math.floor(m)
            localStorage.setItem('score', parseInt(localStorage.getItem('score')) + m)
        } else if (difficulty.innerText == "Hard") {
            let x = ((time_end - time_start)/1000)
            m = 200 + ((10 - x)*50)
            if (m < 200) {
                m = 200
            }
            m = Math.floor(m)
            localStorage.setItem('score', parseInt(localStorage.getItem('score')) + m)
        }
        playerscore = localStorage.getItem('score')
        localStorage.setItem('history', localStorage.getItem('history') +"<strong>"+m+"</strong> pts for <strong><a href='https://www.reddit.com/r/"+value+"'>"+value+"</a></strong> in <strong>"+((time_end - time_start)/1000)+"</strong> seconds (<strong>"+difficulty.innerText+"</strong>)<br/>")
        document.getElementById('help_history').innerHTML = localStorage.history
        score.innerHTML = playerscore
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

skip.onclick = function() {
    clearTimeout(hard_timeout)
    if (!logs.innerHTML.includes('You got it!')) {
        localStorage.setItem('history', localStorage.getItem('history') + "You couldn't guess <a href='https://www.reddit.com/r/"+localStorage.getItem('sub')+"'><strong>"+localStorage.getItem('sub')+"</a></strong> (<strong>"+difficulty.innerText+"</strong>)<br/>")
    }
    load()
}

mode.onclick = function() {
    if (mode.innerText == "Clean") {
        mode.innerText = "NSFW"
        mode.style.backgroundColor = "RED"
        mode.style.color = "black"
    } else if (mode.innerText == "NSFW") {
        mode.innerText = "Clean"
        mode.style.backgroundColor = "BLUE"
        mode.style.color = "White"
    }
}

difficulty.onclick = function() {
    if (difficulty.innerText == "Normal") {
        difficulty.innerText = "Hard"
        difficulty.style.backgroundColor = "RED"
        difficulty.style.color = "black"
    } else if (difficulty.innerText == "Easy") {
        difficulty.innerText = "Normal"
        difficulty.style.backgroundColor = "BLUE"
        difficulty.style.color = "White"
    } else if (difficulty.innerText = "Hard") {
        difficulty.innerText = "Easy"
        difficulty.style.backgroundColor = "Lightgreen"
        difficulty.style.color = "black"
    }
}

reveal.onclick = function() {
    window.open("https://www.reddit.com/r/"+localStorage.getItem('sub')+"/top")
    load()
}

guess.addEventListener('keyup', function(event) {
    if (event.keyCode === 13) {
        event.preventDefault()
        if (logs.innerHTML.includes('You got it!')) {
            skip.click()
        } else {
            submit()
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