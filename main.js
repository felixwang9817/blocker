function addBlockedSite(site){
    let list = document.getElementById('blocked-sites-list'); 
    let cur_blocked_site = 
        '<div class="blocked-site"' + ' id="' + site + '">' +  
            site + 
            '<button class="remove-site"><i class="fas fa-ban"></i></button>' + 
        '</div>';
    list.insertAdjacentHTML('beforeend', cur_blocked_site);
}

function removeBlockedSite(element){
    console.log(element); 
}

document.addEventListener('DOMContentLoaded', () => {
    // TODO: remove this stop button
    let stopBlockingButton = document.getElementById('stop-blocking');
    stopBlockingButton.addEventListener('click', function() {
        chrome.runtime.sendMessage({
            'task': 'stop'
        });
    });
    let submitWebsiteForm = document.getElementById('submitWebsite');

    chrome.storage.local.get(['blocked_sites'], 
        (obj) => {
            let list = obj.blocked_sites; 
            for(let i =0; i<list.length; i++){
                addBlockedSite(list[i]); 
            }
            let removeBlockedButtons = document.getElementsByClassName('remove-site'); 
            console.log("number blocked: " + removeBlockedButtons.length); 
            for(let i=0; i<removeBlockedButtons.length; i++){
                removeBlockedButtons[i].addEventListener('click', function(event){
                    let curBlockedSiteDiv = event.currentTarget.parentNode;  
                    curBlockedSiteDiv.parentNode.removeChild(curBlockedSiteDiv);
                    chrome.storage.local.get(['blocked_sites'], (obj) => {
                        let list = obj.blocked_sites; 
                        list = list.filter((x) => {
                            return x !== curBlockedSiteDiv.id; 
                        }); 
                        chrome.storage.local.set({'blocked_sites': list}, () => {
                            console.log("Removed blocked site" + list); 
                            chrome.runtime.sendMessage({'task': 'update_blocked_sites'}); 
                        }); 
                    }); 
                });
            }
    });


    submitWebsiteForm.addEventListener('submit', function(event) {
        let blocked_site = document.getElementById('blockedWebsite');
        chrome.storage.local.get(['blocked_sites'], function(result) {
            console.log("current blocked sites: " + result.blocked_sites);
            result.blocked_sites.push(blocked_site.value);
            console.log("updated blocked sites: " + result.blocked_sites);
            chrome.storage.local.set({'blocked_sites': result.blocked_sites});
            chrome.runtime.sendMessage({'task': 'update_blocked_sites'}, function(response){

            }); 
        });
    });

    // circular timer
    //circle start
    let progressBar = document.querySelector('.e-c-progress');
    let indicator = document.getElementById('e-indicator');
    let pointer = document.getElementById('e-pointer');
    let length = Math.PI * 2 * 100;

    progressBar.style.strokeDasharray = length;

    function update(value, timePercent) {
        var offset = - length - length * value / (timePercent);
        progressBar.style.strokeDashoffset = offset; 
        pointer.style.transform = `rotate(${360 * value / (timePercent)}deg)`; 
    };

    //circle ends
    const displayOutput = document.querySelector('.display-remain-time')
    const startBtn = document.getElementById('pause');

    let intervalTimer;
    let timeLeft;
    let wholeTime = 7455; // manage this to set the whole time 
    let isStarted = false;

    // upon loading, update timer
    chrome.runtime.sendMessage({
        'task': 'update_timer'
    }, function(response) {
        if (response.is_started) {
            console.log('already started, seconds left: ' + response.seconds_remaining);
            update(response.seconds_remaining, wholeTime);
            timer(response.seconds_remaining);
        }
    });

    function timer (seconds){ //counts time, takes seconds
        let remainTime = Date.now() + (seconds * 1000);
        displayTimeLeft(seconds);
        
        intervalTimer = setInterval(function(){
            timeLeft = Math.round((remainTime - Date.now()) / 1000);
            if(timeLeft < 0){
                clearInterval(intervalTimer);
                isStarted = false;
                displayTimeLeft(wholeTime);
                return ;
            }
            displayTimeLeft(timeLeft);
        }, 1000);
    }

    function displayTimeLeft (timeLeft){ //displays time on the input
        let hours = Math.floor(timeLeft / 3600); 
        let minutes = Math.floor((timeLeft / 60) % 60);
        let seconds = timeLeft % 60;
        if(minutes === 0) {
            var displayString = `${seconds < 10 ? '0' : ''}${seconds}`;
        }else if(hours === 0){
            var displayString =  `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }else{
            var displayString = `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }
        displayOutput.textContent = displayString;
        update(timeLeft, wholeTime);
    }

    startBtn.addEventListener('click', function(){
        if (!isStarted) {
            isStarted = true;
            chrome.runtime.sendMessage({
                'task': 'start'
            });
            timer(wholeTime);
        }
    });
});

