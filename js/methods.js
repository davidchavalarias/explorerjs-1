
function pr(msg) {
    console.log(msg);
}

getUrlParam = (function () {
    var get = {
        push:function (key,value){
            var cur = this[key];
            if (cur.isArray){
                this[key].push(value);
            }else {
                this[key] = [];
                this[key].push(cur);
                this[key].push(value);
            }
        }
    },
    search = document.location.search,
    decode = function (s,boo) {
        var a = decodeURIComponent(s.split("+").join(" "));
        return boo? a.replace(/\s+/g,''):a;
    };
    search.replace(/\??(?:([^=]+)=([^&]*)&?)/g, function (a,b,c) {
        if (get[decode(b,true)]){
            get.push(decode(b,true),decode(c));
        }else {
            get[decode(b,true)] = decode(c);
        }
    });
    return get;
})();

function showhideChat(){
    
    cg = document.getElementById("rightcolumn");
    if(cg){
        if(cg.style.right=="-400px"){
            cg.style.right="0px";
        }
        else cg.style.right="-400px";
    }
}

function ArraySortByValue(array, sortFunc){
    var tmp = [];
    oposMAX=0;
    for (var k in array) {
        if (array.hasOwnProperty(k)) {
            tmp.push({
                key: k, 
                value:  array[k]
            });
            if((array[k]) > oposMAX) oposMAX= array[k];
        }
    }

    tmp.sort(function(o1, o2) {
        return sortFunc(o1.value, o2.value);
    });   
    return tmp;      
}

function ArraySortByKey(array, sortFunc){
    var tmp = [];
    for (var k in array) {
        if (array.hasOwnProperty(k)) {
            tmp.push({
                key: k, 
                value:  array[k]
            });
        }
    }

    tmp.sort(function(o1, o2) {
        return sortFunc(o1.key, o2.key);
    });   
    return tmp;      
}
    
function is_empty(obj) {
    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length && obj.length > 0)    return false;
    if (obj.length && obj.length === 0)  return true;

    for (var key in obj) {
        if (hasOwnProperty.call(obj, key))    return false;
    }
    return true;
}

function returnBaseUrl(){
    origin = window.location.origin;
    nameOfHtml=window.location.pathname.substring(window.location.pathname.lastIndexOf('/')+1);
    pathname = window.location.pathname.replace(nameOfHtml,"");
    return origin+pathname;
}


function cancelSelection () {
    pr("\tin cancelSelection");
    highlightSelectedNodes(false); //Unselect the selected ones :D
    opossites = [];
    selections = [];
    partialGraph.refresh();
    
    $("#names").html(""); 
    $("#opossiteNodes").html("");
    $("#information").html("");
    
    //Nodes colors go back to normal
    overNodes=false;
    var e = partialGraph._core.graph.edges;
    for(i=0;i<e.length;i++){
        e[i].color = e[i].attr['grey'] ? e[i].attr['true_color'] : e[i].color;
        e[i].attr['grey'] = 0;
    }
    partialGraph.draw(2,1,2);
                
    partialGraph.iterNodes(function(n){
        n.color = n.attr['grey'] ? n.attr['true_color'] : n.color;
        n.attr['grey'] = 0;
    }).draw(2,1,2);
    //Nodes colors go back to normal
    changeButton("unselectNodes");
    $("#searchinput").val("");
}

function highlightSelectedNodes(flag){  
    if(!is_empty(selections)){            
        fullurl = returnBaseUrl()+"img/trans/";                
        for(var i in selections) {
            if(Nodes[i].type=="Document" && document.getElementById("socio").src==fullurl+"active_scholars.png"){
                node = partialGraph._core.graph.nodesIndex[i];
                node.active = flag;
            }
            else if(Nodes[i].type=="NGram" && document.getElementById("semantic").src==fullurl+"active_tags.png") {
                node = partialGraph._core.graph.nodesIndex[i];
                node.active = flag;
            }
            else if(document.getElementById("sociosemantic").src==fullurl+"active_sociosem.png") {
                node = partialGraph._core.graph.nodesIndex[i];
                node.active = flag;
            }
            else break;        
        }
        
    }
}

function pushSWClick(arg){
    swclickPrev = swclickActual;
    swclickActual = arg;
//pr("1. swclickPrev: "+swclickPrev+" - swclickActual: "+swclickActual);
}

