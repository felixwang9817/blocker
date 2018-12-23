document.addEventListener('DOMContentLoaded', () => {
    var port = chrome.runtime.connect();
    let startBlockingButton = document.getElementById('start-blocking');
    console.log(startBlockingButton);
    startBlockingButton.addEventListener('click', function(){
        console.log("hi");
        port.postMessage({
                'from': 'popup',
                'task': 'block'
            });
    });
});


