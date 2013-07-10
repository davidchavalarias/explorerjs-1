
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

function parse(gexfPath) {
    var gexfhttp;
    gexfhttp = window.XMLHttpRequest ?
    new XMLHttpRequest() :
    new ActiveXObject('Microsoft.XMLHTTP');
    if(getUrlParam.nodeidparam.indexOf("__")===-1){
        gexfPath = "php/getgraph.php?query="+getUrlParam.nodeidparam;
    }
    else {
        gexfPath = "php/get_scholar_graph.php?login="+getUrlParam.nodeidparam+"*"+iterationsTinaForce;
    }
    
    gexfhttp.open('GET', gexfPath, false);
    gexfhttp.send();
    gexf = gexfhttp.responseXML;
}

function fullExtract(){
    var i, j, k;
    partialGraph.emptyGraph();
    // Parse Attributes
    // This is confusing, so I'll comment heavily
    var nodesAttributes = [];   // The list of attributes of the nodes of the graph that we build in json
    var edgesAttributes = [];   // The list of attributes of the edges of the graph that we build in json
    var attributesNodes = gexf.getElementsByTagName('attributes');  // In the gexf (that is an xml), the list of xml nodes 'attributes' (note the plural 's')
  
    for(i = 0; i<attributesNodes.length; i++){
        var attributesNode = attributesNodes[i];  // attributesNode is each xml node 'attributes' (plural)
        if(attributesNode.getAttribute('class') == 'node'){
            var attributeNodes = attributesNode.getElementsByTagName('attribute');  // The list of xml nodes 'attribute' (no 's')
            for(j = 0; j<attributeNodes.length; j++){
                var attributeNode = attributeNodes[j];  // Each xml node 'attribute'
        
                var id = attributeNode.getAttribute('id'),
                title = attributeNode.getAttribute('title'),
                type = attributeNode.getAttribute('type');
        
                var attribute = {
                    id:id, 
                    title:title, 
                    type:type
                };
                nodesAttributes.push(attribute);
        
            }
        } else if(attributesNode.getAttribute('class') == 'edge'){
            var attributeNodes = attributesNode.getElementsByTagName('attribute');  // The list of xml nodes 'attribute' (no 's')
            for(j = 0; j<attributeNodes.length; j++){
                var attributeNode = attributeNodes[j];  // Each xml node 'attribute'
        
                var id = attributeNode.getAttribute('id'),
                title = attributeNode.getAttribute('title'),
                type = attributeNode.getAttribute('type');
          
                var attribute = {
                    id:id, 
                    title:title, 
                    type:type
                };
                edgesAttributes.push(attribute);
        
            }
        }
    }
  
    var nodesNodes = gexf.getElementsByTagName('nodes') // The list of xml nodes 'nodes' (plural)
  
    labels = [];
    numberOfDocs=0;
    numberOfNGrams=0;
    for(i=0; i<nodesNodes.length; i++){
        var nodesNode = nodesNodes[i];  // Each xml node 'nodes' (plural)
        var nodeNodes = nodesNode.getElementsByTagName('node'); // The list of xml nodes 'node' (no 's')

        for(j=0; j<nodeNodes.length; j++){
            var nodeNode = nodeNodes[j];  // Each xml node 'node' (no 's')
      
      
            window.NODE = nodeNode;

            var id = nodeNode.getAttribute('id');
            var label = nodeNode.getAttribute('label') || id;
      
      
            //viz
            var size = 1;
            var x = 100 - 200*Math.random();
            var y = 100 - 200*Math.random();
            var color;
      
            var positionNodes = nodeNode.getElementsByTagName('position');
            positionNodes = positionNodes.length ? 
            positionNodes : 
            nodeNode.getElementsByTagNameNS('*','position');
            if(positionNodes.length>0){
                var positionNode = positionNodes[0];
                x = parseFloat(positionNode.getAttribute('x'));
                y = parseFloat(positionNode.getAttribute('y'));
            }

            var colorNodes = nodeNode.getElementsByTagName('color');
            colorNodes = colorNodes.length ? 
            colorNodes : 
            nodeNode.getElementsByTagNameNS('*','color');
            if(colorNodes.length>0){
                colorNode = colorNodes[0];
                color = '#'+sigma.tools.rgbToHex(parseFloat(colorNode.getAttribute('r')),
                    parseFloat(colorNode.getAttribute('g')),
                    parseFloat(colorNode.getAttribute('b')));
            }
            var node = ({
                id:id,
                label:label, 
                size:size, 
                x:x, 
                y:y, 
                type:"",
                attributes:[], 
                color:color
            });  // The graph node
                
            // Attribute values
            var attvalueNodes = nodeNode.getElementsByTagName('attvalue');
            for(k=0; k<attvalueNodes.length; k++){
                var attvalueNode = attvalueNodes[k];
                var attr = attvalueNode.getAttribute('for');
                var val = attvalueNode.getAttribute('value');
                node.attributes.push({
                    attr:attr, 
                    val:val
                });
                /*      Para asignar tamaño a los NGrams    */
                if(attr==4) {
                    //if(val<30) val=30;
                    //Nodes[id].size=(parseInt(val).toFixed(2)*5)/70;
                    node.size=parseInt(val).toFixed(2);
                    if(id.charAt(0)=="D") {
                        node.size = ""+desirableScholarSize;
                    }
                    
                }
            /*      Para asignar tamaño a los NGrams    */
            }
                
            if(node.attributes[0].val=="Document"){
                node.type="Document";
                numberOfDocs++;
                node.size=desirableScholarSize;
                partialGraph.addNode(id,node);
            }
            else {
                node.type="NGram";
                numberOfNGrams++;
                if(parseInt(node.size) < parseInt(minNodeSize)) minNodeSize= node.size;
                if(parseInt(node.size) > parseInt(maxNodeSize)) maxNodeSize= node.size;
                
            }
            Nodes[id] = node;
            //if(Nodes[id].type=="NGram")pr(Nodes[id].size);
        }
    }  
    //constantNGramFilter= ((parseInt(maxNodeSize)*(5-2+0.1))/(5))*0.001;
    //New scale for node size: now, between 2 and 5 instead [1,70]
    for(var it in Nodes){
        if(Nodes[it].type=="NGram") {
            normalizedSize=desirableNodeSizeMIN+(Nodes[it].size-1)*((desirableNodeSizeMAX-desirableNodeSizeMIN)/(parseInt(maxNodeSize)-parseInt(minNodeSize)));
            Nodes[it].size = ""+normalizedSize;
        }
        
    }
    var edgeId = 0;
    var edgesNodes = gexf.getElementsByTagName('edges');
    for(i=0; i<edgesNodes.length; i++){
        var edgesNode = edgesNodes[i];
        var edgeNodes = edgesNode.getElementsByTagName('edge');
        for(j=0; j<edgeNodes.length; j++){
            var edgeNode = edgeNodes[j];
            var source = edgeNode.getAttribute('source');
            var target = edgeNode.getAttribute('target');
            var indice=source.charAt(0)+source.substring(3,source.length)+";"+target.charAt(0)+target.substring(3,target.length);
            //console.log(indice);
            Edges[indice] = {
                id:         indice,
                sourceID:   source,
                targetID:   target,
                label:      "",
                weight: 1,
                attributes: []
            };
                
            var edge = {
                id:         j,
                sourceID:   source,
                targetID:   target,
                label:      "",
                weight: 1,
                attributes: []
            };

            var weight = edgeNode.getAttribute('weight');
            if(weight!=undefined){
                Edges[indice]['weight'] = weight;
            }
            var kind;
            var attvalueNodes = edgeNode.getElementsByTagName('attvalue');
            for(k=0; k<attvalueNodes.length; k++){
                var attvalueNode = attvalueNodes[k];
                var attr = attvalueNode.getAttribute('for');
                var val = attvalueNode.getAttribute('value');
                if(k==1) {
                    kind=val;
                    edge.label=val;
                    Edges[indice].label=val;
                }
                if(k==0) {
                    Edges[indice].weight = val;
                    edge.weight = val;
                    if(edge.weight < minEdgeWeight) minEdgeWeight= edge.weight;
                    if(edge.weight > maxEdgeWeight) maxEdgeWeight= edge.weight;
                }
                Edges[indice].attributes.push({
                    attr:attr, 
                    val:val
                });
                edge.attributes.push({
                    attr:attr, 
                    val:val
                });
            }   
            
            
            if(edge.attributes[1].val=="nodes1"){
                if((typeof nodes1[source])=="undefined"){
                    nodes1[source] = {
                        label: Nodes[source].label,
                        neighbours: []
                    };
                    nodes1[source].neighbours.push(target);
                }
                else nodes1[source].neighbours.push(target);
            }
            
            
            if(edge.attributes[1].val=="nodes2"){
                if((typeof nodes2[source])=="undefined"){
                    nodes2[source] = {
                        label: Nodes[source].label,
                        neighbours: []
                    };
                    nodes2[source].neighbours.push(target);
                }
                else nodes2[source].neighbours.push(target);
            }
            
            
            if(edge.attributes[1].val=="bipartite"){
                /* Document to NGram */
                if((typeof bipartiteD2N[source])=="undefined"){
                    bipartiteD2N[source] = {
                        label: Nodes[source].label,
                        neighbours: []
                    };
                    bipartiteD2N[source].neighbours.push(target);
                }
                else bipartiteD2N[source].neighbours.push(target);
                
                /* NGram to Document */
                if((typeof bipartiteN2D[target])=="undefined"){
                    bipartiteN2D[target] = {
                        label: Nodes[target].label,
                        neighbours: []
                    };
                    bipartiteN2D[target].neighbours.push(source);
                }
                else bipartiteN2D[target].neighbours.push(source);
            }
            if(edge.attributes[1].val=="nodes1"){  
                indexS = source.charAt(0)+source.substring(3,source.length);
                indexT = target.charAt(0)+target.substring(3,target.length);                
                if( (typeof partialGraph._core.graph.edgesIndex[indexT+";"+indexS])=="undefined" ){
                    partialGraph.addEdge(indice,source,target,edge);
                }
            }                
        }
    }
}
    

