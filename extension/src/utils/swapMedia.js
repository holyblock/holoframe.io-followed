const ogGetUserMedia = navigator.mediaDevices.getUserMedia;

navigator.mediaDevices.getUserMedia = async function (constraints) {

  if (constraints.video && (  // video element
    constraints.video.hasOwnProperty('deviceId') ||  // camera feed
    constraints.video.width !== undefined  // rare scenario (brave discord after preview)
  )) {
    // video track available, override it with canvas captureStream
    // Note: two checks, constraints.video means this is video track (i.e.,
    // not audio track); constraints.video.deviceId means the video feed
    // comes with a device (i.e., from webcam, not from screen share)

    // 1. connect webcam video source to our inVideo
    let inVideo = document.getElementById('input-video');
    let stream = await ogGetUserMedia.call(navigator.mediaDevices, constraints);
    inVideo.srcObject = stream;

    // 2. update canvas at every frame of inVideo, passing through
    // our processing logic
    let outCanvas = document.getElementById('output-canvas');
    let overrideStream = outCanvas.captureStream();

    // 3. inject a stop function on canvas stream, we backtrace and stop the
    // original video stream, this will turn off the hardware camera light
    overrideStream.getTracks()[0].stop = () => {
      stream.getTracks()[0].stop();
    };

    // 4. assign the original id to the overrideStream
    overrideStream.getTracks()[0].getSettings = () => {
      return stream.getTracks()[0].getSettings();
    };

    // 5. overrides getUserMedia to outCanvas captureStream
    return overrideStream;

  } else if (constraints.audio && !constraints.video) {
    // video track unavailable, this is usually called to get the audio
    // track; in this case, inject voice modulation

    // 1. get audio context and create source / destination audio nodes from context
    const stream = await ogGetUserMedia.call(navigator.mediaDevices, constraints);
    const audioContext = new (window.AudioContext || window.webkitAudioContext);
    const source = audioContext.createMediaStreamSource(stream);
    const destination = audioContext.createMediaStreamDestination();

    // 2. set tone.js context, initialize pitch shift, connect nodes from source
    // to destination, and add listener for pitch change
    Tone.setContext(audioContext);
    let pitchShift = new Tone.PitchShift(0);

    window.addEventListener('pitch', (e) => {
      // parse the new pitch shift value
      const newPitch = parseFloat(e.detail.pitch);
      // only apply pitch shift, if the received value is non-zero
      if (newPitch != 0) {
        // pitch shift to a non-zero value, reuse existing pitch shift
        pitchShift.pitch = newPitch;
      } else {
        // Note: because pitch shift needed a time delay to apply frequency
        // change, when turning off, we need to reset pitchShift to remove echo
        pitchShift.dispose();
        pitchShift = new Tone.PitchShift(0);
        Tone.connect(source, pitchShift);
        Tone.connect(pitchShift, destination);
      }
    });

    Tone.connect(source, pitchShift);
    Tone.connect(pitchShift, destination);

    // 3. Emit audio initialized event
    const audioModulatedEvent = new CustomEvent('audioModulated');
    window.dispatchEvent(audioModulatedEvent);

    // 4. divert audio input to the monitoring audio element (for lip sync)
    let inAudio = document.getElementById('input-audio');
    inAudio.srcObject = stream;

    // 5. overrides getUserMedia using the stream belonging to destination audio node
    return destination.stream;

  } else {
    // both webcam and audio not available, this should be screen sharing, in
    // this case, return the original stream
    return ogGetUserMedia.call(navigator.mediaDevices, constraints);
  }
}