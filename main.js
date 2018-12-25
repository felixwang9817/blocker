function addBlockedSite(site){
    let list = document.getElementById('blocked-sites-list'); 
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
    let timer_display = document.getElementById('timer-display');
    let seconds_remaining = null;
    var countdown = null;

    chrome.storage.local.get(['blocked_sites'], 
        (obj) => {
            let list = obj.blocked_sites; 
            for(let i =0; i<list.length; i++){
                console.log(list[i]); 
                addBlockedSite(list[i]); 
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
        timer_display.innerHTML = seconds_remaining;
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
            timer_display.innerHTML = seconds_remaining;
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
    const pauseBtn = document.getElementById('pause');
    const setterBtns = document.querySelectorAll('button[data-setter]');

    let intervalTimer;
    let timeLeft;
    let wholeTime = 0.5 * 60; // manage this to set the whole time 
    let isPaused = false;
    let isStarted = false;


    update(wholeTime,wholeTime); //refreshes progress bar
    displayTimeLeft(wholeTime);

    function changeWholeTime(seconds){
        if ((wholeTime + seconds) > 0){
            wholeTime += seconds;
            update(wholeTime,wholeTime);
        }
    }

    for (var i = 0; i < setterBtns.length; i++) {
        setterBtns[i].addEventListener("click", function(event) {
            var param = this.dataset.setter;
            switch (param) {
                case 'minutes-plus':
                    changeWholeTime(1 * 60);
                    break;
                case 'minutes-minus':
                    changeWholeTime(-1 * 60);
                    break;
                case 'seconds-plus':
                    changeWholeTime(1);
                    break;
                case 'seconds-minus':
                    changeWholeTime(-1);
                    break;
            }
        displayTimeLeft(wholeTime);
        });
    }

    function timer (seconds){ //counts time, takes seconds
        let remainTime = Date.now() + (seconds * 1000);
        displayTimeLeft(seconds);
        
        intervalTimer = setInterval(function(){
            timeLeft = Math.round((remainTime - Date.now()) / 1000);
            if(timeLeft < 0){
                clearInterval(intervalTimer);
                isStarted = false;
                setterBtns.forEach(function(btn){
                    btn.disabled = false;
                    btn.style.opacity = 1;
                });
                displayTimeLeft(wholeTime);
                pauseBtn.classList.remove('pause');
                pauseBtn.classList.add('play');
                return ;
            }
            displayTimeLeft(timeLeft);
        }, 1000);
    }
    function pauseTimer(event){
        if(isStarted === false){
            timer(wholeTime);
            isStarted = true;
            this.classList.remove('play');
            this.classList.add('pause');
            
            setterBtns.forEach(function(btn){
                btn.disabled = true;
                btn.style.opacity = 0.5;
            });

        }else if(isPaused){
            this.classList.remove('play');
            this.classList.add('pause');
            timer(timeLeft);
            isPaused = isPaused ? false : true
        }else{
            this.classList.remove('pause');
            this.classList.add('play');
            clearInterval(intervalTimer);
            isPaused = isPaused ? false : true ;
        }
    }

    function displayTimeLeft (timeLeft){ //displays time on the input
        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;
        let displayString = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        displayOutput.textContent = displayString;
        update(timeLeft, wholeTime);
    }

    pauseBtn.addEventListener('click',pauseTimer);
});

