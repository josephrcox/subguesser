const posts = document.getElementById("posts")
const submit = document.getElementById('submit')
const guess = document.getElementById('guess')
const logs = document.getElementById('guessLogs')
const skip = document.getElementById('skip')
const mode = document.getElementById('mode')
const difficulty = document.getElementById('difficulty')
const reveal = document.getElementById('reveal')
const score = document.getElementById('score')

var playerscore = localStorage.getItem('score')

async function load() {
    posts.innerHTML = "LOADING NEW POSTS..."
    guess.value = ""
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

}



submit.onclick = function() {
    let value = guess.value.toLowerCase()
    let hint = ""

    if (value == localStorage.getItem('sub').toLowerCase()) {
        logs.innerHTML = "YOU ARE CORRECT!"
        localStorage.setItem('score', parseInt(localStorage.getItem('score')) + 1)
        if (difficulty.innerText == "Easy") {
            playerscore += 25
        } else {
            playerscore += 100
        }
        
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
        difficulty.innerText = "Easy"
        difficulty.style.backgroundColor = "RED"
        difficulty.style.color = "black"
    } else if (difficulty.innerText == "Easy") {
        difficulty.innerText = "Normal"
        difficulty.style.backgroundColor = "BLUE"
        difficulty.style.color = "White"
    }
}

reveal.onclick = function() {
    window.open("https://www.reddit.com/r/"+localStorage.getItem('sub')+"/top")
    load()
}

guess.addEventListener('keyup', function(event) {
    if (event.keyCode === 13) {
        event.preventDefault()
        submit.click()
    }
})
load()

String.prototype.replaceAt = function(index, replacement) {
    return this.substring(0, index) + replacement + this.substring(index + replacement.length);
}