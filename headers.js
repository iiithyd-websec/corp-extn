// Runs in headers.html

//gets the TabId from the url (after the ?) and converts it to an int
var tabId = parseInt(window.location.search.substring(1));

window.addEventListener("load", function() {
  chrome.debugger.sendCommand({tabId:tabId}, "Network.enable");
  chrome.debugger.onEvent.addListener(onEvent);
});

window.addEventListener("unload", function() {
  chrome.debugger.detach({tabId:tabId});
});

var requests = {};

function onEvent(debuggeeId, message, params) {
  if (tabId != debuggeeId.tabId)
    return;

  if (message == "Network.requestWillBeSent") {
    var requestDiv = requests[params.requestId];
    if (!requestDiv) {
      var requestDiv = document.createElement("div");
      requestDiv.className = "request";
      requests[params.requestId] = requestDiv;
      var urlLine = document.createElement("div");
      urlLine.textContent = "This is the request url:\n" + params.request.url;
      requestDiv.appendChild(urlLine);
	  //alert(urlLine.textContent);
    }

    if (params.redirectResponse)
      appendResponse(params.requestId, params.redirectResponse);

    var requestLine = document.createElement("div");
	
	//params.request.method is the http method (eg GET)
	//parseURL(params.request.url).path is the full url
    requestLine.textContent = "\nThis is the path and method:\n" + params.request.method + " " +
        parseURL(params.request.url).path;
    requestDiv.appendChild(requestLine);
    document.getElementById("container").appendChild(requestDiv);
  } else if (message == "Network.responseReceived") {
	//var textNode = document.createTextNode("\nResponse has been received:\n");
	//var hello = document.createElement("div");
	//hello.textContent = "\nResponse has been received:\n";
	//requestDiv.appendChild(hello);
    appendResponse(params.requestId, params.response);
  }
}

function appendResponse(requestId, response) {
  var requestDiv = requests[requestId];
  requestDiv.appendChild(formatHeaders(response.requestHeaders));
  
  var statusLine = document.createElement("div");
  statusLine.textContent = "\nHTTP/1.1 " + response.status + " " +
      response.statusText;
  requestDiv.appendChild(statusLine);
  requestDiv.appendChild(formatHeaders(response.headers));
  
  var myDiv = document.createElement("div");
  myDiv.textContent = "\nThis is the CORP header:\n";
  requestDiv.appendChild(myDiv);
  
  var myText = "";
  for (myName in response.headers)
  {
	if(myName==="CORP")
	{
		myText += myName + ": " + response.headers[myName] + "\n";
	}
  }
  
  var aDiv = document.createElement("div");
  aDiv.textContent = myText;
  requestDiv.appendChild(aDiv);
}

function formatHeaders(headers) {
  var text = "";
  for (name in headers)
    text += name + ": " + headers[name] + "\n";
  var div = document.createElement("div");
  div.textContent = text;
  return div;
}

function parseURL(url) {
  var result = {};
  var match = url.match(
      /^([^:]+):\/\/([^\/:]*)(?::([\d]+))?(?:(\/[^#]*)(?:#(.*))?)?$/i);
  if (!match)
    return result;
  result.scheme = match[1].toLowerCase();
  result.host = match[2];
  result.port = match[3];
  result.path = match[4] || "/";
  result.fragment = match[5];
  return result;
}