
/* element selection*/
function $(id,obj_id)
{
    if (obj_id) 
    {
        var obj =$(obj_id)
        if(obj) return obj.getElementById(id);
    }
    else
        return document.getElementById(id);
}

function $T(tag,obj_id)
{
    if (obj_id) 
    {
        var obj =$(obj_id)
        if(obj) return obj.getElementsByTagName(tag);
    }
    else
        return document.getElementsByTagName(tag);
}

function $N(name,obj_id)
{
    /*if (obj_id) 
    {
        var obj =$(obj_id)
        if(obj) return obj.getElementsByName(name);
    }
    
    else*/
        return document.getElementsByName(name);
}

/* get/set functions*/
function GetOriginalText()
{
    return $("Original_Codes_Text").value;
}

function SetOriginalText(v)
{
    $("Original_Codes_Text").value = v;
}

function GetCodesText()
{
    return $("Codes_Content").value;
}

function SetCodesText(v)
{
    $("Codes_Content").value = v;
}

function SetPresentation(v,checkEncode)
{
    var render =$("styling_presentation");
    if(checkEncode == true && $("prerequisite_quote").disabled == false)
    {
        try{
            render.textContent = v;
        }
        catch(e)
        {
            try{
                render.innerText = v;
            }
            catch(ex)
            {
                render.innerHTML = v;
            }
        }
    }
    else
        render.innerHTML = v;
}   

function SetButtonDisability(name,disabled)
{
    var elems = $T("input","Text_Wrapper_Area");
    var btn;
    for(var index in elems)
    {
        btn = elems[index];
        if(btn.type == "button" && (btn.name == name || name == "ALL_BUTTONS"))
            btn.disabled = disabled;
    }
}

/******* button events *******/
function ConvertStringToIntByType(type)
{
    var intType = 0;
    if(type == "encode") intType = 0x100;
    if(type == "quote") intType = 0x010;
    
    if(type == "comment") intType = 0x0F;
    if(type == "keyword") intType = 0x0E;
    if(type == "character") intType = 0x0D;
    if(type == "function") intType = 0x0C;
    if(type == "number") intType = 0x0B;
    if(type == "preprocessor") intType = 0x0A;
    if(type == "stdlib") intType = 0x09;
    
    return intType;
}


function Find(type)
{
    var intType = ConvertStringToIntByType(type);
    
    var txt = PrerequisiteActions(GetCodesText(),intType);
    var result = "";
    
    switch(intType)
    {
        case 0x100: result = HTMLEncode(txt); break;
        case 0x010: result = FindQuotes(txt); break;
        case 0x0F: result = FindComments(txt); break;
        case 0x0E: result = FindKeywords(txt); break;
        case 0x0D: result = FindChars(txt); break;
        case 0x0C: result = FindFunctions(txt); break;
        case 0x0B: result = FindNumbers(txt); break;
        case 0x0A: result = FindDirectives(txt); break;
        case 0x09: result = FindStandardLibrary(txt); break;
    }

    SetCodesText(result);
    SetPresentation(result);

}

//prerequisite condition: text should be encodes, quotation must be found
function PrerequisiteActions(code_text,intType)
{
    var result = code_text;
    
    if((intType & 0x0FF)>0)
    {
        var btn = $("prerequisite_encode");
        if(btn.disabled == false)result = HTMLEncode(result);
    }
    
    if((intType & 0x00F)>0)
    {
        btn = $("prerequisite_quote");
        if(btn.disabled == false)result = FindQuotes(result);
    }
 
    return result;
}

//replace "<" with "&lt;" so that they would not treat as tag
function HTMLEncode(code_text)
{   
    SetOriginalText(code_text);
    
    var result = code_text.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    SetButtonDisability("encode",true);
    return result;
}

//quotes should be find first, so that css class name would not be treated as quotes
function FindQuotes(code_text)
{
    var pattern=/".*?[^\\](\\\\)*"|""/;
    var result = ExecuteTagWrapper(code_text,pattern,"span","quote");
    
    SetButtonDisability("quote",true);
    return result;
}

