// logic.js - Clean Piped Proxy Version

let currentQuestionIndex = 0;
let stopTimer = null; 
let isPlaying = false;

// KIES HIER EEN MIRROR. 
// Opties: 'piped.video', 'piped.kavin.rocks', 'piped.mha.fi'
const PROXY_DOMAIN = "piped.video"; 

// 1. ID Extractor
function getYouTubeID(url) {
    if (!url) return "";
    let id = '';
    url = url.replace(/(>|<)/gi,'').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    if(url[2] !== undefined) {
        id = url[2].split(/[^0-9a-z_\-]/i)[0];
    } else {
        id = url;
    }
    return id;
}

// 2. Start
window.onload = function() {
    loadQuestion(currentQuestionIndex);
};

// 3. Vraag Inladen
function loadQuestion(index) {
    if (index >= quizData.length) {
        finishQuiz();
        return;
    }

    // Reset alles
    stopAudio(); 
    
    const data = quizData[index];

    // --- UI UPDATEN ---
    document.getElementById('disp-type').innerText = data.Type || "Vraag " + (index + 1);
    document.getElementById('disp-question').innerText = data.Vraag;
    document.getElementById('disp-answer').innerText = data.Antwoord;
    document.getElementById('disp-info').innerText = data.Info || "";
    document.getElementById('disp-question').style.color = "#ffffff";

    // Knoppen resetten
    document.getElementById('answer-area').style.display = 'none';
    document.getElementById('answer-area').classList.remove('visible');
    document.getElementById('btn-reveal').style.display = 'flex';
    document.getElementById('btn-next').style.display = 'none';
}

// 4. Audio Controls
function toggleAudio() {
    if (isPlaying) {
        stopAudio();
    } else {
        playAudio();
    }
}

function playAudio() {
    const data = quizData[currentQuestionIndex];
    const videoID = getYouTubeID(data.URL);
    const start = parseInt(data.StartTijd) || 0;
    const end = parseInt(data.EindTijd);
    const duration = (end - start) * 1000; 

    // Correcte Piped URL structuur (gebruikt 'time' i.p.v. 'start')
    const src = `https://${PROXY_DOMAIN}/embed/${videoID}?playerOnly=true&autoplay=1&time=${start}`;

    const playerDiv = document.getElementById('player');
    
    // Harde injectie van iframe
    playerDiv.innerHTML = `<iframe 
        width="100%" 
        height="100%" 
        src="${src}" 
        frameborder="0" 
        allow="autoplay; encrypted-media" 
        allowfullscreen
        style="pointer-events: none;">
    </iframe>`;

    // UI Updates
    isPlaying = true;
    document.getElementById('btn-play-text').innerText = "Stoppen";
    document.getElementById('waves').classList.add('playing');

    // Timer logic
    if (end > start) {
        clearTimeout(stopTimer);
        stopTimer = setTimeout(() => {
            stopAudio();
        }, duration);
    }
}

function stopAudio() {
    // Iframe verwijderen om geluid hard te stoppen
    document.getElementById('player').innerHTML = "";
    
    clearTimeout(stopTimer);
    isPlaying = false;
    
    document.getElementById('btn-play-text').innerText = "Afspelen";
    document.getElementById('waves').classList.remove('playing');
}

// 5. Overige Controls
function revealAnswer() {
    const answerArea = document.getElementById('answer-area');
    answerArea.style.display = 'block';
    setTimeout(() => { answerArea.classList.add('visible'); }, 10);
    
    document.getElementById('btn-reveal').style.display = 'none';
    document.getElementById('btn-next').style.display = 'flex';
}

function nextQuestion() {
    currentQuestionIndex++;
    loadQuestion(currentQuestionIndex);
}

function replayFragment() {
    stopAudio();
    setTimeout(playAudio, 100);
}

function finishQuiz() {
    document.getElementById('disp-question').innerText = "Einde van de Quiz!";
    document.querySelector('.controls').style.display = 'none';
    document.getElementById('answer-area').style.display = 'none';
    stopAudio();
}