function selection(currentNode){
    pr("\tin selection");
    if(checkBox==false && cursor_size==0) {
        highlightSelectedNodes(false);
        opossites = [];
        selections = [];
        partialGraph.refresh();
    }    
    if(socsemFlag==false){
        if((typeof selections[currentNode.id])=="undefined"){
            selections[currentNode.id] = 1;
            if(Nodes[currentNode.id].type=="Document" && (typeof bipartiteD2N[currentNode.id])!="undefined"){
                for(i=0;i<bipartiteD2N[currentNode.id].neighbours.length;i++) {
                    if((typeof opossites[bipartiteD2N[currentNode.id].neighbours[i]])=="undefined"){
                        opossites[bipartiteD2N[currentNode.id].neighbours[i]]=1;
                    }
                    else {
                        opossites[bipartiteD2N[currentNode.id].neighbours[i]]++;
                    }
                }
            }  
            if(Nodes[currentNode.id].type=="NGram"){
                if((typeof bipartiteN2D[currentNode.id])!="undefined"){
                    for(i=0;i<bipartiteN2D[currentNode.id].neighbours.length;i++) {
                        if((typeof opossites[bipartiteN2D[currentNode.id].neighbours[i]])=="undefined"){
                            opossites[bipartiteN2D[currentNode.id].neighbours[i]]=1;
                        }
                        else opossites[bipartiteN2D[currentNode.id].neighbours[i]]++;
                
                    }
                }
            }
            currentNode.active=true; 
        }
        else {
            delete selections[currentNode.id];        
        
            if(Nodes[currentNode.id].type=="Document"){
                for(i=0;i<bipartiteD2N[currentNode.id].neighbours.length;i++) {
                    if((typeof opossites[bipartiteD2N[currentNode.id].neighbours[i]])=="undefined") {
                        console.log("lala");
                    }
                    if(opossites[bipartiteD2N[currentNode.id].neighbours[i]]==1){
                        delete opossites[bipartiteD2N[currentNode.id].neighbours[i]];
                    }
                    if(opossites[bipartiteD2N[currentNode.id].neighbours[i]]>1){
                        opossites[bipartiteD2N[currentNode.id].neighbours[i]]--;
                    }
                }
            }    
            if(Nodes[currentNode.id].type=="NGram"){
                for(i=0;i<bipartiteN2D[currentNode.id].neighbours.length;i++) {
                    if((typeof opossites[bipartiteN2D[currentNode.id].neighbours[i]])=="undefined") {
                        console.log("lala");
                    }
                    if(opossites[bipartiteN2D[currentNode.id].neighbours[i]]==1){
                        delete opossites[bipartiteN2D[currentNode.id].neighbours[i]];
                    }
                    if(opossites[bipartiteN2D[currentNode.id].neighbours[i]]>1){
                        opossites[bipartiteN2D[currentNode.id].neighbours[i]]--;
                    }
                }
            }
        
            currentNode.active=false;
        }
    }
    
    /* ============================================================================================== */
    
    else {
        if((typeof selections[currentNode.id])=="undefined"){
            selections[currentNode.id] = 1;
        
            if(Nodes[currentNode.id].type=="Document"){
                for(i=0;i<bipartiteD2N[currentNode.id].neighbours.length;i++) {
                    //opossitesbipartiteD2N[currentNode.id].neighbours[i]];
                    if((typeof opossites[bipartiteD2N[currentNode.id].neighbours[i].toString()])=="undefined"){
                        opossites[bipartiteD2N[currentNode.id].neighbours[i]]=1;
                    }
                    else {
                        opossites[bipartiteD2N[currentNode.id].neighbours[i]]++;
                    }
                }
            }    
            if(Nodes[currentNode.id].type=="NGram"){
                for(i=0;i<nodes2[currentNode.id].neighbours.length;i++) {
                    if((typeof opossites[nodes2[currentNode.id].neighbours[i]])=="undefined"){
                        opossites[nodes2[currentNode.id].neighbours[i]]=1;
                    }
                    else opossites[nodes2[currentNode.id].neighbours[i]]++;
                
                }
            }
        
            currentNode.active=true;
        }
        else {
            delete selections[currentNode.id];        
        
            if(Nodes[currentNode.id].type=="Document"){
                for(i=0;i<bipartiteD2N[currentNode.id].neighbours.length;i++) {
                    if((typeof opossites[bipartiteD2N[currentNode.id].neighbours[i]])=="undefined") {
                        console.log("lala");
                    }
                    if(opossites[bipartiteD2N[currentNode.id].neighbours[i]]==1){
                        delete opossites[bipartiteD2N[currentNode.id].neighbours[i]];
                    }
                    if(opossites[bipartiteD2N[currentNode.id].neighbours[i]]>1){
                        opossites[bipartiteD2N[currentNode.id].neighbours[i]]--;
                    }
                }
            }    
            if(Nodes[currentNode.id].type=="NGram"){
                for(i=0;i<nodes2[currentNode.id].neighbours.length;i++) {
                    if((typeof opossites[nodes2[currentNode.id].neighbours[i]])=="undefined") {
                        console.log("lala");
                    }
                    if(opossites[nodes2[currentNode.id].neighbours[i]]==1){
                        delete opossites[nodes2[currentNode.id].neighbours[i]];
                    }
                    if(opossites[nodes2[currentNode.id].neighbours[i]]>1){
                        opossites[nodes2[currentNode.id].neighbours[i]]--;
                    }
                }
            }
        
            currentNode.active=false;
        }
    }
    partialGraph.zoomTo(partialGraph._core.width / 2, partialGraph._core.height / 2, 0.8);
    partialGraph.refresh();
}

function getOpossitesNodes(node_id, entireNode) {
    pr("\tin getOpossitesNodes");
    var node;    
    if(entireNode==true) node=node_id;
    else node = partialGraph._core.graph.nodesIndex[node_id];
    if(socsemFlag==true) {
        cancelSelection();
        socsemFlag=false;
    }
    
    if (!node) return null;
    selection(node);
    
    if(Nodes[node.id].type=="Document"){
        flag=1;
    } else {
        flag=2;
    }
    
    opos = ArraySortByValue(opossites, function(a,b){
        return b-a
    });
//        console.log("WOLOLO WOLOLO WOLOLO WOLOLO");
//        $.ajax({
//            type: 'GET',
//            url: 'http://localhost/getJsonFromUrl/tagcloud.php',
//            data: "url="+JSON.stringify(opos),
//            //contentType: "application/json",
//            //dataType: 'json',
//            success : function(data){ 
//                console.log(data);
//            },
//            error: function(){ 
//                pr("Page Not found.");
//            }
//        });
}

