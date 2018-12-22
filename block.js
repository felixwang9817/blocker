let startBlockingButton = document.getElementById('start-blocking');
startBlockingButton.addEventListener('click', startBlocking)

function startBlocking() {
    chrome.webRequest.onBeforeRequest.addListener(
        function() { return {cancel: true}; },
        {urls: ["*://www.youtube.com/*"]},
        ["blocking"]);
}

