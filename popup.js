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