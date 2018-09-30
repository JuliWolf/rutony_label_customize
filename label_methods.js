var LabelName = "";

var jsonData = {
  Format: '',
  Values : {}
};

// ----------------------------

var jsonStyle = {
  TextStyle : {
    color: "",
    "background-color": "",
	"font-size": "18pt",
	"font-family": "Arial"
  },
  KeywordStyle : {
    color: "",
    "background-color": "",
	"font-size": "18pt",
	"font-family": "Arial",
  },
	EffectNewValueHide: "none",
	EffectNewValueShow: "none",
	EffectKeywords: "none",
    ScrollBehavior: "none",
    ScrollDirection: "right",
    ScrollAmount: 6,
    ScrollDelay: 85,
};

var queryParams;
var prevEffectHide = "";
var prevEffectShow = "";

// ----------------------------

function SetStyle(paramStyle) {	

	if (paramStyle != "") {

        jsonStyle = paramStyle;

        var TextStyle = GetStyle("TextStyle");
        var KeywordStyle = GetStyle("KeywordStyle");
		
        var label = $('.label');
		label.removeAttr('style');
		label.attr('style', TextStyle.toString().toString());

        var letters = $('.letter');
		letters.removeAttr('style');
		letters.attr('style', KeywordStyle.toString().toString());
        letters.removeClass().addClass('letter').addClass('animated-letter').addClass(jsonStyle.EffectKeywords);

        if (jsonStyle.TextStrokeSize != 0 && jsonStyle.TextStrokeSize != null ) {
            label.textStroke(jsonStyle.TextStrokeSize, jsonStyle.ColorTextStroke);
        }

        if (jsonStyle.KeywordStrokeSize != 0 && jsonStyle.KeywordStrokeSize != null ) {
            letters.textStroke(jsonStyle.KeywordStrokeSize, jsonStyle.ColorKeywordStroke);
        }
        

        if (jsonStyle.ScrollBehavior !== "none" && jsonStyle.ScrollBehavior !== undefined) {
            $('.marquee').marquee('destroy');

            $('.marquee').marquee({
                duration: jsonStyle.ScrollAmount * 1000,
                startVisible: true,
                direction: jsonStyle.ScrollDirection,
                duplicated: true
            });
        } else {
           $('.marquee').marquee('destroy'); 
        } 
                
        $('.LabelPosition').css('text-align', jsonStyle.HorizontalAlign);
        $('.LabelPosition').css('vertical-align', jsonStyle.VerticalAlign);

        console.log('ani started');
        $('.label').addClass('animated ' + jsonStyle.EffectNewValueShow + ' magictime ' + jsonStyle.EffectNewValueShow) 
        .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){

            $('.label').removeClass(function () { 
                return $(this).attr('class').replace(/\b(?:label)\b\s*/g, ''); 
            });

            console.log('ani finished');
        });  

    }

}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function SetEffectLetters(value) {	
    if (value === undefined)
        return "";

    if (value === null)
        return "";

    if (value === "")
        return "";

    if (value === "null")
        return "";
    
    var KeysWithTags = $.map(value.split(''),function(l) { 
        if (l == ' ') return '&nbsp;';
        return '<span class="letter">' + l + '</span>'; 
    }).join('');
    
    //$st.append($.map(KeysWithTags.split('&nbsp;'), function(l) {
    //    return '<span class="keyword">' + l + '&nbsp;</span>';
    //}).join(''));

    return '<span class="keyword">' + KeysWithTags + '</span>';
}


function SetValue(paramValue) {

    if (JSON.stringify(jsonData) === JSON.stringify(paramValue)) {
        return;
    }

    jsonData = paramValue;

    var resString = paramValue.Format;
	
	resString = resString.replaceAll(String.raw`\\n`, '<br>');
	
    $.each(paramValue.Values, function(key, value){
        if (key == "RESULT") {
            resString = value;
        } else {
            resString = resString.replaceAll(key, SetEffectLetters(value));
        }
        
    });

    $('.label').html(resString);
    $('.letter').addClass('animated-letter').addClass(jsonStyle.EffectKeywords);

    SetStyle(jsonStyle); 

    if (jsonStyle.EffectNewValueShow != "none") {
        console.log('ani started');
        $('.label').addClass('animated ' + jsonStyle.EffectNewValueShow + ' magictime ' + jsonStyle.EffectNewValueShow) 
        .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){

            $('.label').removeClass(function () { 
                return $(this).attr('class').replace(/\b(?:label)\b\s*/g, ''); 
            });

            console.log('ani finished');
        });  
    }

}

function GetStyle(paramStyle) {
  
  var strStyle = "";
  $.each(jsonStyle, function(key, value){
    if (key == paramStyle) {
      $.each(value, function(key, value){
        strStyle = strStyle + key + ":" + value + ";";
      });
      return strStyle;    
    }
  });

  return strStyle;
}

// -----------------------------

function getQueryParams(qs) {
    qs = qs.split('+').join(' ');

    var params = {},
        tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }

    return params;
}

function NewMessage(msg) {
	
	jsonMsg = JSON.parse(msg);
	
	if (jsonMsg.type == "theme") {
        if (jsonMsg.label == LabelName) {
            console.debug(msg);
            
            if (jsonMsg.data != null) {
                jsonStyle = jsonMsg.data;
                Cookies.set('theme' + LabelName, jsonStyle);
                SetStyle(jsonStyle);
                return;
            }
        }
	}
	if (jsonMsg.type == "data") {
		if (jsonMsg.label == LabelName) {
            console.debug(msg);
            
            Cookies.set('data' + LabelName, jsonMsg.data);
			SetValue(jsonMsg.data);
		}
	}
		
}

$.fn.textStroke = function(r, colour) {
  
	var rules = [];
	var steps = 24;
	 
	for (var t=0;t<=(2*Math.PI);t+=(2*Math.PI)/steps){
	  
	var x = r*Math.cos(t);
	var y = r*Math.sin(t);
	 
	x = (Math.abs(x) < 1e-6) ? '0' : x.toString();
	y = (Math.abs(y) < 1e-6) ? '0' : y.toString();
	 
	rules.push( x + "px " + y + "px 0px " + colour );
	 
	}
	 
	this.css('textShadow',rules.join());
 
};

function SetSocket(){
	
	var host_ = window.location.host;
	if (host_ == "" || host_ == "absolute")
		host_ = "localhost:8383";
	
	var socket = new WebSocket('ws://' + host_ + '/Labels');
	socket.onopen = function(msg) {
		var jsonReq = {
		  type: "init",
		  label: queryParams.label
		};		
		socket.send(JSON.stringify(jsonReq));
	};
	socket.onmessage = function(msg) {
		NewMessage(msg.data)
	};
	socket.onclose = function(){
		setTimeout(function(){SetSocket();}, 2000);
	};
	
	window.onbeforeunload = function(event) {
		socket.onclose = function () {}; 
		socket.close();
	};
	
}

function GetParams() {
	queryParams = getQueryParams(document.location.search);
    LabelName = queryParams.label;

    if (LabelName != "") {
        var themeJson = Cookies.getJSON('theme' + LabelName);
        if (themeJson != null) {
            jsonStyle = themeJson;
        }
        var dataJson = Cookies.getJSON('data' + LabelName);
        if (dataJson != null) {
            SetValue(dataJson);
        }
    }
}