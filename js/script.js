
let currentsong = new Audio()
let songs
let currFolder;

function convertSecondsToMinutes(seconds) {
    // If seconds is 0 or less, return "00:00"
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    // Ensure the input is an integer (remove milliseconds if any)
    seconds = Math.floor(seconds);

    // Calculate the minutes and remaining seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    // Pad the minutes and seconds with leading zeros if necessary
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(remainingSeconds).padStart(2, '0');

    // Return the formatted time string
    return `${paddedMinutes}:${paddedSeconds}`;
}
async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`/${folder}`)
    let response = await a.text()
    // console.log(response)
    
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    // return songs
    // Show all the songs in the playlist
    let songUl = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUl.innerHTML = ""
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML +

            `<li>
                            <img class="invert" src="img/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Vivek</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img src="img/play.svg" alt="">
                            </div>
                        </li>`
    }

    
    //Attach event listener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            // console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })

    })

    return songs
}

const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track)
    currentsong.src = `/${currFolder}/` + track
    if (!pause) {
        currentsong.play()
        play.src = "/img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums() {
    let a = await fetch(`/songs`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardcontainer = document.querySelector(".cardcontainer")
    let arr = Array.from(anchors)
    for (let index = 0; index < arr.length; index++) {
        const e = arr[index];
        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0]
            //get the metadata of the folder
            let a = await fetch(`../Songs/${folder}/info.json`)
            let response = await a.json()
            // console.log(response)
            cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="38" height="38"
                                fill="none">
                                <circle cx="12" cy="12" r="12" fill="#1fdf64" />
                                <polygon points="9,7 17,12 9,17" fill="black" />
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpeg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }

    //Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })
}

async function main() {

    // get the list of all the songs
    await getSongs("Songs/cs")
    playMusic(songs[0], true)

    //display all the albums
    displayAlbums()

    //Attach event listener to play, next and previous
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentsong.pause()
            play.src = "img/play.svg"
        }
    })

    //Listen for timeDuration event
    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${convertSecondsToMinutes(currentsong.currentTime)} / ${convertSecondsToMinutes(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%"
    })

    currentsong.addEventListener("ended", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        } else {
            // Optional: Loop back to the first song if the current song is the last in the list
            playMusic(songs[0]);
        }
    });

    //Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = ((currentsong.duration) * percent) / 100
    })

    //Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    //Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-114%"
    })

    //Add an event listener to previous 
    previous.addEventListener("click", () => {
        currentsong.pause()
        // console.log("Previous Clicked")
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
        if ((index - 1) < 0) {
            currentsong.paused
            play.src = "img/play.svg"
            currentsong.currentTime = ((currentsong.duration) * 0) / 100
            currentsong.play()
            play.src = "img/pause.svg"
        }
    })

    //Add an event listener to next
    next.addEventListener("click", () => {
        currentsong.pause()
        console.log("Next Clicked")
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
        if ((index + 1) >= songs.length) {
            currentsong.paused
            play.src = "img/play.svg"
            currentsong.currentTime = ((currentsong.duration) * 0) / 100
            currentsong.play()
            play.src = "img/pause.svg"
        }
    })

    //Add and event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting Volume to " + e.target.value + "/100")
        currentsong.volume = parseInt(e.target.value) / 100
        if (currentsong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
        if (currentsong.volume == 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("volume.svg", "mute.svg")
        }
    })

    // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentsong.volume = 0
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentsong.volume = 0.1
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10
        }
    })

}

main()