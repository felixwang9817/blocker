document.addEventListener('DOMContentLoaded', () => {
    let startBlockingButton = document.getElementById('start-blocking');
    let stopBlockingButton = document.getElementById('stop-blocking');
    let timer = document.getElementById('timer');
    let seconds_remaining = null;
    var countdown = null;

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
    })

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


