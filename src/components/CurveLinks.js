import React from "react";
import $ from "jquery";
import d3 from "d3";

function filterNodesById(nodes,id){
    return nodes.filter(function(n) { return n.id === id; });
}

function filterNodesByType(nodes,value){
    return nodes.filter(function(n) { return n.type === value; });
}

function triplesToGraph(triples){

    svg.html("");
    //Graph
    var graph={nodes:[], links:[], triples:[]};

    //Initial Graph from triples
    triples.forEach(function(triple){
        var subjId = triple.subject;
        var predId = triple.predicate;
        var objId = triple.object;

        var subjNode = filterNodesById(graph.nodes, subjId)[0];
        var objNode  = filterNodesById(graph.nodes, objId)[0];

        if(subjNode==null){
            subjNode = {id:subjId, label:subjId, weight:1, type:"node"};
            graph.nodes.push(subjNode);
        }

        if(objNode==null){
            objNode = {id:objId, label:objId, weight:1, type:"node"};
            graph.nodes.push(objNode);
        }

        var predNode = {id:predId, label:predId, weight:1, type:"pred"} ;
        graph.nodes.push(predNode);

        var blankLabel = "";

        graph.links.push({source:subjNode, target:predNode, predicate:blankLabel, weight:1});
        graph.links.push({source:predNode, target:objNode, predicate:blankLabel, weight:1});

        graph.triples.push({s:subjNode, p:predNode, o:objNode});

    });

    return graph;
}


function update(){
    // ==================== Add Marker ====================
    svg.append("svg:defs").selectAll("marker")
        .data(["end"])
        .enter().append("svg:marker")
        .attr("id", String)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 30)
        .attr("refY", -0.5)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("svg:polyline")
        .attr("points", "0,-5 10,0 0,5")
    ;

    // ==================== Add Links ====================
    var links = svg.selectAll(".link")
        .data(graph.triples)
        .enter()
        .append("path")
        .attr("marker-end", "url(#end)")
        .attr("class", "link")
    ;

    // ==================== Add Link Names =====================
    var linkTexts = svg.selectAll(".link-text")
        .data(graph.triples)
        .enter()
        .append("text")
        .attr("class", "link-text")
        .text( function (d) { return d.p.label; })
    ;

    //linkTexts.append("title")
    //		.text(function(d) { return d.predicate; });

    // ==================== Add Link Names =====================
    var nodeTexts = svg.selectAll(".node-text")
        .data(filterNodesByType(graph.nodes, "node"))
        .enter()
        .append("text")
        .attr("class", "node-text")
        .text( function (d) { return d.label; })
    ;

    //nodeTexts.append("title")
    //		.text(function(d) { return d.label; });

    // ==================== Add Node =====================
    var nodes = svg.selectAll(".node")
        .data(filterNodesByType(graph.nodes, "node"))
        .enter()
        .append("circle")
        .attr("class", "node")
        .attr("r",8)
        .call(force.drag)
    ;//nodes

    // ==================== Force ====================
    force.on("tick", function() {
        nodes
            .attr("cx", function(d){ return d.x; })
            .attr("cy", function(d){ return d.y; })
        ;

        links
            .attr("d", function(d) {
                return "M" 	+ d.s.x + "," + d.s.y
                    + "S" + d.p.x + "," + d.p.y
                    + " " + d.o.x + "," + d.o.y;
            })
        ;

        nodeTexts
            .attr("x", function(d) { return d.x + 12 ; })
            .attr("y", function(d) { return d.y + 3; })
        ;


        linkTexts
            .attr("x", function(d) { return 4 + (d.s.x + d.p.x + d.o.x)/3  ; })
            .attr("y", function(d) { return 4 + (d.s.y + d.p.y + d.o.y)/3 ; })
        ;
    });

    // ==================== Run ====================
    force
        .nodes(graph.nodes)
        .links(graph.links)
        .charge(-500)
        .linkDistance(50)
        .start()
    ;
}

var triples = [
    {
        "subject": "http://www.moma.org/collection/works/9876",
        "predicate": "dc:creator",
        "object": "http://momaexmple.org/artworks/9876/artist/"
    },
    {
        "subject": "http://momaexmple.org/artworks/9876/artist/",
        "predicate": "skos:prefLabel",
        "object": "Pablo Picasso"
    },
    {
        "subject": "http://www.moma.org/collection/works/9876",
        "predicate": "dct:medium",
        "object": "Ink on paper"
    },
    {
        "subject": "http://www.moma.org/collection/works/9876",
        "predicate": "dc:type",
        "object": "Drawing"
    },
    {
        "subject": "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwww.szepmuveszeti.hu%2Fdata%2Fmutargykepek%2F1%2F4378%2F14378.jpg",
        "predicate": "dc:creator",
        "object": "http://cmoaexample.com/cmoa/things/c20f15d2-18f0-4f62-866a-ac383809ce97/provider/"
    },
    {
        "subject": "http://cmoaexample.com/cmoa/things/c20f15d2-18f0-4f62-866a-ac383809ce97/provider/",
        "predicate": "skos:prefLabel",
        "object": "Alan G. and Jane A. Lehman Fund, Robert S. Waters Charitable Trust Fund, and Charles J. Rosenbloom Fund"
    },
    {
        "subject": "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwww.szepmuveszeti.hu%2Fdata%2Fmutargykepek%2F1%2F4378%2F14378.jpg",
        "predicate": "dct:medium",
        "object": "Ink on paper"
    },
    {
        "subject": "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwww.szepmuveszeti.hu%2Fdata%2Fmutargykepek%2F1%2F4378%2F14378.jpg",
        "predicate": "dc:type",
        "object": "Drawings"
    },
    {
        "subject": "http://www.moma.org/collection/works/9876",
        "predicate": "dc:creator",
        "object": "http://dbpedia.org/resource/Pablo_Picasso"
    },
    {
        "subject": "http://dbpedia.org/resource/Pablo_Picasso",
        "predicate": "skos:prefLabel",
        "object": "Pablo Picasso"
    },
    {
        "subject": "http://www.moma.org/collection/works/9876",
        "predicate": "dct:medium",
        "object": "Ink on paper"
    },
    {
        "subject": "http://www.moma.org/collection/works/9876",
        "predicate": "dc:type",
        "object": "Drawing"
    }
];

var svg = d3.select("#svg-body").append("svg")
    .attr("width", 800)
    .attr("height", 600)
;

var force = d3.layout.force().size([800, 600]);

var graph = triplesToGraph(triples);

export class CurveLinks extends React.Component{
render() {
    return (
        <div id="svg-body" className="panel-body"/>
    )
}
}