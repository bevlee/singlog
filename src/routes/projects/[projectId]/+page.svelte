<script>
    import { onDestroy, onMount } from 'svelte';
    
    import { v4 as uuidv4 } from 'uuid';
    import WaveSurfer from 'wavesurfer.js';
    import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js';

    import audioFile from "$lib/media/abc/1234.ogg";
 
    async function uploadChunk(chunk, recordingId, isFinal = false) {
        if (isFinal) {
            console.warn("Attempting to upload chunk after recording stopped. Ignoring.");
            return;
        }
        const formData = new FormData();
        formData.append('chunk', chunk || new Blob([]));
        formData.append('recordingId', recordingId);
        formData.append('isFinal', isFinal.toString());
        formData.append('projectName', project.projectName);
        formData.append('projectId', project.projectId);
        formData.append('artistName', project.artistName);
    
        await fetch('/api/recording/chunks', {
            method: 'POST',
            body: formData
        });
    }
    let { data } = $props();
    let project = $derived(data.project);
    let recordings = $derived(data.recordings)
    // DOM element references
    let waveformContainer; // For playback waveform
    let currentRecordingContainer; // for the current recording
    let recordingContainer; // For finalised recordings
    let pauseButton;
    let recordButton;
    let progressDisplay;
    let micSelect;

    // Wavesurfer instances
    let wavesurferPlayback; // For playing existing audio
    let wavesurferRecord;   // For handling recording
    let recordPlugin;       // The RecordPlugin instance

    // Recording options
    let scrollingWaveform = false; // record from the left
    let continuousWaveform = true;
    let continuousWaveformDuration = 30;

    console.log(recordings)
    const loadRecordings = async () => {

        for (const recording of recordings) {
            
            const response = await fetch(`/api/users/1/recordings/${recording.recordingUuid}`)
            console.log("response is", response)
            const audioBlob  = await response.blob();
            createAudioWaveform(recordingContainer, audioBlob)
        }
    }
    // --- Playback WaveSurfer (for existing audio) ---
    onMount(() => {
        wavesurferPlayback = WaveSurfer.create({
            container: waveformContainer,
            url: audioFile, 
            cursorColor: 'red',
            waveColor: 'violet', 
            progressColor: 'purple', 
        });

        wavesurferPlayback.on('click', () => {
            wavesurferPlayback.playPause(); // Toggle play/pause
        });
        
        //loop the track
        wavesurferPlayback.on('finish', function () {
            wavesurferPlayback.seekTo(0); 
            wavesurferPlayback.play(); 
        });
    });

    // --- Recording WaveSurfer & Record Plugin ---
    onMount(async () => {
        //load previously recorded tracks
        loadRecordings();


        //generate uuid for the recording as it is uploaded in chunks
        let recordingId = uuidv4();
        // Initialize the recording Wavesurfer instance
        wavesurferRecord = WaveSurfer.create({         
            container: currentRecordingContainer,
            waveColor: 'rgb(200, 0, 200)',
            progressColor: 'rgb(100, 0, 100)',
            barWidth: 2,
            barGap: 1,
            minPxPerSec: 10, 
        });

        // Initialize the Record plugin
        recordPlugin = wavesurferRecord.registerPlugin(
            RecordPlugin.create({
                renderRecordedAudio: false, //  render it in a new WS instance
                scrollingWaveform,
                continuousWaveform,
                continuousWaveformDuration,
            }),
        );

        // --- Event Listeners for Record Plugin ---

        recordPlugin.on('record-data-available', (blob) => {

            uploadChunk(blob, recordingId, false);
        })
        // Display recording progress
        recordPlugin.on('record-progress', (time) => {
            const formattedTime = [
                Math.floor((time % 3600000) / 60000), // minutes
                Math.floor((time % 60000) / 1000),    // seconds
            ]
                .map((v) => (v < 10 ? '0' + v : v))
                .join(':');
            progressDisplay.textContent = formattedTime;
        });

        // When recording stops
        recordPlugin.on('record-end', (blob) => {
            const recordedUrl = URL.createObjectURL(blob);
            console.log('Recorded URL:', recordedUrl);

            //  signal to upload the final chunk
            uploadChunk(null, recordingId, true);
            
            const playbackWs = WaveSurfer.create({
                container: recordingContainer, 
                waveColor: 'rgb(0, 150, 255)',
                progressColor: 'rgb(0, 100, 200)',
                url: recordedUrl,
                barWidth: 2,
                barGap: 1,
            });

            // Example: Play/Pause button for the recorded audio
            const playRecordedButton = document.createElement('button');
            playRecordedButton.textContent = 'Play Recorded';
            playRecordedButton.onclick = () => playbackWs.playPause();
            recordingContainer.appendChild(playRecordedButton);

            playbackWs.on('play', () => playRecordedButton.textContent = 'Pause Recorded');
            playbackWs.on('pause', () => playRecordedButton.textContent = 'Play Recorded');

            // Reset UI for next recording
            recordButton.textContent = 'Record';
            recordButton.disabled = false; // Re-enable if it was disabled
            pauseButton.style.display = 'none';
            progressDisplay.textContent = '00:00'; // Reset progress

            // recordingId = uuidv4() 
            // // generate a new id
        });

        // --- Mic Selection ---
        try {
            const devices = await RecordPlugin.getAvailableAudioDevices();
            devices.forEach((device) => {
                const option = document.createElement('option');
                option.value = device.deviceId;
                option.text = device.label || `Microphone ${device.deviceId.substring(0, 4)}...`;
                micSelect.appendChild(option);
            });
            // Select the first device by default if available
            if (devices.length > 0) {
                micSelect.value = devices[0].deviceId;
            }
        } catch (error) {
            console.error("Error getting audio devices:", error);
            // Inform the user if mic access is denied or no devices found
            alert("Could not access microphone devices. Please check your browser permissions.");
        }
    });


    // --- Button Handlers ---
    const handleRecordClick = () => {
        if (recordPlugin.isRecording() || recordPlugin.isPaused()) {
            recordPlugin.stopRecording();
            recordButton.textContent = 'Record';
            pauseButton.style.display = 'none';
            progressDisplay.textContent = '00:00';
            return;
        }

        recordButton.disabled = true; // Disable while starting

        // Start recording with selected device
        const deviceId = micSelect.value;
        recordPlugin.startRecording({ deviceId }).then(() => {
            recordButton.textContent = 'Stop';
            recordButton.disabled = false;
            pauseButton.style.display = 'inline-block'; // Use inline-block for buttons
        }).catch(err => {
            console.error("Error starting recording:", err);
            alert(`Failed to start recording. Error: ${err.message}. Please check microphone permissions.`);
            recordButton.disabled = false; // Re-enable button on error
        });
    };

    const handlePauseClick = () => {
        if (recordPlugin.isPaused()) {
            recordPlugin.resumeRecording();
            pauseButton.textContent = 'Pause';
        } else {
            recordPlugin.pauseRecording();
            pauseButton.textContent = 'Resume';
        }
    };

    // --- Cleanup on component destroy ---
    onDestroy(() => {
        if (wavesurferPlayback) {
            wavesurferPlayback.destroy();
        }
        if (wavesurferRecord) {
            wavesurferRecord.destroy();
        }
    });
    const createAudioWaveform = (node, blob) => {

        const recordedUrl = URL.createObjectURL(blob);
        const wavesurfer= WaveSurfer.create({         
            container: node,
            waveColor: 'rgb(200, 0, 200)',
            progressColor: 'rgb(100, 0, 100)',
            barWidth: 2,
            barGap: 1,
            minPxPerSec: 10, 
            url: recordedUrl
        });
        wavesurfer.on('click', () => {
            wavesurfer.playPause(); // Toggle play/pause
        });


    }
