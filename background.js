/*
	Author: Krishna Chaitanya Telikicherla
	Email: KrishnaChaitanya.t@research.iiit.ac.in
*/

//Global variable which will hold the URL of the current page
var tabURL = "";

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
   chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
		//origin of the page loaded in the current tab.
		tabURL=tabs[0].url;
		//console.log('onUpdated: ', tabURL);
	});
}); 

chrome.tabs.onActivated.addListener(function(activeInfo) {
  // how to fetch tab url using activeInfo.tabid
	chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
		//origin of the page loaded in the current tab.
		tabURL=tabs[0].url;
		//console.log('onUpdated: ', tabURL);
	});
});


//Receive CORP header and save it in localStorage.
chrome.webRequest.onHeadersReceived.addListener(function (details){
	var responseOrigin= parseURL(details.url).scheme + parseURL(details.url).host + parseURL(details.url).port;
	var tabPageOrigin = parseURL(tabURL).scheme + parseURL(tabURL).host + parseURL(tabURL).port;
	//console.log('responseOrigin: ', responseOrigin, 'tabPageOrigin: ', tabPageOrigin);
	//Same-origin check before setting CORP header. Very important to ensure that sites don't clobber each other's policies.
	if(responseOrigin === tabPageOrigin){ 
		for(i=0; i<details.responseHeaders.length; i++) {
			
			if(details.responseHeaders[i].name.toLowerCase() ==="CORP".toLowerCase()) {
				var j = i;
				//origin of the page loaded in the current tab.
				var tabPageOrigin = parseURL(tabURL).scheme + parseURL(tabURL).host + parseURL(tabURL).port;
				var tempCORP = details.responseHeaders[j].value.toString();
				localStorage[tabPageOrigin] = tempCORP;
				console.log("CORP saved successfully: ", tempCORP);
			}
		}
	}
}, 
{urls: ["<all_urls>"]}, 
['responseHeaders']
);

//Function to parse the URL
function parseURL(url) {
  var result = {};
  var match = url.match(
      /^([^:]+):\/\/([^\/:]*)(?::([\d]+))?(?:(\/[^#]*)(?:#(.*))?)?$/i);
  if (!match)
    return result;
  result.scheme = match[1].toLowerCase();
  result.host = match[2];
  result.port = match[3] || 80; 
  result.path = match[4] || "/";
  result.fragment = match[5];
  return result;
}

//Gets the current time in hh:mm:ss:mls
function timeStamp() {
//Create a date object with the current time
  var now = new Date();
 
//Create an array with the current hour, minute and second
  var time = [now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds()];
  
//If seconds and minutes are less than 10, add a zero
  for ( var i = 1; i < 3; i++ ) {
    if ( time[i] < 10 ) {
      time[i] = "0" + time[i];
    }
  }
  return time.join(":");
}

function printMessage(url, type, policy ){
	var msg="Request to URL [" + url + "] by [" + type + "] is blocked by the policy [" + policy+ "] at "+timeStamp();
	console.log(msg);
}

chrome.webRequest.onBeforeRequest.addListener(function(info) {
	//console.log('onBeforeRequest info: ',JSON.stringify(info));
	
	//origin of the page loaded in the current tab.
	var tabPageOrigin = parseURL(tabURL).scheme + parseURL(tabURL).host + parseURL(tabURL).port;
	//origin of the src, to which request is being made.
	var targetOrigin = parseURL(info.url).scheme + parseURL(info.url).host + parseURL(info.url).port;
	
	var targetCORP = localStorage[targetOrigin];

	//Check if target origin has configured CORP and if the request is cross origin
	if(targetCORP && (tabPageOrigin !== targetOrigin)) {
		//targetCORP: "image-src http://localhost:3100/img/;frame-descendants DENY;default-src DENY"
		//Convert the string "targetCORP" into JS object literal for easier lookup.
		var chromeTypes={
			'image-src': 'image',
			'script-src': 'script',
			'frame-descendants':'sub_frame',
			'style-src': 'stylesheet',
			'object-src': 'object',
			'xhr-src': 'xmlhttprequest'
		}
		var corpArray = targetCORP.split(';');
		var corpObj={};
		for(i=0;i<corpArray.length;i++){
		  var keyValPair=corpArray[i].trim().split(' ');
		  var key=keyValPair[0];
		  //Interpret 'type' in the policy as Chrome's inbuilt info.type
		  if(chromeTypes[key]){
			key=chromeTypes[key]
		  }
		  corpObj[key]=keyValPair[1].trim();
		}
		/* //Converted object literal
		var corp={
			'image': 'DENY',
			'script': 'DENY',
			'sub_frame': 'DENY',
			'stylesheet': 'DENY',
			'object': 'DENY'
			'xmlhttprequest': 'DENY',
	
			//Chrome extension API doesn't explicitly handle the below types
			'media-src': 'DENY',
			'font-src': 'DENY',
			'form-action': 'DENY',
			'hyperlink-src': 'DENY',
			'window-src': 'DENY',
		}
		console.log("xhr-src: ", corp['xhr-src']);
		*/
		//Lookup the policy restriction corresponding to the request initiator (info.type)
		if(corpObj[info.type]){
			var corpRestriction=corpObj[info.type];
			var requestedURL = info.url.trim();
			//If the restriction for info.type is "DENY", cancel the request.
			if(corpRestriction === "DENY") {
				printMessage(requestedURL, info.type, info.type+' '+corpRestriction);
				return {cancel: true};
			}
			//If the requested URL matches with the URL in corpRestriction, allow the request.
			if(requestedURL.indexOf(corpRestriction) !== -1) {
				console.log(timeStamp() + ": Resource allowed according to the CORP: " + requestedURL);
			}
			//If the requested URL is not a part of the policy, cancel the request
			if(requestedURL.indexOf(corpRestriction) === -1) {
				printMessage(requestedURL, info.type, info.type+' '+corpRestriction);
				return {cancel: true};
			}
		}
		else{
			//If the restriction for "default-src" is "DENY", cancel the request.
			console.log('default-src:: info.type: ', info.type);
			if(corpObj['default-src']==='DENY'){
				printMessage(info.url, info.type, 'default-src DENY');
				return {cancel: true};
			}
		}
	}
},
  // filters
  {
    urls: [
	  "http://localhost:*/*",
	  "http://*/*",
    ],
    types: ["image", "script", "sub_frame", "main_frame", "stylesheet", "object", "xmlhttprequest", "other"]
  },
  // extraInfoSpec
  ["blocking"]);