
/* --------------------------------------------------
   GET YOUTUBE API KEY FROM CONFIG FILE
-------------------------------------------------- */

const API_KEY = typeof CONFIG !== "undefined"
  ? CONFIG.YOUTUBE_API_KEY
  : null;

/* Chart instance reference (used to destroy previous chart before drawing new one) */
let moodChart = null;


/* --------------------------------------------------
   SEARCH YOUTUBE FOR SONGS BASED ON QUERY
-------------------------------------------------- */

async function searchYouTube(query){

/* If API key is missing, stop execution */
if(!API_KEY){
console.error("Missing API key");
return {items:[]};
}

/* YouTube search API request
   - videoEmbeddable=true ensures playable videos
   - videoDuration=medium filters out very short videos (reduces Shorts)
*/
const url=`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoEmbeddable=true&videoDuration=medium&maxResults=15&q=${encodeURIComponent(query)}&key=${API_KEY}`;

try{

/* Send request to YouTube API */
const res=await fetch(url);

/* Convert response to JSON */
return await res.json();

}catch(err){

/* Handle API/network errors */
console.error("YouTube API error",err);
return {items:[]};

}

}


/* --------------------------------------------------
   CREATE YOUTUBE PLAYER LINK
-------------------------------------------------- */

function createPlayer(videoId){

/* Create container element */
const player=document.createElement("div");

/* Create clickable YouTube link */
player.innerHTML=`
<a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" rel="noopener noreferrer">
▶ Play on YouTube
</a>
`;

return player;

}


/* --------------------------------------------------
   MAIN FUNCTION: GET SONG BASED ON MOOD
-------------------------------------------------- */

async function getSong(mood){

/* Get UI elements */
const status=document.getElementById("status");
const result=document.getElementById("result");
const player=document.getElementById("player");

/* Show loading message */
status.textContent="Finding your vibe...";

/* Convert mood text into search query using moodAI */
const query=interpretMood(mood);

/* Call YouTube API */
const data=await searchYouTube(query);

/* Clear loading message */
status.textContent="";

/* If no videos found */
if(!data.items || data.items.length===0){

status.textContent="No songs found";
return;

}

/* Pick random video from results */
const item=data.items[Math.floor(Math.random()*data.items.length)];

/* Extract video information */
const vid=item.id.videoId;
const title=item.snippet.title;
const channel=item.snippet.channelTitle;
const thumb=item.snippet.thumbnails.default.url;

/* Display thumbnail */
document.getElementById("thumb").src=thumb;

/* Display video title and channel */
document.getElementById("meta").innerHTML=`<strong>${title}</strong><br>${channel}`;

/* Clear previous player */
player.innerHTML="";

/* Add new player link */
player.appendChild(createPlayer(vid));

/* Show result container */
result.style.display="flex";

/* Show equalizer animation */
document.querySelector(".equalizer").style.display="flex";

/* Show feedback buttons */
document.getElementById("feedback").style.display="block";

/* Update status text */
status.textContent="🎵 Your vibe today";

/* Save last video info to Chrome storage */
chrome.storage.local.set({
lastVideo:{vid,title,channel,thumb,mood}
});

/* Update mood analytics */
updateMoodAnalytics(mood);

}


/* --------------------------------------------------
   UPDATE MOOD ANALYTICS DATA
-------------------------------------------------- */

function updateMoodAnalytics(mood){

/* Get existing stats from storage */
chrome.storage.local.get(["moodStats"],(data)=>{

const stats=data.moodStats||{};

/* Increase counter for this mood */
stats[mood]=(stats[mood]||0)+1;

/* Save updated stats */
chrome.storage.local.set({moodStats:stats});

/* Update chart */
displayAnalytics(stats);

});

}


/* --------------------------------------------------
   DISPLAY ANALYTICS CHART
-------------------------------------------------- */

function displayAnalytics(stats){

/* Get chart canvas */
const ctx=document.getElementById("moodChart");

if(!ctx) return;

/* Extract labels and values */
const moods=Object.keys(stats);
const counts=Object.values(stats);

/* Destroy old chart before drawing new one */
if(moodChart){
moodChart.destroy();
}

/* Create bar chart using Chart.js */
moodChart=new Chart(ctx,{
type:"bar",
data:{
labels:moods,
datasets:[{
label:"Mood Usage",
data:counts
}]
},
options:{
responsive:true,
plugins:{
legend:{display:false}
}
}
});

}


/* --------------------------------------------------
   GET SONG BUTTON CLICK
-------------------------------------------------- */

document.getElementById("getSong").addEventListener("click",()=>{

/* Get mood input */
const mood=document.getElementById("moodInput").value.trim();

/* Validate input */
if(!mood){

document.getElementById("status").textContent="Tell me your mood first ✨";
return;

}

/* Fetch song */
getSong(mood);

});


/* --------------------------------------------------
   ENTER KEY SUPPORT
-------------------------------------------------- */

document.getElementById("moodInput").addEventListener("keypress",(e)=>{

/* If Enter key pressed trigger search */
if(e.key==="Enter"){
document.getElementById("getSong").click();
}

});


/* --------------------------------------------------
   QUICK MOOD BUTTONS
-------------------------------------------------- */

document.querySelectorAll(".moodBtn").forEach(btn=>{

btn.addEventListener("click",()=>{

/* Use button text as mood */
const mood=btn.textContent;

/* Fill input box */
document.getElementById("moodInput").value=mood;

/* Fetch song */
getSong(mood);

});

});


/* --------------------------------------------------
   OPEN VIDEO IN NEW TAB
-------------------------------------------------- */

document.getElementById("openTab").addEventListener("click",async()=>{

/* Get last video from storage */
const data=await chrome.storage.local.get("lastVideo");

if(data.lastVideo){

/* Open video in new browser tab */
chrome.tabs.create({
url:`https://youtube.com/watch?v=${data.lastVideo.vid}`
});

}

});


/* --------------------------------------------------
   NEXT SONG BUTTON
-------------------------------------------------- */

document.getElementById("nextSong").addEventListener("click",async()=>{

/* Get last used mood */
const data=await chrome.storage.local.get("lastVideo");

if(data.lastVideo){

/* Fetch another recommendation for same mood */
getSong(data.lastVideo.mood);

}

});


/* --------------------------------------------------
   POSITIVE FEEDBACK BUTTON
-------------------------------------------------- */

document.getElementById("good").addEventListener("click",async()=>{

/* Get history from storage */
const data=await chrome.storage.local.get("history");

const history=data.history||[];

/* Get last video */
const last=await chrome.storage.local.get("lastVideo");

/* Save it to history */
history.push(last.lastVideo);

/* Store updated history */
chrome.storage.local.set({history});

});


/* --------------------------------------------------
   NEGATIVE FEEDBACK BUTTON
-------------------------------------------------- */

document.getElementById("bad").addEventListener("click",()=>{

/* Show feedback message */
document.getElementById("status").textContent="I'll try better next time 🌸";

});


/* --------------------------------------------------
   LOAD ANALYTICS WHEN EXTENSION OPENS
-------------------------------------------------- */

chrome.storage.local.get(["moodStats"],(data)=>{

if(data.moodStats){
displayAnalytics(data.moodStats);
}

});