function updateLeftPanel(){
    var names='';
    var opossitesNodes='';
    var information='';
    
    counter=0;
    names+='<div id="selectionsBox">';
    names += '<h4>';
    for(var i in selections){
        if(counter==4){
            names += '<h4>[...]</h4>';
            break;
        }
        names += Nodes[i].label+', ';
        counter++;
    }
    names += '</h4>';
    names=names.replace(", </h4>","</h4>");
    names=names.replace(", <h4>","<h4>");
    names+='</div>';
    js2='\');"';
    if(flag==1) {
        opossitesNodes+= '<br><h4>Keywords: </h4>';
        opossitesNodes+='<div id="opossitesBox">';
        js1='onclick="edgesTF=false;selections=[];opossites=[];graphNGrams(\'';
        for(var i in opos){
            if(i==22){
                opossitesNodes += '<li>[...]</li>';
                break;
            }
            //fontSize=(opos[i].value/maxFont)*(maxFont-minFont)+minFont;
            if(oposMAX==1){
                fontSize=desirableTagCloudFont_MIN;
            }
            else {
                fontSize=desirableTagCloudFont_MIN+(opos[i].value-1)*((desirableTagCloudFont_MAX-desirableTagCloudFont_MIN)/(oposMAX-1));
            }
            opossitesNodes += '<span style="font-size:'+fontSize+'px;cursor: pointer;" '
            +js1+opos[i].key+js2+'>' + nodes2[opos[i].key].label+ '</span><br>';

        }
        opossitesNodes += '</div>';
        
        information += '<br><h4>Information:</h4>';
        information += '<ul>';
            
        for(var i in selections){
            information += '<li><b>' + Nodes[i].label + '</b></li>';
            information += '<li>' + Nodes[i].attributes[3].val + '</li>';
            information += '</ul><br>';
        }
    }
    
    if(flag==2 && socsemFlag==false) {
        opossitesNodes+= '<br><h4>Scholars: </h4>';
        opossitesNodes+='<div id="opossitesBox">';
        js1='onclick="edgesTF=false;selections=[];opossites=[];graphDocs(\'';
        
        for(var i in opos){
            if(i==22){
                opossitesNodes += '<li>[...]</li>';
                break;
            }
            //fontSize=(opos[i].value/maxFont)*(maxFont-minFont)+minFont;
            if(oposMAX==1){
                fontSize=desirableTagCloudFont_MIN;
            }
            else {
                fontSize=desirableTagCloudFont_MIN+(opos[i].value-1)*((desirableTagCloudFont_MAX-desirableTagCloudFont_MIN)/(oposMAX-1));
            }
            opossitesNodes += '<span style="font-size:'+fontSize+'px; cursor: pointer;" '
            +js1+opos[i].key+js2+'>' + nodes1[opos[i].key].label+ '</span><br>';

        }
    }
    if(flag==2 && socsemFlag==true) {
        opossitesNodes += '<h4>Neighbours</h4><div style="margin: 5px 5px;">';
        opossitesNodes += 'en construcçao...aaaaaaaa ';
    }
    
    $("#names").html(names); //Information extracted, just added
    $("#opossiteNodes").html(opossitesNodes); //Information extracted, just added
    $("#information").html(information); //Information extracted, just added
        
    /***** The animation *****/
    _cG = $("#leftcolumn");
    _cG.animate({
        "left" : "0px"
    }, function() {
        $("#aUnfold").attr("class","leftarrow");
        $("#zonecentre").css({
            left: _cG.width() + "px"
        });
    });
}

function graphNGrams(node_id){   
    pr("\tin graphNGrams");/**/
    fullurl = returnBaseUrl()+"img/trans/";
    document.getElementById("viewType").src=fullurl+"status_meso_view.png";
    document.getElementById("socio").src=fullurl+"inactive_scholars.png";
    document.getElementById("semantic").src=fullurl+"active_tags.png";
    document.getElementById("sociosemantic").src=fullurl+"inactive_sociosem.png";
    document.getElementById("switch").src=fullurl+"graph_macro.png";
    
    
    console.log("in graphNGrams, nodae_id: "+node_id);
    if(node_id.charAt(0)=="N") {
        labels = [];
        partialGraph.emptyGraph(); 
        //partialGraph.stopForceAtlas2();
        
        partialGraph.addNode(node_id,Nodes[node_id]);

        for(i=0;i<nodes2[node_id].neighbours.length;i++) {
            partialGraph.addNode(nodes2[node_id].neighbours[i],Nodes[nodes2[node_id].neighbours[i]]);
        }  
        
        /* ALGORITMO ESTRELLA*/
        var existingNodes = partialGraph._core.graph.nodes;
        var edgesFound = [];
        for(i=0; i < existingNodes.length ; i++){
            if(existingNodes[i].id==node_id) i++;
            for(j=0; j < existingNodes.length ; j++){
                
                i1=existingNodes[i].id+";"+existingNodes[j].id;                    
                i2=existingNodes[j].id+";"+existingNodes[i].id;          
                      
                if((typeof Edges[i1])!="undefined" && (typeof Edges[i2])!="undefined"){
                    
                    if(Edges[i1].weight > Edges[i2].weight){
                        partialGraph.addEdge(i1,Edges[i1].sourceID,Edges[i1].targetID,Edges[i1]);
                    }
                    if(Edges[i1].weight < Edges[i2].weight){
                        partialGraph.addEdge(i2,Edges[i2].sourceID,Edges[i2].targetID,Edges[i2]);
                    }
                    if(Edges[i1].weight == Edges[i2].weight){
                        partialGraph.addEdge(i1,Edges[i1].sourceID,Edges[i1].targetID,Edges[i1]);
                    }
                }                
            }            
        } 
        var node = partialGraph._core.graph.nodesIndex[node_id];
        selection(node);
        partialGraph.startForceAtlas2();        
        updateEdgeFilter("semantic");
        updateNodeFilter("semantic");
        $("#category-A").hide();
        $("#category-B").show();
        changeButton("active_tags.png");
    }
}
        
