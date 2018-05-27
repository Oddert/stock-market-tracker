$(document).ready(function () {


d3.selectAll('h1').style('color', 'pink');
console.log('what')


var canvasHeight = $(window).height() - 20,
    canvasWidth  = $(window).width() - 20;

var graphHeight = 300,
    graphWidth  = 600;

var canvas = d3.select('.root')
                .append('svg')
                .attr('width', canvasWidth)
                .attr('height', canvasHeight)
                .style('border', '1px solid black');

var graph = canvas.append('g')
                  .attr('width', graphWidth)
                  .attr('height', graphHeight)
                  .attr('transform', 'translate(' + ((canvasWidth-graphWidth)/2) + ',' + ((canvasHeight-graphHeight)/2) + ')');

var data = [
  {position: 1, value: 20},
  {position: 6, value: 197},
  {position: 4, value: 244},
  {position: 5, value: 289},
  {position: 8, value: 487},
  {position: 3, value: 491},
  {position: 7, value: 528},
  {position: 2, value: 835},
  {position: 9, value: 974}
]

var newData = [
  {position: 6, value: 83},
  {position: 7, value: 135},
  {position: 2, value: 246},
  {position: 1, value: 445},
  {position: 5, value: 450},
  {position: 2, value: 580},
  {position: 9, value: 699},
  {position: 2, value: 782},
  {position: 3, value: 923}
]

var dataConcat = [
  [
    {position: 1, value: 20},
    {position: 6, value: 197},
    {position: 4, value: 244},
    {position: 5, value: 289},
    {position: 8, value: 487},
    {position: 3, value: 491},
    {position: 7, value: 528},
    {position: 2, value: 835},
    {position: 9, value: 974}
  ],
  [
    {position: 6, value: 83},
    {position: 7, value: 135},
    {position: 2, value: 246},
    {position: 1, value: 445},
    {position: 5, value: 450},
    {position: 2, value: 580},
    {position: 9, value: 699},
    {position: 2, value: 782},
    {position: 3, value: 923}
  ]
]

var posScale = d3.scaleLinear()
                  .domain([1,9])
                  .range([graphHeight, 0]);

var valScale = d3.scaleLinear()
                  .domain([1,999])
                  .range([0, graphWidth]);



var line = d3.line()
              .x(d => valScale(d.value))
              .y(d => posScale(d.position));



//=============== render lines together ===================

var colors = ["#c1392b", "#27ae61", "#297fb8", "#f39c11", "#8d44ad", "#16a086", "#d25400", "#bec3c7",
                            "#e84c3d", "#2dcc70", "#3598db", "#f1c40f", "#9a59b5", "#1bbc9b", "#e67f22", "#95a5a5"];

dataConcat.forEach(function (each, index) {
  graph.append('path')
        .datum(each)
        .attr('class', 'line')
        .attr('d', line)

        .attr('transform', 'translate(' + 0 + ',' + 0 + ')')
        .style("stroke", d => colors[index])
        .style("stroke-width", "1px")
        .style("fill", "none");
})



//=============== render lines individually ================
// var firstLine = graph.append('path')
//                       .datum(data)
//                       .attr('class', 'line')
//                       .attr('d', line)
//
//                       .attr('transform', 'translate(' + 0 + ',' + 0 + ')')
//                       .style("stroke", "black")
//                       .style("stroke-width", "1px")
//                       .style("fill", "none");
//
//
// var secondLine = graph.append('path')
//                       .datum(newData)
//                       .attr('class', 'line')
//                       .attr('d', line)
//
//                       .attr('transform', 'translate(' + 0 + ',' + 0 + ')')
//                       .style("stroke", "red")
//                       .style("stroke-width", "1px")
//                       .style("fill", "none");






var posAxisConst = d3.axisLeft(posScale)
                      .ticks(10);

var posAxis = graph.append('g')
                    .call(posAxisConst);

var valAxisConst = d3.axisBottom(valScale)
                      .ticks(9);

var valAxis = graph.append('g')
                    .call(valAxisConst)
                    .attr('transform', 'translate(0, ' + graphHeight + ')');


});
