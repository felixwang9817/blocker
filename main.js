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
    let startBlockingButton = document.getElementById('start-blocking');
    let stopBlockingButton = document.getElementById('stop-blocking');
    let submitWebsiteForm = document.getElementById('submitWebsite');
    let timer = document.getElementById('timer-display');
    let seconds_remaining = null;
    var countdown = null;

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

    function update_timer() {
        timer.innerHTML = seconds_remaining;
        console.log(seconds_remaining);
        seconds_remaining -= 1;
        if (seconds_remaining <= -1) {
            clearInterval(countdown);
        }
    }

    chrome.runtime.sendMessage({
        'task': 'query_time'
    }, function(response) {
        seconds_remaining = response.seconds_remaining;
        if (seconds_remaining != null) {
            timer.innerHTML = seconds_remaining;
            countdown = setInterval(update_timer, 1000);
            seconds_remaining = response.seconds_remaining;
        }
    }); 

    startBlockingButton.addEventListener('click', function(){
        chrome.runtime.sendMessage({
            'task': 'start'
        }, function (response) {
            seconds_remaining = response.seconds_remaining;
            countdown = setInterval(update_timer, 1000);
        });
    });

    stopBlockingButton.addEventListener('click', function(){
        chrome.runtime.sendMessage({
            'task': 'stop'
        });
    });


});