function graphDocs(node_id){
    pr("\tin graphDocs, node_id: "+node_id);    
    
    fullurl = returnBaseUrl()+"img/trans/";
    document.getElementById("viewType").src=fullurl+"status_meso_view.png";
    document.getElementById("socio").src=fullurl+"active_scholars.png";
    document.getElementById("semantic").src=fullurl+"inactive_tags.png";
    document.getElementById("sociosemantic").src=fullurl+"inactive_sociosem.png";
    document.getElementById("switch").src=fullurl+"graph_macro.png";
    
    partialGraph.emptyGraph(); 
    //partialGraph.stopForceAtlas2();
    
    if(node_id.charAt(0)=="D") {
        labels = [];
        partialGraph.emptyGraph(); 
        
        partialGraph.addNode(node_id,Nodes[node_id]);
        for(i=0;i<nodes1[node_id].neighbours.length;i++) {
            partialGraph.addNode(nodes1[node_id].neighbours[i],Nodes[nodes1[node_id].neighbours[i]]);
        }  
        
        var existingNodes = partialGraph._core.graph.nodes;
        for(i=0; i < existingNodes.length ; i++){
            if(existingNodes[i].id==node_id) i++;
            for(j=0; j < existingNodes.length ; j++){
                
                i1=existingNodes[i].id+";"+existingNodes[j].id;                    
                i2=existingNodes[j].id+";"+existingNodes[i].id;                    
                      
                if((typeof Edges[i1])!="undefined" && (typeof Edges[i2])!="undefined"){
                    
                    if(Edges[i1].weight > Edges[i2].weight){
                        partialGraph.addEdge(i1,Edges[i1].sourceID,Edges[i1].targetID,Edges[i1]);
                    }
                    if(Edges[i1].weight < Edges[i2].weight){
                        partialGraph.addEdge(i2,Edges[i2].sourceID,Edges[i2].targetID,Edges[i2]);
                    }
                    if(Edges[i1].weight == Edges[i2].weight){
                        partialGraph.addEdge(i1,Edges[i1].sourceID,Edges[i1].targetID,Edges[i1]);
                    }
                }
            }
        }
        var node = partialGraph._core.graph.nodesIndex[node_id];
        selection(node);
        partialGraph.startForceAtlas2();        
        $("#category-A").show();
        $("#category-B").hide();
        updateEdgeFilter("social");        
        changeButton("active_scholars.png");
    }
}
       
function updateDownNodeEvent(selectionRadius){
    partialGraph.unbind("downnodes");
    partialGraph.unbind("overnodes");
    partialGraph.unbind("outnodes");
    hoverNodeEffectWhileFA2(selectionRadius);
}

function hoverNodeEffectWhileFA2(selectionRadius) {
    if(selectionRadius==false){
        //If cursor_size=0 -> Normal and single mouse-selection
        alertCheckBox(checkBox);
        partialGraph.bind('downnodes', function (event) {
            getOpossitesNodes(event.content, false);
            updateLeftPanel();
            /****            
                 *This give me the hoverNodes effect when the FA2 is running.
                ****/
            var greyColor = '#9b9e9e';/**/
            overNodes=true;
            var nodes = event.content;
            var neighbors = {};
            var e = partialGraph._core.graph.edges; 
            for(i=0;i<e.length;i++){
                if(nodes.indexOf(e[i].source.id)<0 && nodes.indexOf(e[i].target.id)<0){
                    if(!e[i].attr['grey']){
                        e[i].attr['true_color'] = e[i].color;
                        e[i].color = greyColor;
                        e[i].attr['grey'] = 1;
                    }
                }else{
                    e[i].color = e[i].attr['grey'] ? e[i].attr['true_color'] : e[i].color;
                    e[i].attr['grey'] = 0;

                    neighbors[e[i].source.id] = 1;
                    neighbors[e[i].target.id] = 1;
                }
            }
            
            partialGraph.iterNodes(function(n){
                if(!neighbors[n.id]){
                    if(!n.attr['grey']){
                        n.attr['true_color'] = n.color;
                        n.color = greyColor;
                        n.attr['grey'] = 1;
                    }
                }else{
                    n.color = n.attr['grey'] ? n.attr['true_color'] : n.color;
                    n.attr['grey'] = 0;
                }
            }).draw(2,1,2);
            
            if(is_empty(selections)){  
                cancelSelection();
            }
            else changeButton("selectNode");
        //overNodes=false;
        });
    }
    else {
        pr("selectionRadius?: "+selectionRadius);
        //If cursor_size>0 -> Multiple mouse-selection
        //Event: I've clicked the canvas (NOT A NODE) when I've a selection radius ON'
        partialGraph.bind('downnodes', function (event) {
            if(checkBox==false) cancelSelection();
            x1 = partialGraph._core.mousecaptor.mouseX;
            y1 = partialGraph._core.mousecaptor.mouseY;
            //dist1(centerClick,selectionRadius)
            partialGraph.iterNodes(function(n){
                distance = Math.sqrt(
                    Math.pow((x1-parseInt(n.displayX)),2) +
                    Math.pow((y1-parseInt(n.displayY)),2)
                    );
                if(parseInt(distance)<=cursor_size) {
                    getOpossitesNodes(n,true);
                }
            });
            updateLeftPanel();
            partialGraph.refresh();
            if(is_empty(selections)==true){  
                $("#names").html(""); //Information extracted, just added
                $("#opossiteNodes").html(""); //Information extracted, just added
                $("#information").html("");
                changeButton("unselectNodes");
            }
            else changeButton("selectNode");
        //overNodes=false;
        });
        
    }
}

