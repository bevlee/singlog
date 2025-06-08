<script>
    let { data }= $props();
    let project = $derived(data.project);
    import recordImg from "$lib/images/record.jpg";
    import audio from "$lib/media/1234.ogg";
    import WaveSurfer from 'wavesurfer.js';
    import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js';
    const startRecording = () => {
        console.log("Recording")
    }
    let wavesurfer;
    const waveform = (node, audio) => {
        wavesurfer = WaveSurfer.create({
            container: node,
            // waveColor: 'green',
            // progressColor: 'yellow',
            // url: audio,
            cursorColor:'red'
        })
        wavesurfer.load(audio)
        wavesurfer.on('click', () => {
            wavesurfer.play()       
        })

    }
    const pause = () => {
        wavesurfer.pause()
    }

    let pauseButton;
    let recordButton;
    let progress;
    let micSelect;
    
    let recordingWavesurfer, record;
    let scrollingWaveform = false
    let continuousWaveform = true
    const createRecording = (node) => {
        if (recordingWavesurfer) {
            recordingWavesurfer.destroy()
        }
        // Create a new Wavesurfer instance
        recordingWavesurfer = WaveSurfer.create({
            container: node,
            waveColor: 'rgb(200, 0, 200)',
            progressColor: 'rgb(100, 0, 100)',
        })

        // Initialize the Record plugin
        record = recordingWavesurfer.registerPlugin(
            RecordPlugin.create({
            renderRecordedAudio: false,
            scrollingWaveform,
            continuousWaveform,
            continuousWaveformDuration: 30, // optional
            }),
        )

        // Render recorded audio
        record.on('record-end', (blob) => {
            const recordedUrl = URL.createObjectURL(blob)

            // Create recordingWavesurfer from the recorded audio
            const recordingWavesurfer = WaveSurfer.create({
            node,
            waveColor: 'rgb(200, 100, 0)',
            progressColor: 'rgb(100, 50, 0)',
            url: recordedUrl,
            })

            // Play button
            const button = node.appendChild(node.createElement('button'))
            button.textContent = 'Play'
            button.onclick = () => recordingWavesurfer.playPause()
            recordingWavesurfer.on('pause', () => (button.textContent = 'Play'))
            recordingWavesurfer.on('play', () => (button.textContent = 'Pause'))

            // Download link
            const link = node.appendChild(node.createElement('a'))
            Object.assign(link, {
            href: recordedUrl,
            download: 'recording.' + blob.type.split(';')[0].split('/')[1] || 'webm',
            textContent: 'Download recording',
            })
        })
        pauseButton.style.display = 'none'
        recordButton.textContent = 'Record'

        record.on('record-progress', (time) => {
            updateProgress(time)
        })
    

        const updateProgress = (time) => {
        // time will be in milliseconds, convert it to mm:ss format
        const formattedTime = [
            Math.floor((time % 3600000) / 60000), // minutes
            Math.floor((time % 60000) / 1000), // seconds
        ]
            .map((v) => (v < 10 ? '0' + v : v))
            .join(':')
            progress.textContent = formattedTime
        }

        pauseButton.onclick = () => {
        if (record.isPaused()) {
            record.resumeRecording()
            pauseButton.textContent = 'Pause'
            return
        }

        record.pauseRecording()
        pauseButton.textContent = 'Resume'
        }

        {
        // Mic selection
        RecordPlugin.getAvailableAudioDevices().then((devices) => {
            devices.forEach((device) => {
            const option = node.createElement('option')
            option.value = device.deviceId
            option.text = device.label || device.deviceId
            micSelect.appendChild(option)
            })
        })
        }
        // Record button

        recordButton.onclick = () => {
        if (record.isRecording() || record.isPaused()) {
            record.stopRecording()
            recordButton.textContent = 'Record'
            pauseButton.style.display = 'none'
            return
        }

        recordButton.disabled = true

        // reset the recordingWavesurfer instance

        // get selected device
        const deviceId = micSelect.value
        record.startRecording({ deviceId }).then(() => {
            recordButton.textContent = 'Stop'
            recordButton.disabled = false
            pauseButton.style.display = 'inline'
        })
        }
    }

    
    

</script>

<div class="projectPage"> 
    <h1>Project Name: {project.projectName}</h1>
    <h2>Artist: {project.artistName}</h2>
    <div>
        <p>Press to record audio</p>
        <img onclick={startRecording} src={recordImg} >
        <div use:createRecording></div>
        <div use:waveform="{audio}"></div>
        <button bind:this={recordButton}>record</button>
        <button onclick={pause} bind:this={pauseButton}>stop</button>
        <p bind:this={progress}>00:00</p>
        <select bind:this={micSelect}>
          <option value="" hidden>Select mic</option>
        </select>
    </div>
</div>
<style>
    .projectPage {
        background-color: aqua;
    }
</style>