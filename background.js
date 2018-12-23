function block_websites() {
    return {cancel: true};
}

let seconds_remaining = null;
var counter = null;

function countdown() {
    seconds_remaining -= 1;
    console.log(seconds_remaining);
    chrome.tabs.query({}, function(tabs) {
        site = tabs[0].url.split("/")[2];
        alert("Site: " + site);
    });
    if (seconds_remaining <= 0) {
        clearInterval(counter);
    }
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.task === 'start') {
            chrome.webRequest.onBeforeRequest.addListener(
                block_websites,
                {urls: ["*://www.google.com/*"]},
                ["blocking"]
            );

            if (seconds_remaining === null) {
                seconds_remaining = 30;
                counter = setInterval(countdown, 1000);
            }

            sendResponse(
                {'seconds_remaining': seconds_remaining}
            );
        } else if (request.task === 'stop') {
            chrome.webRequest.onBeforeRequest.removeListener(block_websites);
        } else if (request.task === 'query_time') {
            sendResponse(
                {'seconds_remaining': seconds_remaining}
            );
        }
    }
);