function createEdgesForExistingNodes (typeOfNodes) {
    if(typeOfNodes=="Bipartite"){
        var existingNodes = partialGraph._core.graph.nodes;
        pr(existingNodes);
        var edgesFound = [];
        for(i=0; i < existingNodes.length ; i++){
            for(j=0; j < existingNodes.length ; j++){
                
                i1=existingNodes[i].id+";"+existingNodes[j].id;                    
                i2=existingNodes[j].id+";"+existingNodes[i].id;                    
                    
                indexS1 = existingNodes[i].id;
                indexT1 = existingNodes[j].id; 
                    
                indexS2 = existingNodes[j].id;  
                indexT2 = existingNodes[i].id;     

                if((typeof Edges[i1])!="undefined" && (typeof Edges[i2])!="undefined"){
                    if(Edges[i1].weight > Edges[i2].weight ){
                        partialGraph.addEdge(indexS1+";"+indexT1,Edges[i1].sourceID,Edges[i1].targetID,Edges[i1]);
                    }
                    if(Edges[i1].weight < Edges[i2].weight){
                        partialGraph.addEdge(indexS2+";"+indexT2,Edges[i2].sourceID,Edges[i2].targetID,Edges[i2]);
                    }
                    if(Edges[i1].weight == Edges[i2].weight){
                        if(Edges[i1].attributes[1].val!="bipartite") {     
                            if( (typeof partialGraph._core.graph.edgesIndex[indexS1+";"+indexT1])=="undefined" &&
                                (typeof partialGraph._core.graph.edgesIndex[indexT1+";"+indexS1])=="undefined" ){
                                partialGraph.addEdge(indexS1+";"+indexT1,Edges[i1].sourceID,Edges[i1].targetID,Edges[i1]);
                            }
                        }
                    }
                        
                        
                }
                else {
                    if((typeof Edges[i1])!="undefined" && Edges[i1].attributes[1].val=="bipartite"){
                        //I've found a source Node
                        partialGraph.addEdge(indexS1+";"+indexT1,Edges[i1].sourceID,Edges[i1].targetID,Edges[i1]);
                        
                    }
                    if((typeof Edges[i2])!="undefined" && Edges[i2].attributes[1].val=="bipartite"){
                        //I've found a target Node
                        partialGraph.addEdge(indexS2+";"+indexT2,Edges[i2].sourceID,Edges[i2].targetID,Edges[i2]);
                    }
                }
            }            
        }
    }
    else {     
        
        var Type;
        if(typeOfNodes=="Scholars") { 
            Type="D";
        }
        else Type="N"; //Keywords
        existingNodes = partialGraph._core.graph.nodes;
        for(i=0; i < existingNodes.length ; i++){
            for(j=(i+1); j < existingNodes.length ; j++){
                    
                i1=existingNodes[i].id+";"+existingNodes[j].id; 
                i2=existingNodes[j].id+";"+existingNodes[i].id; 
                
                if((typeof Edges[i1])!="undefined" && (typeof Edges[i2])!="undefined" && i1!=i2){
                        
                    if(Edges[i1].weight > Edges[i2].weight){
                        partialGraph.addEdge(i1,Edges[i1].sourceID,Edges[i1].targetID,Edges[i1]);
                    }
                    if(Edges[i1].weight < Edges[i2].weight){
                        partialGraph.addEdge(i2,Edges[i2].sourceID,Edges[i2].targetID,Edges[i2]);
                    }
                    if(Edges[i1].weight == Edges[i2].weight){
                        partialGraph.addEdge(i1,Edges[i1].sourceID,Edges[i1].targetID,Edges[i1]);
                    }
                }  
            }  
        }  
    }
}

