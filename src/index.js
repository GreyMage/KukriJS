// This is a singleton "namespace global" event emitter type thing.
// Its specifically for use within this namespace, and nothing is
// really supposed to "extend" from it, its more of a pub/sub handler.

var pubSub = (function(){
	
	var instance;
	
	function createInstance(){
		var ns = {};

		ns.channels = {};
		
		ns.pub = function(channel,value){
			ns.channels[channel] = ns.channels[channel] || [];
			ns.channels[channel].forEach(function(callback){
				if(callback)callback(value);
			});
		};
		
		ns.sub = function(channel,callback){
			ns.channels[channel] = ns.channels[channel] || [];
			ns.channels[channel].push(callback);
		};
		
		ns.unsub = function(channel, callback){
			ns.channels[channel] = ns.channels[channel] || [];
			var pos = ns.channels[channel].indexOf(callback);
			if(!~pos)return;
			ns.channels[channel].splice(pos,1);
		};

		return ns;
	}
	
	return {
		getInstance: function(){
			if(!instance) instance = createInstance();
			return instance;
		}
	};
	
})();

// This is a personalized deferral object I made. 
// I love it.

var deferred = function(){
	var resolved = false;
	var rejected = false;
	var resolvedCallbacks = [];
	var rejectedCallbacks = [];
	var resolveArgs = [];
	var rejectArgs = [];
	var ns = {};
	ns.done = function(cb){
		if(resolved) {
			cb.apply(null,resolveArgs);
			return;
		}
		resolvedCallbacks.push(cb);
		return this;
	};
	ns.fail = function(cb){
		if(rejected) {
			cb.apply(null,rejectArgs);
			return;
		}
		rejectedCallbacks.push(cb);
		return this;
	};
	ns.always = function(cb){
		return ns.done(cb).fail(cb);
	};
	ns.resolve = function(){
		if(rejected || resolved) return;
		resolved = true;
		resolveArgs = arguments;
		for(var i=0;i<resolvedCallbacks.length;i++){
			resolvedCallbacks[i].apply(null,resolveArgs);
		}
		return this;
	};
	ns.reject = function(){
		if(rejected || resolved) return;
		rejected = true;
		rejectArgs = arguments;
		for(var i=0;i<rejectedCallbacks.length;i++){
			rejectedCallbacks[i].apply(null,rejectArgs);
		}
		return this;
	};
	ns.promise = function(){
		return {
			done:function(){ns.done.apply(null,arguments); return this;},
			fail:function(){ns.fail.apply(null,arguments); return this;},
			always:function(){ns.always.apply(null,arguments); return this;}
		};
	};
	return ns;
};

// create element shorthand
var ce = function(name,attrs,text){
	var elem = document.createElement(name);
	if(text) elem.appendChild(document.createTextNode(text));
	for(var attributeName in attrs){
		var attributeValue = attrs[attributeName];
		elem.setAttribute(attributeName,attributeValue);
	}
	return elem;
};

// Allows me to easily encode an object into a post param.
var postEncode = function(obj){
	if(typeof obj != "object") return obj;
	return Object.keys(obj).reduce(function(a,k){
		a.push(k+'='+encodeURIComponent(obj[k]));
		return a;
	},[]).join('&');
};

// Deep extend from http://youmightnotneedjquery.com/
var deepExtend = function(out) {
  out = out || {};

  for (var i = 1; i < arguments.length; i++) {
    var obj = arguments[i];

    if (!obj)
      continue;

    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === 'object')
          deepExtend(out[key], obj[key]);
        else
          out[key] = obj[key];
      }
    }
  }

  return out;
};

// Deep extend from http://youmightnotneedjquery.com/
var extend = function(out) {
  out = out || {};

  for (var i = 1; i < arguments.length; i++) {
    if (!arguments[i])
      continue;

    for (var key in arguments[i]) {
      if (arguments[i].hasOwnProperty(key))
        out[key] = arguments[i][key];
    }
  }

  return out;
};

// quick and dirty AJAX using my deferred object.
var ajax = function(options){

	var config = {
		url:"/",
		method:"get",
		data:false,
		sendDataAsJSON:false,
	};
	config = extend(config,options);
	
	var def = deferred();
	
	var request = new XMLHttpRequest();
	request.open(config.method, config.url, true);

	request.onload = function() {
	  if (request.status >= 200 && request.status < 400) {
		var data = request.responseText;
		try{ data = JSON.parse(data); } catch(e) {}
		def.resolve(data,false);		
	  } else {
		def.reject(false,request);
	  }
	};

	request.onerror = function() {
	  def.reject(false,request);
	};
	
	if(config.data){
		if(config.sendDataAsJSON){
			request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
			request.send(JSON.stringify(config.data));
		} else {
			request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
			request.send(postEncode(config.data));
		}
	} else {
		request.send();
	}
	
	return def.promise();

};

// For easily making FA-Icons
var fontAwesomeIcon = function(name){
	var i = document.createElement('i');
	i.classList.add("fa");
	i.classList.add("fa-"+name);
	return i;
};

// No-jquery fadeins and outs.
function fadeIn(el) {
	var d = new deferred();
	el.style.opacity = 0;

	var last = +new Date();
	var tick = function() {
		el.style.opacity = +el.style.opacity + (new Date() - last) / 400;
		last = +new Date();

		if (+el.style.opacity < 1) {
			if (window.requestAnimationFrame)
				requestAnimationFrame(tick);
			else 
				setTimeout(tick, 16);
		} else {
			d.resolve();
		}
	};

	tick();
	return d.promise();
}
function fadeOut(el) {
	var d = new deferred();
	el.style.opacity = 1;

	var last = +new Date();
	var tick = function() {
		el.style.opacity = +el.style.opacity - (new Date() - last) / 400;
		last = +new Date();

		if (+el.style.opacity > 0) {
			if (window.requestAnimationFrame)
				requestAnimationFrame(tick);
			else 
				setTimeout(tick, 16);
		} else {
			d.resolve();
		}
	};

	tick();
	return d.promise();
}

// Simple little data-binding handler
var createBoundElement = function(options){

	var config = {
		object:"/",
		property:"get",
		uniq:false,
		elem:false,
		readFunc:false,
		writeFunc:false,
	};
	config = extend(config,options);

	// get instance of pubsubber
	var ps = pubSub.getInstance();
	
	// Create dom elem
	var input = config.elem || ce("input");
	
	var getVal = function(){
		if(config.readFunc) return config.readFunc(config.object[config.property]);
		return config.object[config.property];
	};
	var setVal = function(raw){
		if(config.writeFunc) config.object[config.property] = config.writeFunc(raw);
		config.object[config.property] = raw;
	};

	// If we hear the value changed, update our value.
	var channel = "be_"+config.uniq+"_"+config.property;
	ps.sub(channel,function(data){
		setVal(data);
		if(typeof input.value != "undefined"){
			input.value = getVal();
		} else {
			input.innerHTML = "";
			input.appendChild(document.createTextNode(getVal()));
		}
	});
	
	if(typeof input.value != "undefined"){
	
		var publish = function(){
			ps.pub(channel,input.value);
		};
		
		// Start it off right.
		input.value = getVal();
		
		// watch the field, and publish any changes.
		input.addEventListener("change",publish);
		input.addEventListener("keyup",publish);
		
	} else {
		input.innerHTML = "";
		input.appendChild(document.createTextNode(getVal()));
	}
	
	// Finally, run the initial var through the provided read func if nessicary.
	setVal(getVal());
	
	return input;
};