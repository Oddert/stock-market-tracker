var socket = io.connect('http://localhost:3000/');

var localData = {};
var sublist = [];
var currentCode = '1d';

var allTimeCodes = ['1d', '1m', '3m', '6m', '1y', '2y', '5y'];

// var upTime = 0;
// setInterval(() => {
//   upTime ++;
//   $('.dispTimer').html(upTime);
// }, 1000)

function populateData(subCode) {
  console.log("Populating data...", subCode);
  var allDone = false;
  allTimeCodes.forEach(function (eachTime, index) {
    console.log("Populating ", eachTime);
    if (!localData.hasOwnProperty(subCode)) {
      console.log(subCode, " is not found, adding it now..");
      localData[subCode] = {}
    }
    var url = "https://api.iextrading.com/1.0/stock/" + subCode + "/chart/" + eachTime;
    $.getJSON(url, function (jsonData) {
      console.log("JSON call for " + subCode + " at " + eachTime + " complete, data: ", jsonData);

      if (!localData[subCode].hasOwnProperty('data')) { localData[subCode].data = {} }
      localData[subCode].data[eachTime] = jsonData;

      if (eachTime == '1d') {
        localData[subCode].data['1d'].forEach(function (each, index) {
          each.date = moment.tz('America/New_York').format().slice(0,11) + each.minute;
        });
      }


      console.log(localData);
      if (eachTime == allTimeCodes[allTimeCodes.length-1]) {
        console.log(eachTime, ' was the last time code, initialising render cycle...');
        intiateRenderCycle();
        allDone = true;
      }
    })

  })
  if (allDone === true) {
    console.log("APPARENTLY EVERYTHING IS FINISHED< THIS IS WHERE WE WOULD DO THE FIRST RENDER");

  } else {
    console.log("........ more to go.........");
  }
}

// socket.on('message', message => console.log(message));

socket.on('tester', message => {
  // console.log("New massage from local host: ", message)
  var momentDate = moment().tz('America/New_York').format();
  var relativeDate = momentDate.slice(0, momentDate.length-9);
  var nycDate = momentDate.slice(0, momentDate.length-6);

  var parsed = JSON.parse(message);
  var symbol = parsed.symbol.toLowerCase();

  if (!localData.hasOwnProperty(symbol)) {
    console.log('localData does not have property: ' + symbol);
    localData[symbol] = {}
  }
  if (!localData[symbol].hasOwnProperty('live')) {
    console.log('localData[' + symbol + '] does not have live property, adding it now...');
    localData[symbol].live = []
  }
  // console.log(localData);

  parsed.date = relativeDate;
  parsed.close = parsed.lastSalePrice ? parsed.lastSalePrice : localData[symbol].live[localData[symbol].live.length-1].close;

  localData[symbol].live.push(parsed);
  console.log('ln70, newdata')
});

function intiateRenderCycle() {
  clearInterval(renderTimer);
  console.log("==================================== INITIAL GRAPH RENDER =======================================");
  renderGraph();
  var renderTimer = setInterval(function () {
    console.log(new Date().toString(), "============ RE RENDERING GRAPH ===============")
    renderGraph();
  }, 60000)
}

socket.on('sublist', message => {
  console.log('new sublist from server! ', message);
  console.log(message.split(','));
  sublist = message.split(',');
  sublist.forEach(each => populateData(each));
  setTimeout(function () {
    intiateRenderCycle();
  }, 3000)
});

socket.on('add', (message) => {
  console.log('Subscribing to: ', message);
  addSource(message);
});


function internalAdd() {
  var newStock = $('#newStockForm').val();
  $('#newStockForm').val('');
  console.log("GOING TO ADD: ", newStock);
  addSource(newStock);
  socket.emit('add', newStock);
}

function addSource(code) {
  code = code.toLowerCase();
  console.log('Adding source: ', code);
  if (localData.hasOwnProperty(code)) {
    console.log('Data already stored, removing it...');
    localData[code] = {};
  }
  if (!sublist.includes(code)) {
    sublist.push(code);
  }
  populateData(code);
  setTimeout(function () {
    renderGraph();
  }, 2000)
}

socket.on('remove', data => {
  console.log('Instruction recieved; Remove: ', data);
  removeItem(data);
});

