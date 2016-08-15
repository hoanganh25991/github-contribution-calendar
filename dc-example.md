#table

	var datatable   = dc.dataTable("#dc-data-table");
	datatable
	    .dimension(dateDim)
	    .group(function(d) {return d.Year;})
	    // dynamic columns creation using an array of closures
	    .columns([
	        function(d) { return d.date.getDate() + "/" + (d.date.getMonth() + 1) + "/" + d.date.getFullYear(); },
	        function(d) {return d.http_200;},
	        function(d) {return d.http_302;},
	        function(d) {return d.http_404;},        
	        function(d) {return d.total;}
	    ]);

#scale x only for this filter

	#hitslineChart	
	hitslineChart
		.width(500).height(200)
		.dimension(dateDim)
		.group(hits)
		.x(d3.time.scale().domain([minDate,maxDate]));

#melt

	var ndx2 = crossfilter(melt(data,["date"],"status"));
	var meltedDim  = ndx2.dimension(function(d) {return d.status;});
	print_filter("meltedDim");

	#result
	var data = [
    {date: "12/27/2012", http_404: 2, http_200: 190, http_302: 100},
    {date: "12/28/2012", http_404: 2, http_200: 10, http_302: 100},
    {date: "12/29/2012", http_404: 1, http_200: 300, http_302: 200},
    {date: "12/30/2012", http_404: 2, http_200: 90, http_302: 0},
    {date: "12/31/2012", http_404: 2, http_200: 90, http_302: 0},
    ]; 

    #>>>>>>>>>>>>>>
    meltedDim(36) = [
    {"status":"http_404","value":2,"_id":7,"date":"01/03/2013"},
    {"status":"http_404","value":2,"_id":1,"date":"12/28/2012"},
    {"status":"http_404","value":1,"_id":11,"date":"01/07/2013"},
    {"status":"http_404","value":2,"_id":3,"date":"12/30/2012"},
    {"status":"http_404","value":2,"_id":0,"date":"12/27/2012"},
    {"status":"http_404","value":2,"_id":10,"date":"01/06/2013"},
    {"status":"http_404","value":1,"_id":2,"date":"12/29/2012"},
    {"status":"http_404","value":2,"_id":4,"date":"12/31/2012"},
    {"status":"http_404","value":2,"_id":9,"date":"01/05/2013"},
    {"status":"http_404","value":2,"_id":5,"date":"01/01/2013"},
    {"status":"http_404","value":1,"_id":6,"date":"01/02/2013"},
    {"status":"http_404","value":2,"_id":8,"date":"01/04/2013"},
    {"status":"http_302","value":0,"_id":9,"date":"01/05/2013"},
    {"status":"http_302","value":100,"_id":0,"date":"12/27/2012"}
    ]

#reduce many times

	var tableGroup = dateDim.group().reduce(
	  function reduceAdd(p,v) {
	    p[v.status] = v.hits;
	    p["Year"]= v.Year;
	    return p;
	  },
	  function reduceRemove(p,v) {
	    p[v.status] = 0;
	    p["Year"]=v.Year;
	    
	    return p;
	  },
	  function reduceInitial() { return {}; }
	); 

	#result >>>>>>>
	"tableGroup(12) = [
	   {"key":"2012-12-28T05:00:00.000Z","value":{"http_302":100,"Year":2012,"http_200":10,"http_404":2}},
	   {"key":"2012-12-29T05:00:00.000Z","value":{"http_302":200,"Year":2012,"http_200":300,"http_404":1}},
	   {"key":"2012-12-30T05:00:00.000Z","value":{"http_200":90,"Year":2012,"http_404":2,"http_302":0}},
	   {"key":"2012-12-31T05:00:00.000Z","value":{"http_302":0,"Year":2012,"http_200":90,"http_404":2}},
	   {"key":"2013-01-01T05:00:00.000Z","value":{"http_302":0,"Year":2013,"http_200":90,"http_404":2}}
		]

#reduce function xyz ReduceAdd|ReduceRemove|ReduceInitialize

	Reduce is able to flatten a dataset into key value pairs similar to the

	reduceSum function we've been using. ReduceInitial allows you to set the 

	initial state of any variables like setting them to 0. ReduceAdd and 

	ReduceRemove let's you alter items being added or subtracted from the filter 

	such as when someone clicks on our dc.js pie chart. P is the value object we 
	
	are reducing to and v is the current object. Basically, we want to have an 

	entry of each status type equal to what its 'hits' is. When that object is 

	filtered out, we want to set it to 0.

/************
JQuery updates
*************/

	$('#chart-ring-year').on('click', function(){
	    var minDate2 = dateDim.bottom(1)[0].date;
	    var maxDate2 = dateDim.top(1)[0].date;
	    hitslineChart.x(d3.time.scale().domain([minDate2,maxDate2]));
	    hitslineChart.redraw();
	});

#d3 decorate

	.margins({ top: 10, left: 50, right: 10, bottom: 50 })    
	.legend(dc.legend().x(60).y(10).itemHeight(13).gap(5))
	.renderlet(function (chart) {chart.selectAll("g.x text").attr('dx', '-30').attr(
	  'dy', '-7').attr('transform', "rotate(-90)");}) 

#custom title

	.title(function(d){ return getvalues(d);} )

	#code
	function getvalues(d){
	    var str=d.key.getDate() + "/" + (d.key.getMonth() + 1) + "/" + d.key.getFullYear()+"\n";
	    var key_filter = dateDim.filter(d.key).top(Infinity);
	    var total=0
	    key_filter.forEach(function(a) {
	        str+=a.status+": "+a.hits+" Hit(s)\n";
	        total+=a.hits;
	    });

	    str+="Total:"+total;
	    //remove filter so it doesn't effect the graphs,
	    //this is the only filter so we can do this
	    dateDim.filterAll();
	    return str;
	}

	#It's possible to set your own custom-looking point labels to give them a little more style. To do this, you'll need to turn off the charts titles with the following  

	.renderTitle(false)

#resue parse day

	var parseDate = d3.time.format("%m/%d/%Y").parse;

#color

	var compose1 = dc.lineChart(hitslineChart_q1)
                .dimension(hits)
                .ordinalColors(["#56B2EA","#E064CD","#F8B700","#78CC00","#7B71C5"])
                .renderArea(true)
                .group(hits_2011, "2011")
                .stack(hits_2012,"2012")
                .stack(hits_2013,"2013");

#css work with dc

#dc selector

	.dc-chart g.deselected path {
	opacity: .5;
    fill-opacity: .5;
	}

	.dc-chart .pie-slice :hover {
	    fill-opacity: .8;
	}

	.dc-chart .pie-slice.highlight {
	    fill-opacity: .8;
	}