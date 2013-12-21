function MessagePeice(type,value) {
        this.type=type;
        this.value=value;
    }

function linkify(inputText) {
    if(!inputText){
        return [];
    }
    var messagePeices = [];
    var websitePattern = /[^\s\"<>]+\.[^\s\"<>]+(\b|$)/gim;
    var matches = inputText.match(websitePattern);
    if(!matches){
        messagePeices.push(new MessagePeice("text",inputText));
    }else{
        var last = 0;
        for(var i = 0;i<matches.length;i++){
            var start = inputText.indexOf(matches[i]);
            var end = start+matches[i].length;
            linkText = matches[i].replace("http://","").replace("https://","");
            messagePeices.push(new MessagePeice("text",inputText.substring(last,start)));
            messagePeices.push(new MessagePeice("link",linkText));
            last=end;
        }
        messagePeices.push(new MessagePeice("text",inputText.substring(last)));
    }
    return messagePeices;
}