function internalRemove (code) {
  removeItem(code);
  socket.emit('remove', code);
}

function removeItem(code) {
  var newSublist = sublist.filter(each => each != code);
  console.log('removed: ', code, ', sublist now: ', newSublist);
  sublist = newSublist;
  renderGraph();
}

socket.on('disconnect', () => console.log('Disconnected.'));



function testadd() {
  console.log('adding goog');
  socket.emit('add', 'goog');
}

function testCode(code) {
  currentCode = code;
  renderGraph();
}

//min and max times are fixed
//----------------------------


var colors = ['#F34F43', '#57B459', '#2F9DF4', '#FEC516', '#A235B6', '#119D92', '#826053', '#F0286C', '#6A8692', '#495CBB', '#FEED48', '#6E45BB',    '#FE9F11', '#92C657',  '#12AEF4',  '#CFDE45', '#0AC1D7'];
//             Red       Green     Blue      Amber     Purple    Teal      Brown     Pink      Blue Gray  Indego   Yellow    Deep Purple  Orange   Lime Green Light Blue  Lime     Cyan

function renderGraph(timeScale) {
  timeScale = currentCode;

  // d3.selectAll('h1').style('text-decoration', 'line-through');
  d3.selectAll('.root').selectAll('*').remove();
  d3.selectAll('.removeButtons').selectAll('*').remove();

  var canvasHeight = $(window).height() - 20,
      canvasWidth  = $(window).width() - 20,

      graphHeight  = 300,
      graphWidth   = 800;

var canvas = d3.select('.root')
                .append('svg')
                .attr('width', canvasWidth)
                .attr('height', canvasHeight)
                .style('border', '1px solid black');

var graph = canvas.append('g')
                  .attr('width', graphWidth)
                  .attr('height', 'graphHeight')
                  .attr('transform', 'translate(' + ((canvasWidth-graphWidth)/2) + ',' + ((canvasHeight-graphHeight)/2) + ')')




// object -> symbol -> data -> timecode -> [{},{},{}]
//                          -> timecode -> [{},{},{}]
//                          -> timecode -> [{},{},{}]
//
//                  -> live -> [{},{},{}]

var rawMomentDate = moment().tz('America/New_York');
var momentDate = moment().tz('America/New_York').format();
//    "2018-05-25T17:01:08-04:00"
var nycDate = momentDate.slice(0, momentDate.length-6);     // "2018-05-25T17:01:08"

var minDate = new Date(moment.tz('America/New_York').format().slice(0,11) + '09:30:00');

function numToString(num) {
  num = num.toString();
  if (num.length > 1) {
    return num
  } else {
    return '0' + num;
  }
}

var objMinDates = {
  '1d': new Date(moment.tz('America/New_York').format().slice(0,11) + '09:30:00'),
  '1m': moment().tz('America/New_York').subtract(1, 'month'),
  '3m': moment().tz('America/New_York').subtract(3, 'month'),
  '6m': moment().tz('America/New_York').subtract(6, 'month'),
  '1y': moment().tz('America/New_York').subtract(1, 'year'),
  '2y': moment().tz('America/New_York').subtract(2, 'year'),
  '5y': moment().tz('America/New_York').subtract(5, 'year')
}

    minDate = objMinDates[timeScale];
var maxDate = new Date(moment.tz('America/New_York').format().slice(0,11) + '16:00:00');

var allMinClose = [];
var allMaxClose = [];

//get all min/max times
sublist.forEach(function (symbol, index) {
  //say each = 'aapl'
  var concatData = localData[symbol].data[timeScale].concat(localData[symbol].live);

  var minClose = concatData.reduce(function (acc, each) {
    if (each && each.close) {
      return acc < each.close ? acc : each.close;
    } else {
      return acc
    }
  });

  var maxClose = concatData.reduce(function (acc, each) {
    if (each && each.close) {
      return acc > each.close ? acc : each.close;
    } else {
      return acc;
    }
  }, 0);

  allMinClose.push(minClose);
  allMaxClose.push(maxClose);

  console.log(symbol);
  console.log(minClose, maxClose);
});

var minClose = d3.min(allMinClose);
var maxClose = d3.max(allMaxClose);

console.log('Over all min and max stocks: ');
console.log(minClose, maxClose);

var dateScale = d3.scaleTime()
                  .domain([minDate, maxDate])
                  .range([0, graphWidth]);

var closeScale = d3.scaleLinear()
                    .domain([minClose, maxClose])
                    .range([graphHeight, 0]);


var axisLeftConst = d3.axisLeft(closeScale)
                      .ticks(10);

var axisBottomConst = d3.axisBottom(dateScale)
                        .ticks(10);

var axisLeft = graph.append('g')
                      .call(axisLeftConst);

var axisBottom = graph.append('g')
                    .call(axisBottomConst)
                    .attr('transform', 'translate(0,' + (graphHeight) + ')');

// sublist = ['aapl'];
sublist.forEach(function (each, index) {
  var item = localData[each];
  if (!item.live) {item.live = []}
  console.log('PRE CONCAT', item.data[timeScale], item.live)
  var concatData = item.data[timeScale].concat(item.live);
  console.log('POST CONCAT: ', concatData);

  var sampleItemSnap =  {
    data: {
      '1d': [],
      '3y': []
    },
    live: []
  }

  var pickColor = colors[index > colors.length ? Math.floor(Math.random()*17) : index];
  console.log('COLOR PICKED: ', each, ' ', pickColor);

  var prevClose = minClose;
  var prevDate = minDate;

  var line = d3.line()
                .x(function (d) {
                  if (d && d.date) {
                    var timeCalc = new Date(d.date);
                    prevDate = new Date(d.date);
                    // console.log("DATE: ", d.date, " translates to: ", dateScale(new Date(d.date)))
                    return dateScale(timeCalc);
                  } else {
                    // console.log("DATE: ", "defaulting onto: ", prevDate, dateScale(prevDate));
                    return dateScale(prevDate);
                  }

                })
                .y(function (d) {
                  if (d && d.close) {
                    prevClose = d.close;
                    // console.log("STOCK: ", d.close, " translates to: ", closeScale(d.close));
                    return closeScale(d.close);
                  } else {
                    // console.log("STOCK: ", "defaulting onto: ", prevClose, closeScale(prevClose));
                    return closeScale(prevClose)
                  }

                });

  graph.append('path')
        .datum(concatData)
        .attr('class', 'line ' + each)
        .attr('d', line)
        .on('mouseover', function (d) {

        })
        .on('mouseout', function (d) {
          // d3.select(this).style('stroke', null);
        });


  var stockCard = d3.select('.removeButtons')
                      .append('div')
                      .attr('class', 'stockCard');

  var stockText = stockCard.append('p')
                            .text(each.toUpperCase() + ' ');

  var button = stockCard.append('button');

  button.append('i').attr('class', 'fa fa-times')
  button.attr('class', 'removeButton')
        .attr('id', each)
        .attr('onClick', 'internalRemove("' + each + '")')

  stockCard.on('mouseover', function () {
    d3.select(this).style('background-color', pickColor);
    d3.select('.line.' + each).style('stroke', pickColor)
                              .style('stroke-width', '1.5px');
  })
  .on('mouseout', function () {
    d3.select(this).style('background-color', null);
    d3.select('.line.' + each).style('stroke', null)
                              .style('stroke-width', null);
  })

});








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
    // console.log('-=-=-=--=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-==-=-=-=-=');
    var xPos = d3.mouse(this)[0];
    var yPos = d3.mouse(this)[1];
    crossHairHor.attr('y1', yPos)
                .attr('y2', yPos)
    crossHairVer.attr('x1', xPos)
                .attr('x2', xPos)

    // var xPos = d3.mouse(this)[0];
    // var scaledPos = dateScale.invert(xPos).toTimeString();
    // console.log('Scaled Position: ', typeof scaledPos, scaledPos);
    // var sampleData = localData['aapl'].data['1d'];
    //
    // var bisectDate = d3.bisector(function (d) {
    //   var arrDate = new Date(d.date).toTimeString();
    //   console.log('Return: ', typeof arrDate, arrDate);
    //   console.log(arrDate, scaledPos);
    //   console.log(arrDate == scaledPos);
    //   return arrDate;
    // }).right
    //
    // console.log('Bisect: ', typeof bisectDate(sampleData, scaledPos), bisectDate(sampleData, scaledPos, 1, 5) );
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