</script>

<div class="projectPage">
    <h1>Project Name: {project.projectName}</h1>
    <h2>Artist: {project.artistName}</h2>

    <div class="audio-section">
        <h3>Bundled Audio File</h3>
        <div class="waveform-container" bind:this={waveformContainer}></div>
        <button onclick={() => wavesurferPlayback.playPause()}>Play/Pause</button>
    </div>

    <div class="recording-section">
        <h3>Record New Audio</h3>

        <div class="controls">
            <select bind:this={micSelect}>
                <option value="" disabled selected>Select mic</option>
            </select>
            <button bind:this={recordButton} onclick={handleRecordClick}>Record</button>
            <button bind:this={pauseButton} onclick={handlePauseClick} style="display: none;">Pause</button>
            <p bind:this={progressDisplay}>00:00</p>
        </div>
        <div class="recording-waveform-container" bind:this={currentRecordingContainer}></div>

    </div>

       
    <div bind:this={recordingContainer}>
        <h3>Project Recordings</h3>
        {#if recordings && recordings.length > 0}
                <p>hello</p>
        {:else}
            <p>No recordings found for this project yet.</p>
        {/if}
    </div>
</div>

<style>
    .projectPage {
        background-color: #f0f8ff;
        padding: 20px;
        border-radius: 8px;
        max-width: 800px;
        margin: 20px auto;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    h1, h2, h3 {
        color: #333;
        text-align: center;
        margin-bottom: 15px;
    }

    .audio-section, .recording-section {
        background-color: #ffffff;
        padding: 15px;
        margin-bottom: 20px;
        border-radius: 6px;
        border: 1px solid #eee;
    }

    .waveform-container, .recording-waveform-container {
        height: 120px; /* Give them a fixed height */
        background-color: #e0e0e0;
        border-radius: 4px;
        margin-bottom: 15px;
        /* Wavesurfer will inject its canvas here */
    }
    .controls {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 15px;
        justify-content: center;
    }

    button {
        padding: 10px 15px;
        font-size: 1rem;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        background-color: #007bff;
        color: white;
        transition: background-color 0.2s ease-in-out;
    }

    button:hover {
        background-color: #0056b3;
    }

    button:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
    }

    select {
        padding: 8px 10px;
        border-radius: 5px;
        border: 1px solid #ccc;
        background-color: white;
    }

    p {
        font-size: 1.1rem;
        font-weight: bold;
        color: #555;
        min-width: 50px; /* Prevent jump when time updates */
        text-align: center;
    }
</style>