function changeToMeso(iwannagraph) { 
    labels=[]
    pr("changing to Meso-"+iwannagraph);  
    fullurl = returnBaseUrl()+"img/trans/";   
    if(iwannagraph=="social") {
        if(!is_empty(selections)){
            partialGraph.emptyGraph();
            if(swclickPrev=="social") {
                for(var i in selections) {
                    partialGraph.addNode(i,Nodes[i]);
                    for(var j in nodes1[i].neighbours) { 
                        id=nodes1[i].neighbours[j];
                        partialGraph.addNode(id,Nodes[id]);
                    }
                }            
                createEdgesForExistingNodes("Scholars");/**/
            }
            if(swclickPrev=="semantic") {
                for(var i in selections) {
                    if(Nodes[i].type=="Document"){
                        graphDocs(i);
                    }
                    if(Nodes[i].type=="NGram"){
                        for(var j in opossites) {
                            partialGraph.addNode(j,Nodes[j]);                            
                        }
                        createEdgesForExistingNodes("Scholars");
                        break;
                    }
                }                
            }
            if(swclickPrev=="sociosemantic") {      
                for(var i in selections) {
                    if(Nodes[i].type=="Document"){
                        partialGraph.addNode(i,Nodes[i]);
                        for(var j in nodes1[i].neighbours) { 
                            id=nodes1[i].neighbours[j];
                            partialGraph.addNode(id,Nodes[id]);
                        }
                        createEdgesForExistingNodes("Scholars");
                    }
                    if(Nodes[i].type=="NGram"){
                        for(var j in opossites) {
                            partialGraph.addNode(j,Nodes[j]);                            
                        }
                        createEdgesForExistingNodes("Scholars");
                        break;
                    }
                }                
            }
            updateEdgeFilter(iwannagraph);
        }
    }
    if(iwannagraph=="sociosemantic") {
        if(!is_empty(selections) && !is_empty(opossites)){
            partialGraph.emptyGraph();
            for(var i in selections) {
                partialGraph.addNode(i,Nodes[i]);
            }
                
            for(var i in opossites) {
                partialGraph.addNode(i,Nodes[i]);
            }
                
            createEdgesForExistingNodes("Bipartite");
            
            partialGraph.startForceAtlas2();
            socsemFlag=true;
            updateBothEdgeFilters();
            updateBothNodeFilters();
        }
    }
     
    if(iwannagraph=="semantic") {
        if(!is_empty(opossites)){
            partialGraph.emptyGraph();
            //pr("2. swclickPrev: "+swclickPrev+" - swclickActual: "+swclickActual);
            if(swclickPrev=="semantic") {
                for(var i in selections) {
                    graphNGrams(i);
                }
                createEdgesForExistingNodes("Keywords");
            }
            if(swclickPrev=="social") {
                for(var i in selections) {
                    if(Nodes[i].type=="NGram"){
                        graphNGrams(i);
                    }
                    if(Nodes[i].type=="Document"){
                        for(var j in opossites) {
                            partialGraph.addNode(j,Nodes[j]);                            
                        }
                        createEdgesForExistingNodes("Keywords");
                        break;
                    }
                } 
            }
            if(swclickPrev=="sociosemantic") {                     
                for(var i in selections) {
                    if(Nodes[i].type=="Document"){                        
                        for(var j in opossites) {
                            partialGraph.addNode(j,Nodes[j]);                            
                        }
                        createEdgesForExistingNodes("Keywords");
                        break;
                    }
                    if(Nodes[i].type=="NGram"){                        
                        partialGraph.addNode(i,Nodes[i]);
                        for(var j in nodes2[i].neighbours) { 
                            id=nodes2[i].neighbours[j];
                            partialGraph.addNode(id,Nodes[id]);
                        }
                        createEdgesForExistingNodes("Keywords");
                    }
                }                
            }
            updateEdgeFilter(iwannagraph);  
            updateNodeFilter("semantic");
        }
    }
    highlightSelectedNodes(true); 
    partialGraph.draw();
    partialGraph.zoomTo(partialGraph._core.width / 2, partialGraph._core.height / 2, 0.8);
    partialGraph.refresh();
    partialGraph.startForceAtlas2();
}

