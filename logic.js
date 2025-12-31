// logic.js - Gecorrigeerde Versie

let currentQuestionIndex = 0;
let player;
let isPlaying = false;

// 1. YouTube API Laden
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 2. ID Extractor
function getYouTubeID(url) {
    if (!url) return "";
    let id = '';
    url = url.replace(/(>|<)/gi,'').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    if(url[2] !== undefined) {
        id = url[2].split(/[^0-9a-z_\-]/i);
        id = id[0];
    } else {
        id = url;
    }
    return id;
}

// 3. Start functie
function onYouTubeIframeAPIReady() {
    loadQuestion(currentQuestionIndex);
}

// 4. Vraag Inladen
function loadQuestion(index) {
    if (index >= quizData.length) {
        finishQuiz();
        return;
    }

    const data = quizData[index];
    const videoID = getYouTubeID(data.URL);

    // --- UI UPDATEN ---
    document.getElementById('disp-type').innerText = data.Type || "Vraag " + (index + 1);
    document.getElementById('disp-question').innerText = data.Vraag;
    document.getElementById('disp-answer').innerText = data.Antwoord;
    document.getElementById('disp-info').innerText = data.Info || "";
    
    // UI Resetten
    document.getElementById('answer-area').style.display = 'none';
    document.getElementById('answer-area').classList.remove('visible');
    
    document.getElementById('btn-reveal').style.display = 'flex';
    document.getElementById('btn-next').style.display = 'none';
    document.getElementById('btn-play-text').innerText = "Afspelen";
    document.getElementById('waves').classList.remove('playing');

    // --- YOUTUBE PLAYER ---
    if (player) {
        player.loadVideoById({
            'videoId': videoID,
            'startSeconds': parseInt(data.StartTijd),
            'endSeconds': parseInt(data.EindTijd)
        });
    } else {
        player = new YT.Player('player', {
            height: '100%',
            width: '100%',
            videoId: videoID,
            // [FIX] Hier stond nocookie, dat hebben we veranderd naar de normale URL
            host: 'https://www.youtube.com', 
            playerVars: {
                'playsinline': 1,
                'controls': 0,
                'showinfo': 0,
                'rel': 0,
                'start': parseInt(data.StartTijd),
                'end': parseInt(data.EindTijd),
                'origin': window.location.origin 
            },
            events: {
                'onStateChange': onPlayerStateChange,
                'onError': onPlayerError
            }
        });
    }
}

// 5. Status Monitor
function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING) {
        isPlaying = true;
        document.getElementById('btn-play-text').innerText = "Pauzeren";
        document.getElementById('waves').classList.add('playing');
    } else {
        isPlaying = false;
        document.getElementById('btn-play-text').innerText = "Afspelen";
        document.getElementById('waves').classList.remove('playing');
    }
}

// 6. Foutafhandeling
function onPlayerError(event) {
    console.log("YouTube Fout:", event.data);
    let errorMsg = "Fout bij laden video.";
    
    if (event.data === 150 || event.data === 101) {
        errorMsg = "🚫 Deze video mag niet afgespeeld worden (Copyright).";
    } else if (event.data === 2) {
        errorMsg = "🚫 Video ID ongeldig (URL fout).";
    }

    // Toon de fout in de UI zodat je niet vastloopt
    document.getElementById('disp-question').innerText = errorMsg;
    document.getElementById('disp-question').style.color = "#ff5555"; 
    
    // Maak 'Volgende' knop zichtbaar
    document.getElementById('btn-reveal').style.display = 'none';
    document.getElementById('btn-next').style.display = 'flex';
}

// 7. Controls
function toggleAudio() {
    if (!player) return;
    const state = player.getPlayerState();
    if (state === 1) player.pauseVideo();
    else player.playVideo();
}

function revealAnswer() {
    const answerArea = document.getElementById('answer-area');
    answerArea.style.display = 'block';
    setTimeout(() => { answerArea.classList.add('visible'); }, 10);
    
    document.getElementById('btn-reveal').style.display = 'none';
    document.getElementById('btn-next').style.display = 'flex';
}

function nextQuestion() {
    // Reset kleur van vraag tekst (voor als er een error was)
    document.getElementById('disp-question').style.color = "#ffffff";
    
    currentQuestionIndex++;
    loadQuestion(currentQuestionIndex);
}

function replayFragment() {
    if (!player) return;
    const data = quizData[currentQuestionIndex];
    player.seekTo(parseInt(data.StartTijd));
    player.playVideo();
}

function finishQuiz() {
    document.getElementById('disp-question').innerText = "Einde van de Quiz!";
    document.querySelector('.controls').style.display = 'none';
    document.getElementById('answer-area').style.display = 'none';
    if(player) player.stopVideo();
}
