document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('videoCanvas');
    const context = canvas.getContext('2d');
    const captureButton = document.getElementById('captureButton');
    let videoStream = null;

    navigator.mediaDevices.getUserMedia({ video: true })
        .then(function(stream) {
            videoStream = stream;
            const video = document.createElement('video');
            video.srcObject = stream;
            video.play();

            video.addEventListener('loadeddata', function() {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                setInterval(function() {
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                }, 100);
            });

            captureButton.addEventListener('click', function() {
                // Capture the current frame from the canvas
                const imageData = canvas.toDataURL('image/png');

                // Save the captured image to chrome.storage.local
                chrome.storage.local.set({ capturedImage: imageData }, function() {
                    console.log('Image saved successfully.');
                });
            });
        })
        .catch(function(error) {
            if (error.name === 'NotAllowedError') {
                alert('Permission to access the camera was denied. Please enable it in your browser settings.');
            } else {
                console.error('Error accessing webcam: ', error);
            }
        });

    window.addEventListener('unload', function() {
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
        }
    });
});