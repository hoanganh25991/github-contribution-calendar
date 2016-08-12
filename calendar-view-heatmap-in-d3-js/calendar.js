var width = 900,
height = 105;

chart = d3.select('body') 
        .append('svg')
        .attr('class', 'chart')
        .attr('width', width)
        .attr('height', height)

.chart {
  background: #fff;
  margin: 5px;
}

var cellSize = 17;
var percent = d3.format(".1%"),
	format = d3.time.format("%Y%m%d");