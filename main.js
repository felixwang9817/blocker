function addBlockedSite(site){
    let list = document.getElementsById('blocked-sites-list'); 
    let cur_blocked_site = 
        '<div class="blocked-site">' +  
            site + 
            '<button class="remove-site"><i class="fas fa-ban"></i></button>' + 
        '</div>';
    list.insertAdjacentHTML('beforeend', cur_blocked_site);
}

document.addEventListener('DOMContentLoaded', () => {


    let startBlockingButton = document.getElementById('start-blocking');
    let stopBlockingButton = document.getElementById('stop-blocking');
    let submitWebsiteForm = document.getElementById('submitWebsite');
    let timer = document.getElementById('timer-display');
    let seconds_remaining = null;
    var countdown = null;

    submitWebsiteForm.addEventListener('submit', function(event) {
        let blocked_site = document.getElementById('blockedWebsite');
        chrome.storage.local.get(['blocked_sites'], function(result) {
            console.log("current blocked sites: " + result.blocked_sites);
            result.blocked_sites.push(blocked_site.value);
            console.log("updated blocked sites: " + result.blocked_sites);
            chrome.storage.local.set({'blocked_sites': result});
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

    chrome.storage.local.get({'blocked_sites': ['www.youtube.com', 
                                          'www.netflix.com', 
                                          'www.reddit.com']}, 
    (obj)=> {
        let list = obj.blocked_sites; 
        for(let i =0; i<list.length; i++){
            addBlockedSite(list[i]); 
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

