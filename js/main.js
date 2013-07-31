

$(document).ready(function () {
    partialGraph = sigma.init(document.getElementById('sigma-example'))
    .drawingProperties(sigmaJsDrawingProperties)
    .graphProperties(sigmaJsGraphProperties)
    .mouseProperties(sigmaJsMouseProperties);
    partialGraph.type="social";
    
    startMiniMap();
    
    console.log("parsing...");        
    parse("");
    fullExtract(); 
    updateEdgeFilter("social");
    updateNodeFilter("social");
    pushSWClick("social");
    cancelSelection(false);
    console.log("Parsing complete.");      
    partialGraph.zoomTo(partialGraph._core.width / 2, partialGraph._core.height / 2, 0.8).draw();
    partialGraph.startForceAtlas2();   
    
    startEnviroment(); 
    
    targeted = partialGraph._core.graph.edges.filter(function(n) {
                return !n['hidden'];
            }).map(function(n) {
                return n;
            });
            
    
});
