/**
 * Created by liyp on 5/26/2015.
 */
var eq_force;

$(document).ready(function(){
    eq_force = new SVGClass_equivalence();
});

function SVGClass_equivalence() {

    var Astatus = 1;
    var nodeclicked = null;
    var color = d3.scale.category10();
    var str_linear = d3.scale.linear();
    var reg_linear = d3.scale.linear();
    var colortransformer = d3.interpolate(d3.rgb("#5E79E6"),d3.rgb("#273982"));
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

    var self_color = "#C9302C",
        sim_color = "#449D44",
        gray_color = "#999";

    var layout, visWindow, graph, links, nodes, circle, text, 
        text_shadow, drag;

    var str_equ,
        reg_equ;

    var linkedByIndex = {};
    var nodeRegularEquivalenceByIndex = {};
    var nodeStructralEquivalenceByIndex = {};

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
            case 7:
                if (d != nodeclicked) {

                    circle
                        .transition(500)
                        .attr("r", 8);

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
                nodeclicked = d;
/*                    var thecircle = d3.select(this);*/

                    nodes
                        .transition(500)
                        .style("opacity", function (o) {
                            return isStructralEquivalent(o) || o === d ? 1.0 : 0.5;
                        })
                        .style("fill", function (o) {
                            if (isStructralEquivalent(o)) {
                                fillcolor = sim_color;
                            }else {
                                fillcolor = gray_color;
                            };

                            if (isEqual(o, d)) {
                                fillcolor = self_color;
                            };

/*                            if(isMostRegularEquivalent(d, o)){
                                fillcolor = 'red';
                            };*/
                            return fillcolor;
                        });

                    links
                        .transition(500)
                        .style("opacity", function (o) {
                            return (o.source === d && isStructralEquivalent(o.target)) || (o.target === d && isStructralEquivalent(o.source)) ? 1 : 0.05;
                        })
                        .transition(500)
                        .attr("marker-end", function (o) {
                            return (o.source === d && isStructralEquivalent(o.target)) || (o.source === d && isStructralEquivalent(o.target)) ? "url(#arrow)" : "url()";
                        });

                    text.attr("fill", null);
                    circle.attr("r", function(c){
                        if(findIdInStructral(c.id))
                        {
                            return str_linear(getEquInStructralById(c.id))*15;
                        }
                        else if(c.id == d.id)
                            return 18;
                        else
                            return 6;
                    });
/*
                    thecircle
                        .transition(500)
                        .attr("r", function () {
                            return 8
                        });*/

                break;
            case 10:
                nodeclicked = d;
/*                    var thecircle = d3.select(this);*/

                    nodes
                        .transition(500)
                        .style("opacity", function (o) {
                            return isRegularEquivalent(o) || o === d ? 1.0 : 0.5;
                        })
                        .style("fill", function (o) {
                            if (isRegularEquivalent(o)) {
                                fillcolor = sim_color;
                            }else {
                                fillcolor = gray_color;
                            };

                            if (isEqual(o, d)) {
                                fillcolor = self_color;
                            };

/*                            if(isMostRegularEquivalent(d, o)){
                                fillcolor = 'red';
                            };*/
                            return fillcolor;
                        });

                    links
                        .transition(500)
                        .style("opacity", function (o) {
                            return (o.source === d && isRegularEquivalent(o.target)) || (o.target === d && isRegularEquivalent(o.source)) ? 1 : 0.05;
                        })
                        .transition(500)
                        .attr("marker-end", function (o) {
                            return (o.source === d && isRegularEquivalent(o.target)) || (o.source === d && isRegularEquivalent(o.target)) ? "url(#arrow)" : "url()";
                        });

                    text.attr("fill", null);

                    circle.attr("r", function(c){
                        if(findIdInRegular(c.id)){

                            return reg_linear(getEquInRegularById(c.id))*15;
                        }
                        else if(c.id == d.id)
                            return 18;
                        else
                            return 6;
                    });
/*
                    thecircle
                        .transition(500)
                        .attr("r", function () {
                            return 8
                        });*/

                break;

                    
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
            .attr("r", 8);
    };

    function node_radius(d) {
        switch (Astatus) {
            case 1:
                return Math.sqrt(80*degreeCentrality[parseInt(d.id)-1]) + 4;/*Math.pow(40.0 * 5, 1/3);*/
                break;
            case 2:
                return 10*eigenvectorCentrality[parseInt(d.id)-1];
                break;
            case 3:
                return Math.sqrt(20*katzCentrality[parseInt(d.id)-1]) + 2;
                break;
            case 4:
                return Math.sqrt(20*betweennessCentrality[parseInt(d.id)-1]) + 2;
                break;
            case 5:
                return Math.sqrt(20*closenessCentrality[parseInt(d.id)-1]) + 2;
                break;
            case 6:////////////////////////////////////////////////////////////////////////////////
                return Math.sqrt(20*PangRank[parseInt(d.id)-1]) + 2;
                break;
            case 7:
                return Math.sqrt(20*PangRank[parseInt(d.id)-1]) + 2;
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
                return colortransformer(groupCentrality[d.id-1]);
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

    function rescale() {

        graph.attr("transform",
                "translate(" + zoom.translate() + ")"
                + " scale(" + zoom.scale() + ")");
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

    function findIdInRegular(id){
        var isExist = false;
        reg_equ.forEach(function(e){
            if(e[0] == id)
                isExist = true;
        });
        return isExist;
    }

    function getEquInRegularById(id){
        var equ = 0;
        reg_equ.forEach(function(e){
            if(e[0] == id)
                equ = e[5];
        });
        return equ;
    }

    function isRegularEquivalent(a){
        return findIdInRegular(a.id);
    }

    function findIdInStructral(id){
        var isExist = false;
        str_equ.forEach(function(e){
            if(e[0] == id)
                isExist = true;
        });
        return isExist;
    }

    function getEquInStructralById(id){
        var equ = 0;
        str_equ.forEach(function(e){
            if(e[0] == id)
                equ = e[5];
        });
        return equ;
    }

    function isStructralEquivalent(a){
        return findIdInStructral(a.id);
    }

/*    function isMostRegularEquivalent(a, b){
        var result = false;
        nodeRegularEquivalenceByIndex[a.index].forEach(function(d){
            if(d.maxNodeIndex == b.index)
                result = true;
        });
        return result;
    }*/

    function update(){

                    nodes
                        .transition(500)
                        .style("fill", node_colors)
                        .style("opacity", 1);

                    links
                        .transition(500)
                        .style("stroke-opacity", 1)
                        .attr("marker-end", "url(#arrow)");

                    circle
                        .transition(500)
                        .attr("r", node_radius);
    }

    this.getData = function(divId, d){

        Astatus = 9;
        data = d;
/*        data.Graph.edges.forEach(function(e){
            e.source--;
            e.target--;
        });*/
        graphData = data.Graph;
        console.log(graphData);
/*        degreeCentrality = data.Centrality[4].Degree;
        eigenvectorCentrality = data.Centrality[0].Eigenvector;
        katzCentrality = data.Centrality[5].Katz;
        betweennessCentrality = data.Centrality[1].Betweenness;
        closenessCentrality = data.Centrality[2].Closeness;
        groupCentrality = 1;
        PangRank = data.Centrality[3].PageRank;*/
/*        regularEquivalence = data.Equivalence;
        clusterCoefficient = data.ClusterCoefficient;*/

        layout = d3.layout.force().charge(-500).size([graphWidth, graphHeight])
            .gravity(.2).linkStrength(.2).linkDistance(100).friction(0.5);
        visWindow = d3.select(divId).append("svg:svg")
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
            .attr("fill","#31B0D5")
            .attr("id", function(d){ return "Node" + d.id})
            .call(layout.drag);

        circle = nodes.append("svg:circle")
            .attr("r", 8)
            .attr("id", function(d){ return "circle" + d.id;})
            .attr("class", "circle")
/*            .on("click", onNodeClick)*/
    /*        .on("mouseover", mouseOverFunction)*/
    /*        .on("mouseout", mouseOutFunction)*/
            .on("dblclick", onNodeDblClick);

        text_shadow = nodes.append("svg:text")
            .attr("x", 10)
            .attr("y", 7)
            .attr("fill", "#ccc")
            .attr("font-size", 10)
            .attr("class", "shadow")
            .text(function(d) { return "V" + d.id; });

        text = nodes.append("svg:text")
            .attr("x", 10)
            .attr("y", 7)
            .attr("id", function(d){ return "circle" + d.id;})
            .attr("class", "text")
            .attr("fill", "#555")
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
        console.log(userId);
        nodes.filter(function(d){
            if(d.id == userId)
            {
                highLight(d);
            }
        });
    }

    this.getStructralResult = function(searchId, d){

        str_equ = d.Rank.structral;
        reg_equ = d.Rank.regular;
        str_linear.domain([str_equ[9][5],str_equ[0][5]]).range([0.3,1]);
        Astatus = 9;
        console.log(str_equ);

        nodes.filter(function(d){
            if(d.id == searchId)
            {
                highLight(d);
            }
        });

    }

    this.getRegularResult = function(searchId, d){

        str_equ = d.Rank.structral;
        reg_equ = d.Rank.regular;
        reg_linear.domain([reg_equ[9][5],reg_equ[0][5]]).range([0.3,1]);
        Astatus = 10;

        nodes.filter(function(d){
            if(d.id == searchId)
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

    this.onGroupCentrality = function(){
/*        alert("onGroupCentrality");*/
        Astatus = 6;
        update();
    }

    this.onPageRank = function(){
/*        alert("onPageRank");*/
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


