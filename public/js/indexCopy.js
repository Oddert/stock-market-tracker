var socket = io.connect('http://localhost:3000/');

var localData = [];

$.getJSON("https://api.iextrading.com/1.0/stock/aapl/chart/1d", function (data) {
  localData = data;
  renderGraph();
  setInterval(function () {
    console.log("============ RE RENDERING GRAPH ===============")
    renderGraph();
  }, 15000)
});

socket.on('message', message => console.log(message));

socket.on('tester', message => {
  // console.log("New massage from local host: ", message)
  var relativeDate = moment().tz('America/New_York').format();
  relativeDate = relativeDate.slice(relativeDate.length-14, relativeDate.length-9);
  // console.log(relativeDate);

  var parsed = JSON.parse(message);

  if (parsed.symbol == 'AAPL') {
    var newEntry = {
      minute: relativeDate,
      close: parsed.lastSalePrice
    }
    console.log("ADDING: ", newEntry);
    localData.push(newEntry);
  }
  // localData.push(message);
});

socket.on('add', (message) => {
  console.log('Subscribing to: ', message);
});


function add() {
  console.log("Broadcasting: add, appl");
  socket.emit('add', 'aapl');
}

socket.on('disconnect', () => console.log('Disconnected.'));

function dateString(minute) {
  return (new Date().toDateString()) + " " + minute + ":00"
}

function renderGraph() {
  d3.selectAll('h1').style('text-decoration', 'underline');
  d3.selectAll('.root').selectAll('*').remove();
  var canvasHeight = 500,
      canvasWidth  = 960,

      graphHeight  = 400,
      graphWidth   = 800;

  var canvas = d3.selectAll('.root')
                  .append('svg')
                  .attr('width', canvasWidth)
                  .attr('height', canvasHeight)
                  .style('border', '1px solid black');

  var graph = canvas.append('g')
                    .attr('transform', 'translate(' + ((canvasWidth-graphWidth)/2) + ',' + ((canvasHeight-graphHeight)/1.5) + ')')
                    .style('border', '1px solid red');

  var minDateParse = new Date(moment.tz('America/New_York').format().slice(0,11) + '09:30:00');
  var maxDateParse = new Date(moment.tz('America/New_York').format().slice(0,11) + '16:00:00');

  var minStockParse = localData.reduce(function (acc, each) {
    return acc < each.close ? acc : each.close;
  });

  var maxStockParse = localData.reduce(function (acc, each) {
    if (each.close === undefined || acc > each.close) {
      return acc;
    } else {
      return each.close;
    }
  }, 0);

  // console.log(typeof minDateParse, minDateParse);
  // console.log(minStockParse);
  // console.log(typeof maxDateParse, maxDateParse);
  // console.log(maxStockParse);

  //need new max min stock val -

  var timeScale = d3.scaleTime()
                    .domain([minDateParse, maxDateParse])
                    .range([0, graphWidth]);

  var valueScale = d3.scaleLinear()
                    .domain([minStockParse, maxStockParse])
                    .range([graphHeight, 0]);

  var prevClose = 0;

  var line = d3.line()
                .x(function (d) {
                  // console.log(d.minute)
                  var timeP = new Date(dateString(d.minute));
                  return timeScale(timeP)
                })
                .y(function (d) {
                  if (d.close) {
                    prevClose = d.close;
                    return valueScale(d.close)
                  } else {
                    return valueScale(prevClose)
                  }
                });


  graph.append('path')
      .datum(localData)
      .attr('class', 'line')
      .attr('d', line)

      .attr('transform', 'translate(' + 0 + ',' + 0 + ')')
      .style("stroke", "black")
      .style("stroke-width", "1px")
      .style("fill", "none");


  var axisLeftConst = d3.axisLeft(valueScale)
                        .ticks(10);

  var axisLeft = graph.append('g')
                      .call(axisLeftConst)
                      .attr('transform', 'translate(0, 0)');


  var axisBottomConst = d3.axisBottom(timeScale)
                          .ticks(10);

  var axisBottom = graph.append('g')
                        .call(axisBottomConst)
                        .attr('transform', 'translate(0,' + graphHeight + ')');













  var crossHairHor = canvas.append('line')
                            .attr('x1', 0)
                            .attr('y1', 50)
                            .attr('x2', canvasWidth)
                            .attr('y2', 50)
                            .style('stroke', 'red')
                            .style('stroke-width', '1px');

  var crossHairVer = canvas.append('line')
                            .attr('x1', 50)
                            .attr('y1', 0)
                            .attr('x2', 50)
                            .attr('y2', canvasHeight)
                            .style('stroke', 'red')
                            .style('stroke-width', '1px');

  canvas.on('mouseover', function (d) {
    var xPos = d3.mouse(this)[0];
    var yPos = d3.mouse(this)[1];
    crossHairHor.attr('y1', yPos)
                .attr('y2', yPos)
    crossHairVer.attr('x1', xPos)
                .attr('x2', xPos)

  })
  .on('mousemove', function (d) {
    var xPos = d3.mouse(this)[0];
    var yPos = d3.mouse(this)[1];
    crossHairHor.attr('y1', yPos)
                .attr('y2', yPos)
    crossHairVer.attr('x1', xPos)
                .attr('x2', xPos)
  })

  //time scale should be fixed
  //stock amount needs calculated

  //time can be eg 4mins uptime, back data for 12 hours?
  //since day open?

  // x scale show form -6hrs, + 6hrs
  // y scale show from -10%, + 10%

}





