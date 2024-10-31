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
                result.capturedImages.forEach((imageData, index) => {
                    createImageElement(imageData, index);
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
            changes.capturedImages.newValue.forEach((imageData, index) => {
                createImageElement(imageData, index);
            });
        }
    });

    function createImageElement(imageData, index) {
        const container = document.createElement('div');
        container.classList.add('image-container');

        const img = document.createElement('img');
        img.src = imageData;

        const overlayButtons = document.createElement('div');
        overlayButtons.classList.add('overlay-buttons');

        const downloadButton = document.createElement('button');
        downloadButton.textContent = 'Download';
        downloadButton.addEventListener('click', function() {
            const a = document.createElement('a');
            a.href = imageData;
            a.download = `captured_image_${index}.png`;
            a.click();
        });

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', function() {
            chrome.storage.local.get(['capturedImages'], function(result) {
                if (result.capturedImages) {
                    const updatedImages = result.capturedImages.filter((_, i) => i !== index);
                    chrome.storage.local.set({ capturedImages: updatedImages }, function() {
                        console.log('Image deleted successfully.');
                    });
                }
            });
        });

        overlayButtons.appendChild(downloadButton);
        overlayButtons.appendChild(deleteButton);
        container.appendChild(img);
        container.appendChild(overlayButtons);
        savedImagesContainer.appendChild(container);
    }
});