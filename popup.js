document.getElementById('imageInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    console.log("Image added!!!!")
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            chrome.storage.local.set({ uploadedImage: e.target.result }, function() {
                // Notify content script about the new image
                chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, { action: "updateImage" });
                });
            });
        };
        reader.readAsDataURL(file);
    }
});

// CAMERA ACCESS
document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('myButton');
    const savedImagesContainer = document.getElementById('savedImages');

    if (savedImagesContainer) {
        // Load saved images from chrome.storage.local
        chrome.storage.local.get(['capturedImages'], function(result) {
            if (result.capturedImages) {
                result.capturedImages.forEach(imageData => {
                    const img = document.createElement('img');
                    img.src = imageData;
                    savedImagesContainer.appendChild(img);
                });
            }
        });
    }

    button.addEventListener('click', function() {
        // Open a new tab to access the camera
        chrome.tabs.create({ url: chrome.runtime.getURL('camera.html') });
    });

    // Listen for changes in chrome.storage.local
    chrome.storage.onChanged.addListener(function(changes, namespace) {
        if (changes.capturedImages && namespace === 'local') {
            savedImagesContainer.innerHTML = '';
            changes.capturedImages.newValue.forEach(imageData => {
                const img = document.createElement('img');
                img.src = imageData;
                savedImagesContainer.appendChild(img);
            });
        }
    });
});