// =========== LAST end point ==========
var lastSample = {
  "symbol": "FB",
  "sector": "softwareservices",
  "securityType": "commonstock",
  "bidPrice": 184.8000,
  "bidSize": 200,
  "askPrice": 184.8500,
  "askSize": 100,
  "lastUpdated": 1526923279796,
  "lastSalePrice": 184.8600,
  "lastSaleSize": 100,
  "lastSaleTime": 1526923159070,
  "volume": 107154,
  "marketPercent": 0.01668,
  "seq": 21488
};


var lastMulti = [
  {"symbol":"FB","sector":"softwareservices","securityType":"commonstock","bidPrice":180.2400,"bidSize":100,"askPrice":184.9000,"askSize":100,"lastUpdated":1526926267516,"lastSalePrice":184.8250,"lastSaleSize":700,"lastSaleTime":1526926204574,"volume":121847,"marketPercent":0.01734,"seq":25276},
  {"symbol":"FB","sector":"softwareservices","securityType":"commonstock","bidPrice":180.2400,"bidSize":100,"askPrice":184.9100,"askSize":100,"lastUpdated":1526926267601,"lastSalePrice":184.8250,"lastSaleSize":700,"lastSaleTime":1526926204574,"volume":121847,"marketPercent":0.01734,"seq":25277},
  {"symbol":"SNAP","sector":"softwareservices","securityType":"commonstock","bidPrice":10.7500,"bidSize":200,"askPrice":10.7600,"askSize":400,"lastUpdated":1526926264779,"lastSalePrice":10.7500,"lastSaleSize":100,"lastSaleTime":1526926273777,"volume":243505,"marketPercent":0.01516,"seq":11719},
  {"symbol":"SNAP","sector":"softwareservices","securityType":"commonstock","bidPrice":10.7500,"bidSize":200,"askPrice":10.7600,"askSize":400,"lastUpdated":1526926264779,"lastSalePrice":10.7500,"lastSaleSize":100,"lastSaleTime":1526926273777,"volume":243605,"marketPercent":0.01517,"seq":11720},
  {"symbol":"SNAP","sector":"softwareservices","securityType":"commonstock","bidPrice":10.7400,"bidSize":200,"askPrice":10.7600,"askSize":400,"lastUpdated":1526926273777,"lastSalePrice":10.7500,"lastSaleSize":100,"lastSaleTime":1526926273777,"volume":243605,"marketPercent":0.01517,"seq":11721},
  {"symbol":"SNAP","sector":"softwareservices","securityType":"commonstock","bidPrice":10.7400,"bidSize":200,"askPrice":10.7600,"askSize":500,"lastUpdated":1526926273778,"lastSalePrice":10.7500,"lastSaleSize":100,"lastSaleTime":1526926273777,"volume":243605,"marketPercent":0.01517,"seq":11722},
  {"symbol":"SNAP","sector":"softwareservices","securityType":"commonstock","bidPrice":10.7400,"bidSize":200,"askPrice":10.7600,"askSize":600,"lastUpdated":1526926273778,"lastSalePrice":10.7500,"lastSaleSize":100,"lastSaleTime":1526926273777,"volume":243605,"marketPercent":0.01516,"seq":11723},
  {"symbol":"SNAP","sector":"softwareservices","securityType":"commonstock","bidPrice":10.7400,"bidSize":200,"askPrice":10.7600,"askSize":600,"lastUpdated":1526926273778,"lastSalePrice":10.7500,"lastSaleSize":100,"lastSaleTime":1526926273778,"volume":243705,"marketPercent":0.01516,"seq":11724},
  {"symbol":"SNAP","sector":"softwareservices","securityType":"commonstock","bidPrice":10.7400,"bidSize":200,"askPrice":10.7500,"askSize":1000,"lastUpdated":1526926273778,"lastSalePrice":10.7500,"lastSaleSize":100,"lastSaleTime":1526926273778,"volume":243705,"marketPercent":0.01515,"seq":11725},
  {"symbol":"SNAP","sector":"softwareservices","securityType":"commonstock","bidPrice":10.7400,"bidSize":100,"askPrice":10.7500,"askSize":1000,"lastUpdated":1526926273778,"lastSalePrice":10.7500,"lastSaleSize":100,"lastSaleTime":1526926273778,"volume":243705,"marketPercent":0.01515,"seq":11726},
  {"symbol":"SNAP","sector":"softwareservices","securityType":"commonstock","bidPrice":10.7400,"bidSize":100,"askPrice":10.7600,"askSize":500,"lastUpdated":1526926273797,"lastSalePrice":10.7500,"lastSaleSize":100,"lastSaleTime":1526926273778,"volume":243705,"marketPercent":0.01514,"seq":11727},
  {"symbol":"SNAP","sector":"softwareservices","securityType":"commonstock","bidPrice":10.7400,"bidSize":100,"askPrice":10.7600,"askSize":600,"lastUpdated":1526926273812,"lastSalePrice":10.7500,"lastSaleSize":100,"lastSaleTime":1526926273778,"volume":243705,"marketPercent":0.01514,"seq":11728},
  {"symbol":"FB","sector":"softwareservices","securityType":"commonstock","bidPrice":180.2400,"bidSize":100,"askPrice":185.0000,"askSize":110,"lastUpdated":1526926273901,"lastSalePrice":184.8250,"lastSaleSize":700,"lastSaleTime":1526926204574,"volume":121847,"marketPercent":0.01734,"seq":25278},

  {"symbol":"SNAP","sector":"softwareservices","securityType":"commonstock","bidPrice":10.7400,"bidSize":200,"askPrice":10.7600,"askSize":600,"lastUpdated":1526926273978,"lastSalePrice":10.7500,"lastSaleSize":100,"lastSaleTime":1526926273778,"volume":243705,"marketPercent":0.01514,"seq":11729},
  {"symbol":"SNAP","sector":"softwareservices","securityType":"commonstock","bidPrice":10.7400,"bidSize":200,"askPrice":10.7600,"askSize":500,"lastUpdated":1526926274219,"lastSalePrice":10.7500,"lastSaleSize":100,"lastSaleTime":1526926273778,"volume":243705,"marketPercent":0.01514,"seq":11730},
  {"symbol":"SNAP","sector":"softwareservices","securityType":"commonstock","bidPrice":10.7400,"bidSize":200,"askPrice":10.7600,"askSize":400,"lastUpdated":1526926274697,"lastSalePrice":10.7500,"lastSaleSize":100,"lastSaleTime":1526926273778,"volume":243705,"marketPercent":0.01514,"seq":11731},
  {"symbol":"SNAP","sector":"softwareservices","securityType":"commonstock","bidPrice":10.7400,"bidSize":200,"askPrice":10.7600,"askSize":300,"lastUpdated":1526926274697,"lastSalePrice":10.7500,"lastSaleSize":100,"lastSaleTime":1526926273778,"volume":243705,"marketPercent":0.01514,"seq":11732},
  {"symbol":"SNAP","sector":"softwareservices","securityType":"commonstock","bidPrice":10.7400,"bidSize":200,"askPrice":10.7600,"askSize":200,"lastUpdated":1526926274697,"lastSalePrice":10.7500,"lastSaleSize":100,"lastSaleTime":1526926273778,"volume":243705,"marketPercent":0.01514,"seq":11733},
  {"symbol":"SNAP","sector":"softwareservices","securityType":"commonstock","bidPrice":10.7400,"bidSize":200,"askPrice":10.7500,"askSize":300,"lastUpdated":1526926274698,"lastSalePrice":10.7500,"lastSaleSize":100,"lastSaleTime":1526926273778,"volume":243705,"marketPercent":0.01514,"seq":11734},
  {"symbol":"SNAP","sector":"softwareservices","securityType":"commonstock","bidPrice":10.7400,"bidSize":200,"askPrice":10.7500,"askSize":400,"lastUpdated":1526926274698,"lastSalePrice":10.7500,"lastSaleSize":100,"lastSaleTime":1526926273778,"volume":243705,"marketPercent":0.01514,"seq":11735},
  {"symbol":"SNAP","sector":"softwareservices","securityType":"commonstock","bidPrice":10.7400,"bidSize":200,"askPrice":10.7500,"askSize":500,"lastUpdated":1526926274698,"lastSalePrice":10.7500,"lastSaleSize":100,"lastSaleTime":1526926273778,"volume":243705,"marketPercent":0.01514,"seq":11736},
  {"symbol":"SNAP","sector":"softwareservices","securityType":"commonstock","bidPrice":10.7400,"bidSize":100,"askPrice":10.7500,"askSize":500,"lastUpdated":1526926276959,"lastSalePrice":10.7500,"lastSaleSize":100,"lastSaleTime":1526926273778,"volume":243705,"marketPercent":0.01514,"seq":11737},
  {"symbol":"SNAP","sector":"softwareservices","securityType":"commonstock","bidPrice":10.7300,"bidSize":700,"askPrice":10.7500,"askSize":500,"lastUpdated":1526926278797,"lastSalePrice":10.7500,"lastSaleSize":100,"lastSaleTime":1526926273778,"volume":243705,"marketPercent":0.01514,"seq":11738},

  {"symbol":"FB","sector":"softwareservices","securityType":"commonstock","bidPrice":184.8600,"bidSize":100,"askPrice":185.0000,"askSize":110,"lastUpdated":1526926279932,"lastSalePrice":184.8250,"lastSaleSize":700,"lastSaleTime":1526926204574,"volume":121847,"marketPercent":0.01734,"seq":25279},
  {"symbol":"SNAP","sector":"softwareservices","securityType":"commonstock","bidPrice":10.7300,"bidSize":700,"askPrice":10.7500,"askSize":500,"lastUpdated":1526926278797,"lastSalePrice":10.7450,"lastSaleSize":100,"lastSaleTime":1526926280602,"volume":243805,"marketPercent":0.01515,"seq":11739},
  {"symbol":"SNAP","sector":"softwareservices","securityType":"commonstock","bidPrice":10.7300,"bidSize":700,"askPrice":10.7500,"askSize":600,"lastUpdated":1526926280615,"lastSalePrice":10.7450,"lastSaleSize":100,"lastSaleTime":1526926280602,"volume":243805,"marketPercent":0.01514,"seq":11740},
  {"symbol":"FB","sector":"softwareservices","securityType":"commonstock","bidPrice":180.2400,"bidSize":100,"askPrice":185.0000,"askSize":110,"lastUpdated":1526926287962,"lastSalePrice":184.8250,"lastSaleSize":700,"lastSaleTime":1526926204574,"volume":121847,"marketPercent":0.01733,"seq":25280},
  {"symbol":"SNAP","sector":"softwareservices","securityType":"commonstock","bidPrice":10.7300,"bidSize":700,"askPrice":10.7500,"askSize":600,"lastUpdated":1526926280615,"lastSalePrice":10.7450,"lastSaleSize":100,"lastSaleTime":1526926288173,"volume":243905,"marketPercent":0.01515,"seq":11741},
  {"symbol":"FB","sector":"softwareservices","securityType":"commonstock","bidPrice":180.2400,"bidSize":100,"askPrice":184.9000,"askSize":100,"lastUpdated":1526926288209,"lastSalePrice":184.8250,"lastSaleSize":700,"lastSaleTime":1526926204574,"volume":121847,"marketPercent":0.01733,"seq":25281},
  {"symbol":"FB","sector":"softwareservices","securityType":"commonstock","bidPrice":180.2400,"bidSize":100,"askPrice":184.9100,"askSize":100,"lastUpdated":1526926288601,"lastSalePrice":184.8250,"lastSaleSize":700,"lastSaleTime":1526926204574,"volume":121847,"marketPercent":0.01733,"seq":25282}
];