function changeToMacro(iwannagraph) { 
    labels=[]
    pr("changing to Macro-"+iwannagraph);
    fullurl = returnBaseUrl()+"img/trans/";
    if(iwannagraph=="semantic") {
        partialGraph.emptyGraph();
        for(var n in Nodes) {                
            if(Nodes[n].type=="NGram"){
                partialGraph.addNode(n,Nodes[n]);
            }                
        }  
        createEdgesForExistingNodes("Keywords");
//        for(var n in selections){
//            if(Nodes[n].type=="Document")
//                highlightOpossites(opossites);
//            break;
//        }
        updateEdgeFilter(iwannagraph);
        updateNodeFilter("semantic");
    }
    if(iwannagraph=="social") {
        partialGraph.emptyGraph();
        for(var n in Nodes) {                
            if(Nodes[n].type=="Document"){
                partialGraph.addNode(n,Nodes[n]);
            }                
        }
        createEdgesForExistingNodes("Scholars");
//        for(var n in selections){
//            if(Nodes[n].type=="NGram")
//                highlightOpossites(opossites);
//            break;
//        }
        updateEdgeFilter(iwannagraph);
    }
    
    if(iwannagraph=="sociosemantic") {
        partialGraph.emptyGraph();
        for(var n in Nodes) {  
            partialGraph.addNode(n,Nodes[n]);          
        }
        
        for(var e in Edges) {  
            if(Edges[e].label=="nodes1" || Edges[e].label=="nodes2"){
                st=e.split(";");
                index = partialGraph._core.graph.edgesIndex;
                if(typeof(index[st[0]+";"+st[1]])=="undefined" &&
                    typeof(index[st[1]+";"+st[0]])=="undefined"
                    ){
                    if(Edges[st[0]+";"+st[1]].weight == Edges[st[1]+";"+st[0]].weight){
                        partialGraph.addEdge(
                            st[0]+";"+st[1],
                            Edges[st[0]+";"+st[1]].sourceID,
                            Edges[st[0]+";"+st[1]].targetID,
                            Edges[st[0]+";"+st[1]]);
                    }
                    else {
                        if(Edges[st[0]+";"+st[1]].weight > Edges[st[1]+";"+st[0]].weight){
                            partialGraph.addEdge(
                                st[0]+";"+st[1],
                                Edges[st[0]+";"+st[1]].sourceID,
                                Edges[st[0]+";"+st[1]].targetID,
                                Edges[st[0]+";"+st[1]]);
                        }
                        else {
                            partialGraph.addEdge(
                                st[1]+";"+st[0],
                                Edges[st[1]+";"+st[0]].sourceID,
                                Edges[st[1]+";"+st[0]].targetID,
                                Edges[st[1]+";"+st[0]]);                                  
                        }
                    }
                }                
            }
            if(Edges[e].label=="bipartite"){
                partialGraph.addEdge(e,Edges[e].sourceID,Edges[e].targetID,Edges[e]);
            }
        }
        updateBothEdgeFilters();
        updateBothNodeFilters();
    }
    highlightSelectedNodes(true);
    //partialGraph.stopForceAtlas2();
    partialGraph.draw();
    partialGraph.zoomTo(partialGraph._core.width / 2, partialGraph._core.height / 2, 0.8);
    partialGraph.refresh();
    partialGraph.startForceAtlas2();
}

function highlightOpossites (list){/*tofix*/
    for(var n in list){
        partialGraph._core.graph.nodesIndex[n].forceLabel=true;
    }
}

function setPanels(){
    
    $("#loading").remove();
    
    $("#aUnfold").click(function() {
        pr("heeere");
        var _cG = $("#leftcolumn");
        if (_cG.offset().left < 0) {
            _cG.animate({
                "left" : "0px"
            }, function() {
                $("#aUnfold").attr("class","leftarrow");
                $("#zonecentre").css({
                    left: _cG.width() + "px"
                });
            }); 
        } else {
            _cG.animate({
                "left" : "-" + _cG.width() + "px"
            }, function() {
                $("#aUnfold").attr("class","rightarrow");
                $("#zonecentre").css({
                    left: "0"
                });
            });
        }
        return false;
    });
    
        
    
    /******************* /SEARCH ***********************/
    $.ui.autocomplete.prototype._renderItem = function(ul, item) {
        //var searchVal = $("#searchinput").val();
        //var desc = extractContext(item.desc, searchVal);
        return $('<li onclick=\'var s = "'+item.label+'"; search(s);$("#searchinput").val(strSearchBar);\'></li>')
        //.data('item.autocomplete', item)
        .append("<a><span class=\"labelresult\">" + item.label + "</span></a>" )
        .appendTo(ul);
    };

    $('input#searchinput').autocomplete({
        source: function(request, response) {
            matches = [];
            var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");
            var results = $.grep(labels, function(e) {
                return matcher.test(e.label);
            });
            
            if (!results.length) {
                $("#noresults").text("Pas de résultats");
            } else {
                $("#noresults").empty();
            }
            matches = results.slice(0, maxSearchResults);
            response(matches);
            
        },
        minLength: minLengthAutoComplete
    }); 
   
    $('#searchinput').bind('autocompleteopen', function(event, ui) {
        $(this).data('is_open',true);
    });
    $('#searchinput').bind('autocompleteclose', function(event, ui) {
        $(this).data('is_open',false);
    });
    $("#searchinput").focus(function () {
        if ($(this).val() == strSearchBar) {
            $(this).val('');
        }
    });
    $("#searchinput").blur(function () {
        if ($(this).val() == '') {
            $(this).val(strSearchBar);
        }
    });
    $("#searchinput").keyup(function (e) {
        if (e.keyCode == 13 && $("input#searchinput").data('is_open') !== true) {
            var s = $("#searchinput").val();
            search(s);
            $("#searchinput").val(strSearchBar);
        }         
    });
    
    
    $("#searchinput").keydown(function (e) {
        if (e.keyCode == 13 && $("input#searchinput").data('is_open') === true) {            
            if(!is_empty(matches)) {
                for(j=0;j<matches.length;j++){
                    search(matches[j].label);
                }
            }
        }
    });
    
    $("#searchsubmit").click(function () {
        var s = $("#searchinput").val();
        search(s);
        $("#searchinput").val(strSearchBar);
    });
    /******************* /SEARCH ***********************/

    
    $("#lensButton").click(function () {
        partialGraph.position(0,0,1);
        partialGraph.zoomTo(partialGraph._core.width / 2, partialGraph._core.height / 2, 0.8);
        partialGraph.refresh();
        partialGraph.startForceAtlas2();
    });
    
    $('#sigma-example').dblclick(function(event) {
        
        cancelSelection();    
        /***** The animation *****/
        _cG = $("#leftcolumn");    
        _cG.animate({
            "left" : "-" + _cG.width() + "px"
        }, function() {
            $("#aUnfold").attr("class","rightarrow");
            $("#zonecentre").css({
                left: "0"
            });
        });
        /***** The animation *****/
    });
    
    $("#overview")
    //    .mousemove(onOverviewMove)
    //    .mousedown(startMove)
    //    .mouseup(endMove)
    //    .mouseout(endMove)
    .mousewheel(onGraphScroll);
    
    $("sigma-example")
    //    .mousemove(onOverviewMove)
    //    .mousedown(startMove)
    //    .mouseup(endMove)
    //    .mouseout(endMove)
    //    .mousewheel(onGraphScroll); -> it doesn't answer!
    
    //    $("#cancelselection").click(function (){
    //        pr("heeeeree");
    //        cancelSelection();
    //    });
    
    $("#zoomPlusButton").click(function () {
        partialGraph.zoomTo(partialGraph._core.width / 2, partialGraph._core.height / 2, partialGraph._core.mousecaptor.ratio * 1.5);
        $("#zoomSlider").slider("value",partialGraph.position().ratio);
        return false;
    });
    $("#zoomMinusButton").click(function () {
        partialGraph.zoomTo(partialGraph._core.width / 2, partialGraph._core.height / 2, partialGraph._core.mousecaptor.ratio * 0.5);
        $("#zoomSlider").slider("value",partialGraph.position().ratio);
        return false;
    });
    
    $("#edgesButton").click(function () {
        if(edgesTF==false){
            partialGraph.stopForceAtlas2();
            partialGraph.draw();
            edgesTF=true;
        }
        else {
            partialGraph.startForceAtlas2();
            edgesTF=false;
        }
    });
   
    $("#sliderANodeSize").slider({
        value: 1,
        min: 1,
        max: 25,
        animate: true,
        slide: function(event, ui) {
            $.doTimeout(300,function (){
                partialGraph.iterNodes(function (n) {
                    if(n.id.charAt(0)=="D") {
                        n.size = parseFloat(Nodes[n.id].size) + parseFloat((ui.value-1))*0.3;
                    }
                });
                partialGraph.draw();
            });
        }
    });
    $("#sliderBNodeSize").slider({
        value: 1,
        min: 1,
        max: 25,
        animate: true,
        slide: function(event, ui) {
            $.doTimeout(300,function (){
                partialGraph.iterNodes(function (n) {
                    if(n.id.charAt(0)=="N") {
                        n.size = parseFloat(Nodes[n.id].size) + parseFloat((ui.value-1))*0.3;
                    }
                });
                partialGraph.draw();
            });
        }
    });
    $("#sliderSelectionZone").slider({
        value: cursor_size * 5.0,
        min: 0.0,
        max: 150.0,
        animate: true,
        change: function(event, ui) {
            cursor_size= ui.value;
            if(cursor_size==0) updateDownNodeEvent(false);
            else updateDownNodeEvent(true); 
        //return callSlider("#sliderSelectionZone", "selectionRadius");
        }
    });
}