function FindComments(code_text)
{
    //var pattern=new RegExp("//.*");       //C++ style comment
    //var pattern = /\/\*(.|\s)*?\*\//;     //C style comment
    var pattern= /(\/\/.*)|(\/\*(.|\s)*?\*\/)/; 
    var result = ExecuteTagWrapper(code_text,pattern,"span","comment");
    
    SetButtonDisability("comment",true);
    return result;
}

//find c++ keywords
function FindKeywords(code_text)
{
    var pattern=/\b(bool|break|case|catch|char|class|const_cast|const|continue|default|delete|do|double|dynamic_cast|else|enum|explicit|extern|false|float|for|friend|goto|if|inline|int|long|mutable|namespace|new|operator|private|protected|public|register|reinterpret_cast|return|short|signed|sizeof|static_cast|static|struct|switch|template|this|throw|true|try|typedef|typeid|typename|union|unsigned|using|using|virtual|void|volatile|wchar_t|while|string)(?=(\s+(\w))|(\s*[:~&<>\(\*]))/;
    var result = ExecuteTagWrapper(code_text,pattern,"span","keyword");
    
    SetButtonDisability("keyword",true);
    return result;
}

//find characters
function FindChars(code_text)
{
    var pattern=/'(\\[\\abfnrt'"]|[^'\\]|\\x[0-9a-fA-F]{2})'/;
    var result = ExecuteTagWrapper(code_text,pattern,"span","character");
    
    SetButtonDisability("character",true);
    return result;
}

//find functions definitions and calls
function FindFunctions(code_text)
{
    return code_text;
    /*To Be Implemented ...
    var pattern="";
    var result = ExecuteTagWrapper(code_text,pattern,"span","function");
    
    SetButtonDisability("function",true);
    return result;
    */
}

//find preprocessors
function FindDirectives(code_text)
{
    var pattern=/#\w*(?=\s)/;
    var result = ExecuteTagWrapper(code_text,pattern,"span","preprocessor");
    
    SetButtonDisability("preprocessor",true);
    return result;
}

//find numbers
function FindNumbers(code_text)
{
    return code_text;
    /*To Be Implemented ...
    var pattern="";
    var result = ExecuteTagWrapper(code_text,pattern,"span","number");
    
    SetButtonDisability("number",true);
    return result;
    */
}


function FindStandardLibrary(code_text)
{
    var pattern=/\b(std|cout|cin|iostream|endl|list|vector)(?=(\s+(\w))|(\s*[&<>\(\*;]))/;
    var result = ExecuteTagWrapper(code_text,pattern,"span","stdandarlibrary");
    
    SetButtonDisability("stdlib",true);
    return result;
}





function QuickView()
{
    var elems = $T("input","Text_Wrapper_Area");
    var btn;
    for(var index in elems)
    {
        btn = elems[index];
        if(btn.type == "button" && btn.disabled == false)
            Find(btn.name);
    }
}

//restart syntax coloring
function RestartColoring()
{
    SetCodesText(GetOriginalText());
    SetPresentation("");
    SetButtonDisability("ALL_BUTTONS",false);
    SetButtonDisability("function",true);
    SetButtonDisability("number",true);
}


/******* execute regular expression and wrap the matched result with specific tag and css class *******/
function ExecuteTagWrapper(code_text, regex, tagName, cssClass)
{
    var lastResult = "";
    var remain = code_text;
    var matched = "";
    
    var start = remain.search(regex);
    var end = -1;
    
    while(start >= 0)
    {
        lastResult += remain.substring(0,start);
        
        matched = regex.exec(remain); //exec() return matched array of string
        //the first item is whole string
        //the other items are the grouping results
        if(matched != null && matched.length > 0)matched = matched[0];
        
        lastResult += WrapTextWithTag(matched, tagName, cssClass)
        
        end = start + matched.length;
        
        //search for new match
        remain = remain.substring(end,remain.length);
        start = remain.search(regex);
    }
    
    
    lastResult += remain;
    
    return lastResult;
}



function WrapTextWithTag(content, tagName, cssClass)
{
    if(content == null || content.length == 0) return "" ;
    
    var openTag = "<" + tagName+ ">";
    var closeTag = "</" + tagName +">";

    if(cssClass.length > 0)
        openTag = "<" + tagName+ " " + "class=\"" + cssClass +"\" >";
    
    var wraped = openTag + content + closeTag;
    
    return wraped;
 
}


