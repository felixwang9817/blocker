
let page_history_stats = {};  
let current_page_start_time = null; 
let current_page = null; 
let seconds_remaining = null;
var counter = null;

function block_websites() {
    return {cancel: true};
}


function reset_globals() {
	//TODO: clear intervals
 	page_history_stats = {};  
 	current_page_start_time = null; 
 	current_page = null; 
 	seconds_remaining = null;
 	counter = null;
}

function countdown() {
    seconds_remaining -= 1;
    console.log(seconds_remaining);
    if (seconds_remaining <= 0) {
        clearInterval(counter);
    }
}

function updateCurrentPage(){
    // TODO: figure out why this doesn't update properly
	chrome.tabs.query({
		active: true,
		lastFocusedWindow: true
	}, function(tabs) {
		// and use that tab to fill in out title and url
		console.log("tabs: ", tabs); 
		if(tabs.length > 0){
			var tab = tabs[0];
			if(tab.hasOwnProperty('url')){
				current_page = tab.url.split("/")[2]; 
				console.log('updated current_page to ' + current_page);
			}
		}
	});
}

function updateCurrentTime(){
	current_page_start_time = Date.now();
}

function recordPages(){
	let elapsed_time = (Date.now() - current_page_start_time) / 1000;
	console.log('current_page: ' + current_page);
	console.log('elapsed_time: ' + elapsed_time);
	if (page_history_stats.hasOwnProperty(current_page)) {
		page_history_stats[current_page] += elapsed_time;
	} else {
		page_history_stats[current_page] = elapsed_time;
	}
	updateCurrentTime();
	updateCurrentPage();
	console.log(page_history_stats);
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.task === 'start' && seconds_remaining === null) {
            chrome.webRequest.onBeforeRequest.addListener(
                block_websites,
                {urls: ["*://www.google.com/*"]},
                ["blocking"]
            );

			chrome.tabs.onActivated.addListener(
				recordPages
			);

			seconds_remaining = 30;
			counter = setInterval(countdown, 1000);
			updateCurrentPage();
			updateCurrentTime(); 

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