function startEnviroment(){
    $('#sigma-example').css('background-color','white');
    $("#category-B").hide();
    $("#labelchange").hide();
    $("#availableView").hide();  
    /*======= Show some labels at the beginning =======*/
    minIn=50,
    maxIn=0,
    minOut=50,
    maxOut=0;        
    partialGraph.iterNodes(function(n){
        if(parseInt(n.inDegree) < minIn) minIn= n.inDegree;
        if(parseInt(n.inDegree) > maxIn) maxIn= n.inDegree;
        if(parseInt(n.outDegree) < minOut) minOut= n.outDegree;
        if(parseInt(n.outDegree) > maxOut) maxOut= n.outDegree;
    });
    partialGraph.iterNodes(function(n){
        if(n.inDegree==minIn) n.forceLabel=true;
        if(n.inDegree==maxIn) n.forceLabel=true;
        if(n.outDegree==minOut) n.forceLabel=true;
        if(n.outDegree==maxOut) n.forceLabel=true;
    });
    /*======= Show some labels at the beginning =======*/
    initializeMap();
    updateMap();
    
    updateDownNodeEvent(false);        
    
    /* Initial Effect (Add: unchecked) HIDE */
    partialGraph.bind('overnodes',function(event){ 
        var nodes = event.content;
        var neighbors = {};
        var nrEdges = 0;
        var e = partialGraph._core.graph.edges;
        for(i=0;i<e.length;i++){
            if(nodes.indexOf(e[i].source.id)>=0 || nodes.indexOf(e[i].target.id)>=0){
                neighbors[e[i].source.id] = 1;
                neighbors[e[i].target.id] = 1;
                nrEdges++;//github.com/jacomyal/sigma.js/issues/62
            }
        }
        //partialGraph.draw(2,1,2);
        partialGraph.iterNodes(function(n){
            if(nrEdges>0) {
                if(!neighbors[n.id]){
                    n.hidden = 1;
                }else{
                    n.hidden = 0;
                }
            }
        }).draw(2,1,2);
    });
  
    partialGraph.bind('outnodes',function(){
        var e = partialGraph._core.graph.edges;
        for(i=0;i<e.length;i++){
            e[i].hidden = 0;
        }
        partialGraph.draw(2,1,2);
            
        partialGraph.iterNodes(function(n){
            n.hidden = 0;
        }).draw(2,1,2);
    });
    /* Initial Effect (Add: unchecked) HIDE */
    setPanels();
}

