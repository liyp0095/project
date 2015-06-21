/**
 * Created by liyp on 5/26/2015.
 */
var force;

$(document).ready(function(){
    force = new SVGClass();
});

function SVGClass() {

    var Astatus = 1;
    var nodeclicked = null;
    var color = d3.scale.category10();
    var linear = d3.scale.linear();
    var colortransformer = d3.interpolate(d3.rgb("#86B9E0"),d3.rgb("#86B9E0"));
    var zoom = d3.behavior.zoom().scaleExtent([0.2,5]);

    var data,
        graphData,
        degreeCentrality,
        eigenvectorCentrality,
        katzCentrality,
        betweennessCentrality,
        closenessCentrality,
        groupCentrality,
        PangRank,
        regularEquvialence,
        clusterCoefficient;

    var layout, visWindow, graph, links, nodes, circle, text, 
        text_shadow, drag;

    var linkedByIndex = {};
    var nodeRegularEquivalenceByIndex;

    var graphWidth,
        graphHeight = 800;

    d3.select(window).on("resize", resize);

    function resize(){
        graphWidth = window.innerWidth*0.70;
        graphHeight = window.innerHeight*0.84;
        graph.attr("width", graphWidth).attr("height", graphHeight);

        graphData.nodes.forEach(function(d){ d.fixed = false});
        layout.size([graphWidth, graphHeight])
            .resume();
    }

    function highLight(d){

        switch (Astatus) {
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                if (d != nodeclicked) {

                    circle
                        .transition(500)
                        .attr("r", node_radius);

                    nodes
                        .transition(500)
                        .style("opacity", function (o) {
                            return isConnected(o, d) ? 1.0 : 0.5;
                        })
                        .style("fill", function (o) {
                            if (isConnectedAsTarget(o, d) && isConnectedAsSource(o, d)) {
                                fillcolor = 'green';
                            } else if (isConnectedAsSource(o, d)) {
                                fillcolor = 'red';
                            } else if (isConnectedAsTarget(o, d)) {
                                fillcolor = 'blue';
                            } else if (isEqual(o, d)) {
                                fillcolor = "hotpink";
                            } else {
                                fillcolor = '#ccc';
                            }
                            return fillcolor;
                        });

                    links
                        .transition(500)
                        .style("opacity", function (o) {
                            return o.source === d || o.target === d ? 1 : 0.05;
                        })
                        .transition(500)
                        .attr("marker-end", function (o) {
                            return o.source === d || o.target === d ? "url(#arrow)" : "url()";
                        });

                    text.attr("fill", null);

                    nodeclicked = d;

                }
                else {

                    text.attr("fill", "#555");

                    nodes
                        .transition(500)
                        .style("fill", node_colors)
                        .style("opacity", 1);

                    links
                        .transition(500)
                        .style("opacity", 0.2)
                        .attr("marker-end", "url(#arrow)");

                    nodeclicked = null;
                }
                break;
            case 9:
            case 10:
            default :
        }     
    }

    function onNodeClick(d){

        highLight(d);
    }

    function onNodeDblClick(d){
        d.fixed = false;
    }

    function mouseOutFunction() {
        var thecircle = d3.select(this);

        thecircle
            .transition(500)
            .attr("r", node_radius);
    };

    function node_radius(d) {
        switch (Astatus) {
            case 1:
                return Math.sqrt(60*linear(degreeCentrality[parseInt(d.id)-1])) + 2;//*Math.pow(40.0 * 5, 1/3);
                break;
            case 2:
                return Math.sqrt(60*linear(eigenvectorCentrality[parseInt(d.id)-1])) + 2;
                break;
            case 3:
                return Math.sqrt(60*linear(katzCentrality[parseInt(d.id)-1])) + 2;
                break;
            case 4:
                return Math.sqrt(60*linear(betweennessCentrality[parseInt(d.id)-1])) + 2;
                break;
            case 5:
                return Math.sqrt(60*linear(closenessCentrality[parseInt(d.id)-1])) + 2;
                break;
            case 6:////////////////////////////////////////////////////////////////////////////////
                return Math.sqrt(60*linear(PangRank[parseInt(d.id)-1])) + 2;
                break;
            case 7:
                return Math.sqrt(60*linear(PangRank[parseInt(d.id)-1])) + 2;
                break;
            case 8:
                return 8;
                break;
            case 9:
                return 8;
                break;
            case 10:
                return 8;
                break;
            default :
                return 6;
        }
    }

    function node_colors(d) {
        switch (Astatus) {
            case 1:
                return colortransformer(degreeCentrality[d.id-1]);/*Math.pow(40.0 * 5, 1/3);*/
                break;
            case 2:
                return colortransformer(eigenvectorCentrality[d.id-1]);
                break;
            case 3:
                return colortransformer(katzCentrality[d.id-1]);
                break;
            case 4:
                return colortransformer(betweennessCentrality[d.id-1]);
                break;
            case 5:
                return colortransformer(closenessCentrality[d.id-1]);
                break;
            case 6://///////////////////////////////////////////////////////////////////
                return colortransformer(PangRank[d.id-1]);
                break;
            case 7:
                return colortransformer(PangRank[d.id-1]);
                break;
            case 8:
                return "rgb(26,93,159)";
                break;
            case 9:
                return "rgb(26,93,159)";
                break;
            case 10:
                return "rgb(26,93,159)";
                break;
            default :
                return "#ccc";
        }
    }

    function node_charge(d){
        return ((degreeCentrality[parseInt(d.id)-1]))*(-100);
    }

    function link_distance(l){
        return (((degreeCentrality[parseInt(l.source.id)-1]+degreeCentrality[parseInt(l.target.id)-1])/2)+0.8)*200;
    }

    function rescale() {

        graph.attr("transform",
                "translate(" + zoom.translate() + ")"
                + " scale(" + zoom.scale() + ")");
    }

    function getInfo(d){
        var gender,
            academy,
            interset;
        if(d.gender == 0) gender = "男";
        else gender = "女";
        if(d.age == 0) academy = "电子学院";
        else academy = "计算机学院";
        if(d.interset == 0) interset = "运动型";
        else interset = "文艺型";

        return "学号："+(d.id)+"\n"+
                "性别："+(d.gender==0?"男":"女")+"\n"+
                "年龄："+d.academy+"\n"+
                "学院："+d.age+"\n"+
                "兴趣："+d.interset;
    }

    function isConnected(a, b) {
        return isConnectedAsTarget(a, b) || isConnectedAsSource(a, b) || a.index == b.index;
    }

    function isConnectedAsSource(a, b) {
        return linkedByIndex[a.index + "," + b.index];
    }

    function isConnectedAsTarget(a, b) {
        return linkedByIndex[b.index + "," + a.index];
    }

    function isEqual(a, b) {
        return a.index == b.index;
    }

    function isRegularEquivalent(a, b, equ){
        if( equ < 0 || equ > 1) return false;
        if(regularEquivalence[a.id-1][b.id-1] < equ) return false;
        else return true;
    }

    function isMostRegularEquivalent(a, b){
        var result = false;
        nodeRegularEquivalenceByIndex[a.index].forEach(function(d){
            if(d.maxNodeIndex == b.index)
                result = true;
        });
        return result;
    }

    function update(){

        //更新线性映射表
        switch (Astatus) {
            case 1:
                linear.domain([d3.min(degreeCentrality),d3.max(degreeCentrality)]).range([0,1]);
                break;
            case 2:
                linear.domain([d3.min(eigenvectorCentrality),d3.max(eigenvectorCentrality)]).range([0,1]);
                break;
            case 3:
                linear.domain([d3.min(katzCentrality),d3.max(katzCentrality)]).range([0,1]);
                break;
            case 4:
                linear.domain([d3.min(betweennessCentrality),d3.max(betweennessCentrality)]).range([0,1]);
                break;
            case 5:
                linear.domain([d3.min(closenessCentrality),d3.max(closenessCentrality)]).range([0,1]);
                break;
            case 6://///////////////////////////////////////////////////////////////////
                linear.domain([d3.min(PangRank),d3.max(PangRank)]).range([0,1]);
                break;
            case 7:
                linear.domain([d3.min(degreeCentrality),d3.max(degreeCentrality)]).range([0,1]);
                break;
            case 8:
                return "rgb(26,93,159)";
                break;
            case 9:
                return "rgb(26,93,159)";
                break;
            case 10:
                return "rgb(26,93,159)";
                break;
            default :
                return "#ccc";
        }

        if(nodeclicked == null){
            nodes
                .transition(500)
                .style("fill", node_colors)
                .style("opacity", 1);

            links
                .transition(500)
                .style("stroke-opacity", 1)
                .attr("marker-end", "url(#arrow)");
        }

        circle
            .transition(500)
            .attr("r", node_radius);
    }

    this.getData = function(d){

        console.log(d);

        data = d;
/**
        var isWrong = true;
        data.Graph.edges.forEach(function(e){
            if(e.source == 0) isWrong = false;  
            if(e.target == 0) isWrong = false;
        });
        if(isWrong)
        {   data.Graph.edges.forEach(function(e){
                e.source--;
                e.target--;
            });
        }**/
        graphData = data.Graph;
        degreeCentrality = data.Centrality[4].Degree;
        eigenvectorCentrality = data.Centrality[0].Eigenvector;
        katzCentrality = data.Centrality[5].Katz;
        betweennessCentrality = data.Centrality[1].Betweenness;
        closenessCentrality = data.Centrality[2].Closeness;
        groupCentrality = 1;
        PangRank = data.Centrality[3].PageRank;


        layout = d3.layout.force().charge(-500).size([graphWidth, graphHeight])
            .gravity(0.2).linkStrength(.5).linkDistance(200).friction(0.5).alpha(0.1);

        visWindow = d3.select("#graph").append("svg:svg")
            .attr("pointer-events", "all")
            .attr("width", graphWidth)
            .attr("height", graphHeight)
            .call(zoom)
            .on("dblclick.zoom", null);

        graph = visWindow
            .append("svg:g")
            .attr("class", "vis")
            .attr("width", graphWidth)
            .attr("height", graphHeight);

        zoom.on("zoom", rescale)
            .scale(1);

        //��ͷ
        graph.append("svg:defs").selectAll("marker")
            .data(['aa'])
            .enter()
            .append("svg:marker")
            .attr("id", "arrow")
    /*        .attr("viewBox", "0 0 12 12")*/
            .attr("refX", 23)
            .attr("refY", 2)
    /*        .attr("markerUnits", "strokeWidth")*/
            .attr("markerWidth", 6)
            .attr("markerHeight", 4)
            .attr("orient", "auto")
            .append("svg:path")
            .attr("d", "M0,0 V4 L6,2 Z");

        //links
        links = graph.selectAll(".link")
            .data(graphData.edges)
            .enter()
            .append("svg:path")
            .attr("class", "link")
            .attr("marker-end", "url(#arrow)");

        //nodes
        nodes = graph.selectAll(".node")
            .data(graphData.nodes)
            .enter()
            .append("svg:g")
            .attr("class", "node")
            .attr("fill",node_colors)
            .attr("id", function(d){ return "Node" + d.id})
            .call(layout.drag);

        circle = nodes.append("svg:circle")
            .attr("r", node_radius)
            .attr("id", function(d){ return "circle" + d.id;})
            .attr("class", "circle")
            .on("click", onNodeClick)
    /*        .on("mouseover", mouseOverFunction)*/
    /*        .on("mouseout", mouseOutFunction)*/
            .on("dblclick", onNodeDblClick);

        text_shadow = nodes.append("svg:text")
            .attr("x", 10)
            .attr("y", 7)
            .attr("fill", "#ccc")
            .attr("font-size", 10)
            .attr("class", "shadow")
/*            .style("opacity", 0)*/
            .text(function(d) { return "V" + d.id; });

        text = nodes.append("svg:text")
            .attr("x", 10)
            .attr("y", 7)
            .attr("id", function(d){ return "circle" + d.id;})
            .attr("class", "text")
            .attr("fill", "#555")
/*            .style("opacity", 0)*/
            .attr("font-size", 10)                  ///////////////////////////////////////////
            .text(function (d) {
                return "V" + d.id;
            });

        nodes.append("title").text(function(d){return "学号："+(d.id)+"\n"+
                                                    "性别："+(d.gender==1?"男":"女")+"\n"+
                                                    "年龄："+d.age+"\n"+
                                                    "学院："+(d.academy==0?"计算机学院":"电子学院")+"\n"+
                                                    "兴趣："+(d.interest==0?"文静型":"运动型")+" ";});

        resize();

        drag = layout.drag().on("drag", function(d){d.fixed = true;});

        layout
            .on("tick", function () {
                links.attr("d", function (d) {
                    return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y;
                });

                nodes.attr("cx", function (d) {
                    return d.x;
                })
                    .attr("cy", function (d) {
                        return d.y
                    })
                    .attr("transform", function (d) {
                        return "translate(" + d.x + "," + d.y + ")";
                    });
            });

        layout.nodes(graphData.nodes)                   //数据类型转换
            .links(graphData.edges)
            .start();

        graphData.edges.forEach(function(d) {
            linkedByIndex[d.source.index + "," + d.target.index] = true;
        });

        linear.domain([d3.min(degreeCentrality),d3.max(degreeCentrality)]).range([0,1]);

        //nodes.filter(function(d){
        //    if(d.id == "2")
        //    {
        //        console.log(d);
        //        highLight(d);
        //    }
        //});


        /*nodeRegularEquivalenceByIndex = {};
        graphData.nodes.forEach(function(d1, i) {
            nodeRegularEquivalenceByIndex[i] = [];
            graphData.nodes.forEach(function(d2, j) {
                if(i == j){}
                else if(nodeRegularEquivalenceByIndex[i][0] == null || nodeRegularEquivalenceByIndex[i][0].maxValue < regularEquivalence[i][j]) {
                    nodeRegularEquivalenceByIndex[i] = [];
                    nodeRegularEquivalenceByIndex[i].push({"maxNodeIndex": d2.index, "maxValue": regularEquivalence[i][j]});
                }
                else if(nodeRegularEquivalenceByIndex[i][0] == regularEquivalence[i][j]) {
                    nodeRegularEquivalenceByIndex[i].push({"maxNodeIndex": d2.index, "maxValue": regularEquivalence[i][j]});
                }
                else{}
            });
        });*/
    }

    this.getUsrId = function(userId){

        nodes.filter(function(d){
            if(d.id == userId)
            {
                highLight(d);
            }
        });
    }

    this.removeGraph = function(){
        $("svg").remove();
    }

    this.onDegreeCentrality = function(){
        //alert("degreeCentrality");
        Astatus = 1;
        update();
    }

    this.onEigenvectorCentrality = function(){
/*        alert("onEigenvectorCentrality");*/
        Astatus = 2;
        update();
    }

    this.onKatzCentrality = function(){
/*        alert("onKatzCentrality");*/
        Astatus = 3;
        update();
    }

    this.onBetweennessCentrality = function(){
/*        alert("onBetweennessCentrality");*/
        Astatus = 4;
        update();
    }

    this.onClosennessCentrality = function(){
/*        alert("onClosennessCentrality");*/
        Astatus = 5;
        update();
    }

    this.onPageRank = function(){
/*        alert("onPageRank");*/
        Astatus = 6;
        update();
    }

    this.onGroupCentrality = function(){
/*        alert("onGroupCentrality");*/
        Astatus = 7;
        update();
    }

    this.onClusteringCoefficient = function(){
/*        alert("onClusteringCoefficient");*/
        Astatus = 8;
        update();
    }

    this.onStructuralEquivalence = function(){
/*        alert("onStructuralEquivalence");*/
        Astatus = 9;
        update();
    }

    this.onRegularEquivalence = function(){
/*        alert("onRegularEquivalence");*/
        Astatus = 10;
        update();
    }
}


