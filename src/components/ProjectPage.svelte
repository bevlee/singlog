<script>

import {
  SvelteMap,
} from 'svelte/reactivity';
    const projectName = $props()
    let recordingCounter;
    
 // Using promises for async/await'
let stream;
let mediaRecorder;


let clips = new SvelteMap();
let chunks = [];
let recordingSupported = true;
let isRecording = $state(false);


async function loadSong (filename) { 
    const song = await fetch(`/file/${filename}`, {
        method: 'POST'
    });
    console.log("song is", song)
}
async function getScore () {

    // const score =  await fetch('/file',
    // {
    //     method: 'GET'})
    // console.log("Score is",score)
    // let data = await score.json();
    // currentScore = data;
}

async function uploadChunk(chunk, recordingId, isFinal = false) {
    if (isFinal) {
      console.warn("Attempting to upload chunk after recording stopped. Ignoring.");
      return;
    }
    const formData = new FormData();
    formData.append('chunk', chunk || new Blob([]));
    formData.append('recordingId', recordingId);
    formData.append('isFinal', isFinal.toString());
  
    await fetch('file/chunks', {
        method: 'POST',
        body: formData
    });
}
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  console.log("getUserMedia supported.");
  chunks = []
  navigator.mediaDevices
    .getUserMedia(
      // constraints - only audio needed for this app
      {
        audio: true,
      },
    )
    
    // Success callback
    .then((stream) => {
        mediaRecorder = new MediaRecorder(stream);
        const recordingId = Math.floor(Math.random() * 100000000)

        mediaRecorder.ondataavailable = (e) => {
            
            chunks.push(e.data);
            uploadChunk(e.data, recordingId, false);
        };


        mediaRecorder.onstop = async (e) => {
            console.log("recorder stopped");
            await uploadChunk(null, recordingId, true); 
            const clipName = prompt("Enter a name for your sound clip");
            if (clipName != null) {
                const clipContainer = document.createElement("article");
                const clipLabel = document.createElement("p");
                const audio = document.createElement("audio");
                const deleteButton = document.createElement("button");

                clipContainer.classList.add("clip");
                audio.setAttribute("controls", "");
                deleteButton.textContent = "Delete";
                clipLabel.textContent = clipName;

                clipContainer.appendChild(audio);
                clipContainer.appendChild(clipLabel);
                clipContainer.appendChild(deleteButton);
                console.log("clipcontainer", clipContainer);

                const blob = new Blob(chunks, { type: "audio/webm; codecs=opus" });
                chunks = [];
                const audioURL = window.URL.createObjectURL(blob);
                console.log("audio", audioURL)
                audio.src = audioURL;
                clips.set(clipName,audioURL);
                console.log("clips", clips)


                // save the audio to the server filesystem under /media

                // fetch(`/file/${clipName}`, {
                //     method: 'POST',
                //     body: blob
                // }).then(response => {
                //     console.log("response was ", response)
                // })

            

                // var link = document.createElement("a");
                // getScore();
                // If you don't know the name or want to use
                // the webserver default set name = ''


                // CODE TO DOWNLOAD THE RECORDING AUDIO
                // link.setAttribute('download', "name");
                // link.href = audioURL;
                // document.body.appendChild(link);
                // link.click();
                // link.remove();
            }
            
            };

    })

    // Error callback
    .catch((err) => {
      console.error(`The following getUserMedia error occurred: ${err}`);
      recordingSupported = false;
    });
} else {
  console.log("getUserMedia not supported on your browser!");
}




function startRecording() {
    mediaRecorder.start(1000);

    console.log(mediaRecorder.state);
    console.log("recorder started");
    isRecording = true;
    setTimeout(() => {
      console.log("stopping recording");
      stopRecording();
    }, 5000)
}
function stopRecording() {

    mediaRecorder.stop();
    console.log(mediaRecorder.state);
    console.log("recorder stopped");
    isRecording = false;
}
</script>

<h1>Song</h1>

{#if recordingSupported}

    <button onclick={() => startRecording()}> Record </button>
    {#if isRecording}
        <p>Recording...</p>
        <button onclick={()=>stopRecording()}>Stop</button>
    {/if}
{:else}
<p>Audio recording is not supported, please ensure you enable it</p>
{/if}

<section class="sound-clips">

  {#each clips as [clipName, clipURL] }
  <p>
      {clipName}: <br/>
      <audio controls src={clipURL}></audio>
  </p>
  {/each}
  </section>
  
  
<style>
    .main {

    }
</style>