chrome.runtime.onConnect.addListener(function(port) {

    // listen for every message passing throw it
    port.onMessage.addListener(function(o) {

        // if the message comes from the popup
        if (o.from && o.from === 'popup' && o.task && o.task === 'block') {
            console.log("Received message from popup");
            chrome.webRequest.onBeforeRequest.addListener(
                function() { return {cancel: true}; },
                {urls: ["*://www.google.com/*"]},
                ["blocking"]);
        } 
    });
});
