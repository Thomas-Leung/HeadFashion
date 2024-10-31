document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('videoCanvas');
    const context = canvas.getContext('2d');
    const captureButton = document.getElementById('captureButton');
    const saveButton = document.getElementById('saveButton');
    const cancelButton = document.getElementById('cancelButton');
    let videoStream = null;
    let video = null;

    navigator.mediaDevices.getUserMedia({ video: true })
        .then(function(stream) {
            videoStream = stream;
            video = document.createElement('video');
            video.srcObject = stream;
            video.play();

            video.addEventListener('loadeddata', function() {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                setInterval(function() {
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                }, 100);
            });

            captureButton.addEventListener('click', function() {
                // Pause the video and display the captured frame on the canvas
                video.pause();
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                // Show save and cancel buttons
                saveButton.style.display = 'inline-block';
                cancelButton.style.display = 'inline-block';
                captureButton.style.display = 'none';
            });

            saveButton.addEventListener('click', function() {
                // Capture the current frame from the canvas
                const imageData = canvas.toDataURL('image/png');

                // Save the captured image to chrome.storage.local
                chrome.storage.local.get(['capturedImages'], function(result) {
                    const capturedImages = result.capturedImages || [];
                    capturedImages.push(imageData);
                    chrome.storage.local.set({ capturedImages: capturedImages }, function() {
                        console.log('Image saved successfully.');
                    });
                });

                // Restart the video feed
                video.play();

                // Hide save and cancel buttons, show capture button
                saveButton.style.display = 'none';
                cancelButton.style.display = 'none';
                captureButton.style.display = 'inline-block';
            });

            cancelButton.addEventListener('click', function() {
                // Clear the canvas and resume the video feed
                context.clearRect(0, 0, canvas.width, canvas.height);
                video.play();

                // Hide save and cancel buttons, show capture button
                saveButton.style.display = 'none';
                cancelButton.style.display = 'none';
                captureButton.style.display = 'inline-block';
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