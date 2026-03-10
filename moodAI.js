/* --------------------------------------------------
   EMOTION KEYWORDS
   --------------------------------------------------

   Maps different emotions to keywords that users
   might type in the input box.

   Example:
   "I feel lonely" → detects "sad"
*/

const emotionKeywords = {
sad:["cry","lonely","hurt","breakup","depressed"],
happy:["happy","joy","excited","good"],
study:["study","focus","exam","work"],
sleepy:["sleep","tired","night"],
gym:["gym","workout","exercise"]
};



/* --------------------------------------------------
   GENRE PRIORITY FOR EACH EMOTION
   --------------------------------------------------

   Each emotion maps to YouTube search queries.
   Multiple options allow random recommendations.

   Example:
   sad → emotional piano / sad music
*/

const genrePriority={
study:["lofi study music","deep focus music","instrumental study"],
gym:["workout edm","gym motivation music"],
sleepy:["ambient sleep music","calm piano sleep"],
sad:["sad emotional music","slow piano emotional"],
happy:["upbeat pop music","happy vibe playlist"]
};



/* --------------------------------------------------
   SIMPLE SENTIMENT WORDS
   --------------------------------------------------

   Used to detect general positive or negative mood.

   Example:
   "today was terrible" → negative → sad music
*/

const sentimentWords={
positive:["great","awesome","good","excited","amazing"],
negative:["bad","terrible","sad","lonely","upset"]
};



/* --------------------------------------------------
   SENTIMENT DETECTION FUNCTION
   --------------------------------------------------

   Detects positive or negative sentiment
   from the user's input text.

   Returns:
   "happy" → positive sentiment
   "sad" → negative sentiment
   null → no sentiment detected
*/

function detectSentiment(text){

/* Convert text to lowercase for easier matching */
text=text.toLowerCase();

/* Check for positive sentiment words */
for(const word of sentimentWords.positive){
if(text.includes(word)) return "happy";
}

/* Check for negative sentiment words */
for(const word of sentimentWords.negative){
if(text.includes(word)) return "sad";
}

/* No sentiment detected */
return null;

}



/* --------------------------------------------------
   EMOTION DETECTION FUNCTION
   --------------------------------------------------

   Looks for emotion-specific keywords in text.

   Example:
   "I need focus for exam" → study
*/

function detectEmotion(text){

/* Normalize text */
text=text.toLowerCase();

/* Loop through all emotions */
for(const emotion in emotionKeywords){

/* Check each keyword for that emotion */
for(const word of emotionKeywords[emotion]){

if(text.includes(word)){
return emotion;
}

}

}

/* If nothing matched, return original text */
return text;

}



/* --------------------------------------------------
   MAIN MOOD INTERPRETATION FUNCTION
   --------------------------------------------------

   Converts user input into a YouTube search query.

   Priority:
   1️⃣ Sentiment detection
   2️⃣ Emotion keyword detection
   3️⃣ Default fallback search
*/

function interpretMood(input){

/* Try detecting positive/negative sentiment */
const sentiment=detectSentiment(input);

/* If sentiment detected → return first genre option */
if(sentiment){
return genrePriority[sentiment][0];
}

/* Detect specific emotion keywords */
const emotion=detectEmotion(input);

/* If emotion exists in genre list */
if(genrePriority[emotion]){

const options=genrePriority[emotion];

/* Pick random genre option for variety */
return options[Math.floor(Math.random()*options.length)];

}

/* Fallback search if no emotion detected */
return input+" music";

}

