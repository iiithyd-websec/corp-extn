//checkTags();
/*
getURL();

function getURL(){
var currentUrl = document.URL;	
console.log(currentUrl);
}

function checkTags(){
	var imgs = document.getElementsByTagName("img");
	//alert(imgs.length + " img tags are present on this page."); 
	//empty array which should hold all of the img src's
	var imgSrcs = [];
	
	alert("Hello");
	
	if(imgs.length>0) {
		//URL of the page
		var url = document.URL;	
		
		var imgSrc = imgs[0].src;
		//origin of the current url
		var urlOrigin = parseURL(url).host + parseURL(url).port;
		//origin of the img src
		var imgOrigin = parseURL(imgSrc).host + parseURL(imgSrc).port;
		
		if(urlOrigin === imgOrigin) {
			//allow the page to load
			alert("Same origin in content script");
		}
		else {
			//check CORP if deny, then stop page from loading
			var urlPath = parseURL(imgSrc).path
			
			chrome.extension.sendRequest({method: "getStatus"}, function(response) {
				var corp = response.corp;
				var corpArray = corp.split('=');
				//alert("CORP: " + corpArray[1] + "\n IMGSRC: " + imgSrc);
				//alert("\n IMGSRC: " + imgSrc)
				
				var a = corpArray[1].trim();
				var b = imgSrc.trim();
				
				if(a === b) {
					alert("image allowed");
				}
				else {
					alert("image not allowed to load, it is a CSRF attack");
					//window.stop();
				}
			});
		}
	}
	 //return imgSrcs;
 }
 
 function cookieAlert(){
	alert("Cookies present: " + document.cookie);
	alert(getCookie("img"));
 }
 
 function getCookie(c_name) {
	var c_value = document.cookie;
	var c_start = c_value.indexOf(" " + c_name + "=");
	if (c_start == -1){
		c_start = c_value.indexOf(c_name + "=");
	}
	
	if (c_start == -1){
	c_value = null;
	}
	else {
		c_start = c_value.indexOf("=", c_start) + 1;
		var c_end = c_value.indexOf(";", c_start);
		if (c_end == -1){
			c_end = c_value.length;
			}
		c_value = unescape(c_value.substring(c_start,c_end));
	}
	return c_value;
}

function parseURL(url) {
  var result = {};
  var match = url.match(
      /^([^:]+):\/\/([^\/:]*)(?::([\d]+))?(?:(\/[^#]*)(?:#(.*))?)?$/i);
  if (!match)
    return result;
  result.scheme = match[1].toLowerCase();	//http etc
  result.host = match[2];				//localhost etc
  result.port = match[3];
  result.path = match[4] || "/";	//after the origin
  result.fragment = match[5];
  return result;
}
*/