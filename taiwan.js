// Define the margin
var margin = {top: 10, right: 40, bottom: 50, left: 50},
    width = 1000 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

// Appending svg canvas
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Variable to auto-update data.
var inter, handle;

// Tooltip
var tooltip = d3.select("body").append("div")
    .attr("class", "hidden tooltip");

// Election year currently on display
var year = "election_1996.csv";
var currentYear = 1996;
var changeYear = svg.append("g")
    .attr("class", "buttons")
    .attr("transform", "translate(0,5)");

// Assigning color scale
var color = d3.scale.threshold()
    .domain([-50, -30, -20, -10, 0, 10, 20, 30, 50])
    .range(["#08519c","#3182bd", "#6baed6", "#9ecae1", "#c6dbef","#c7e9c0", "#a1d99b", "#74c476","#31a354","#006d2c"]);

// Define slider
var s1 = slider();

// Defining legend, which shows the vote difference between the two parties
var legend = svg.append("g")
            .attr("class", "key")
            .attr("transform", "translate(0,40)");

// Scale used by the legend
var x = d3.scale.linear()
            .domain([-60, 60])
            .rangeRound([450, 700]);

// Scale used to display text label under the legend ticks
var legendText = d3.scale.ordinal()
                     .domain([" ","50 ", "30 ", "20 ", "0", "20", "30", "50", ""].map(function (d) {return d;}))
                     .rangeRoundPoints([450, 700]);

// Draw legend
legend.selectAll("rect")
    .data(color.range().map(function(d) {
        d = color.invertExtent(d);
        if (d[0] == null) d[0] = x.domain()[0];
        if (d[1] == null) d[1] = x.domain()[1];
        return d;
    }))
    .enter().append("rect")
    .attr("height", 10)
    .attr("x", function(d) { return x(d[0]); })
    .attr("width", function(d) { return x(d[1]) - x(d[0]); })
    .attr("fill", function(d) { return color(d[0]); });

// Append legend caption
legend.append("text")
    .attr("class", "caption")
    .attr("x", x.range()[0]+125)
    .attr("y", -6)
    .attr("fill", "#000")
    .attr("text-anchor", "middle")
    .attr("font-weight", "bold")
    .text("Vote Difference Percentile");

// Draw legend labels
legend.call(d3.svg.axis().scale(legendText).orient("bottom")
    .tickSize(13))
    .select(".domain")
    .remove();

// Chinese Nationalist Party logo near the legend
legend.append("image")
    .attr("xlink:href", "http://www.memidex.com/i/80/wikimedia/kuomintang/blue-sky-white-sun.jpg")
    .attr("x", 405)
    .attr("y", -15)
    .attr("width", 40)
    .attr("height", 40);

// Nationalist party logo caption
legend.append("text")
    .attr("class", "KMTCaption")
    .attr("x", 340)
    .attr("y", 50)
    .attr("width", 40)
    .text("Chinese Nationalist Party");

// Democratic Progressive Party logo near the legend
legend.append("image")
    .attr("xlink:href", "https://upload.wikimedia.org/wikipedia/en/thumb/f/f9/DPP-Taiwan-old.svg/1024px-DPP-Taiwan-old.svg.png")
    .attr("x", 705)
    .attr("y", -15)
    .attr("width", 40)
    .attr("height", 40);

// Democratic Progressive Party logo caption
legend.append("text")
    .attr("class", "DPPCaption")
    .attr("x", 630)
    .attr("y", 50)
    .attr("width", 40)
    .text("Democratic Progressive Party");

d3.json("county.json", function(error, topodata) {
    
    var features = topojson.feature(topodata, topodata.objects.twn_county).features;
    // In topodata.objects["county"], "county" is the name of the .shp file.
   
    var path = d3.geo.path().projection(
        d3.geo.mercator().center([121,24]).scale(8000)
        );
        
    var counties = svg.selectAll(".counties")
        .data(features).enter();
    
    // Year Changes
    // Button that starts time
    changeYear.append("image")
        .attr("id", "start")
        .attr("class", "hidden")
        .classed("hidden", false)
        .attr("xlink:href","https://cdn3.iconfinder.com/data/icons/technology-internet-and-communication/100/technology_internet_communications20-512.png")
        .attr("height", 40)
        .attr("width", 40)
        .attr("x",35)
        .attr("y", 65)
        .on("click", function(d){
            inter = setInterval(function(){
                if(currentYear != 2016){
                    currentYear += 4;
                    year = "election_" + currentYear +".csv";
                    updateMap(year);
                    handle.attr("cx", function(){
                        return x(currentYear);
                    });
                }else{
                    d3.select("#restart").classed("hidden", false);
                    d3.select("#pause").classed("hidden", true);
                    clearInterval(inter);
                }
            }, 2000);
            d3.select("#pause").classed("hidden", false);
            d3.select("#start").classed("hidden", true);
            //d3.select("#yearSlider").append("svg").call(s1);
    });
    changeYear.append("image")
        .attr("id", "restart")
        .attr("class", "hidden")
        .attr("xlink:href","http://www.clipartbest.com/cliparts/niE/X5x/niEX5xpKT.png")
        .attr("height", 60)
        .attr("width", 60)
        .attr("x",28)
        .attr("y", 55)
        .on("click", function(d){
            clearInterval(inter);
            currentYear = 1996;
            year = "election_" + currentYear +".csv";
            updateMap(year);
            d3.select("#pause").classed("hidden", true);
            d3.select("#start").classed("hidden", false);
            d3.select("#restart").classed("hidden", true);
    });    
    

// pause button
var pause = changeYear.append("image")
    .attr("class", "hidden")
    .attr("id", "pause")
    .attr("xlink:href", "https://cdn3.iconfinder.com/data/icons/buttons/512/Icon_4-512.png")
    .attr("height", 30)
    .attr("width", 30)
    .attr("x",40)
    .attr("y", 70)
    .on("click", function(d){
            clearInterval(inter);
            d3.select("#pause").classed("hidden", true);
            d3.select("#start").classed("hidden", false);
    });
    
    // Slider
    s1.callback(function(){sliderBind(s1);})
    d3.select("#yearSlider").append("svg").call(s1);
    
    // Update Map function to re-draw the map
    function updateMap(sourceFile){
    d3.csv(year, function(data)
        {
        d3.selectAll(".county")
                .remove();
        d3.selectAll(".yearText")
                .remove();
        if(year == "election_1996.csv"){
            data.forEach(function(d){
                China_National_Party = +d.China_National_Party,
                Democratic_Progressive_Party = +d.Democratic_Progressive_Party,
                Blue_Vote = +d.Blue_Vote,
                Green_Vote = +d.Green_Vote,
                other_1 = +d.Other_1,
                other_2 = +d.Other_2
            });
        }else{
            data.forEach(function(d){
                China_National_Party = +d.China_National_Party,
                Democratic_Progressive_Party = +d.Democratic_Progressive_Party,
                Blue_Vote = +d.Blue_Vote,
                Green_Vote = +d.Green_Vote,
                other = +d.other
            });
        }
        console.log(data); 
        
        // Draw Map
        var counties = svg.selectAll(".county").data(features)
            .enter();
        
    
        for(i=0 ; i < features.length -1 ; i++){
            console.log(features[i].properties.countyname);
            for(j = 0; j< features.length -1; j++){
                if(features[i].properties.countyname == data[j].County){
                    features[i].properties.vote = ((data[j].Green_Vote - data[j].Blue_Vote)/(data[j].Blue_Vote))*100;
                    features[i].properties.englishName = data[j].English_Name;
                    features[i].properties.blueVote = data[j].Blue_Vote;
                    features[i].properties.greenVote = data[j].Green_Vote;
                    console.log(features[i].properties.vote);
                }
            }
        }
        
        counties.append("path")
            .attr("class", "county")
            .attr
            ({
                data: path,
                fill: function(d){
                    return color(d.properties.vote);
                }
            })
            .attr("d",path)
            .on("mousemove", function(d){
                var mouse = d3.mouse(svg.node())
                    .map(function(d) {
                        return parseInt(d);
                    });
                tooltip.classed("hidden", false)
                    .attr('style', 'left:' + (mouse[0] + -10) +
                                'px; top:' + (mouse[1] + 150) + 'px')
                    .html("<div class=\"container\">\
                               <div class=\"column-left\"> \
                                   <p style=\"color:#880000\">" + d.properties.englishName + " (" + d.properties.countyname + ")" + "</p> \
                                   <p>Overall Vote Difference </p> \
                                   <p>Chinese Nationalist Party Vote </p> \
                                   <p>Democratic Progressive Party Vote</p></div>" +
                              "<div class=\"column-center\" align=\"center\"> \
                                   <br><p>:</p><p>:</p><p>:</p></div>" + 
                              "<div class=\"column-right\" align=\"right\"> \
                                   <br><p>" + Math.round(Math.abs(d.properties.vote) * 10)/10 + "%</p> \
                                   <p>" + d.properties.blueVote + " votes</p> \
                                   <p>" + d.properties.greenVote+ " votes</p>" +
                               "</div>" +
                          "</div>");
            })
            .on("mouseout", function(){
                d3.select(".tooltip").classed("hidden", true);
            });
        
        changeYear.append("text")
            .attr("class", "yearText")
            .attr("id", "currentYear")
            .attr("x", 242)
            .attr("y", 52)
            .attr("text-anchor", "middle")
            .style("opacity", 0)
            .transition().duration(200)
            .style("opacity", 1)
            .text(currentYear);
        })
    }
    updateMap(year);
    
    d3.select(".buttons").on("click", function(){
        updateMap(year);
    })
    
    function sliderBind(src){
        switch(src.value()){
            case 1996:
                currentYear = 1996;
                break;
            case 2000:
                currentYear = 2000;
                break;
            case 2004:
                currentYear = 2004;
                break;
            case 2008:
                currentYear = 2008;
                break;
            case 2012:
                currentYear = 2012;
                break;
            case 2016:
                currentYear = 2016;
                break;
        }
        
        year = "election_" + currentYear +".csv";
        updateMap(year);
    }
});

function slider()
{
    var margin = {top: 5, left: 15, right: 20, bottom: 5},
        width  = 350 - margin.left - margin.right,
        height = 50  - margin.top  - margin.bottom,
        brush  = d3.svg.brush(),
        slider,
        value  = 0,
        upd    = function(d){value = d;},
        cback  = function(d){};

    var x = d3.scale.linear()
        .domain([1996,2016])
        .range ([0,width])
        .clamp(true);

    function chart(el)
    {

        brush.x(x).extent([0,0])
             .on("brush", brushed);

        var svg = el.attr("width",  width  + margin.left + margin.right)
            .attr("height", height + margin.top  + margin.bottom)
            .append("g").attr("transform","translate(" + margin.left + "," + margin.top + ")");

        svg.append("g")
           .attr("class","x axis")
           .attr("transform", "translate(0,"+height/2+")")
           .call(d3.svg.axis().scale(x)
                 .orient("bottom")
                 .tickFormat(d3.format("d"))
                 .tickValues([1996, 2000, 2004, 2008, 2012, 2016])
                 .tickSize(0)
                 .tickPadding(12));

        slider = svg.append("g")
            .attr("class","slider")
            .call(brush);

        slider.selectAll(".extent,.resize").remove();
        slider.select(".background").attr("height",height)

        handle = slider.append("circle")
            .attr("class","handle")
            .attr("transform", "translate(0,"+height/2+")")
            .attr("cx",x(value))
            .attr("r",9);

        function brushed()
        {
            if (d3.event.sourceEvent) value = x.invert(d3.mouse(this)[0]);
            upd(value);
            cback();
        }
        upd = function(v)
        {
            brush.extent([v,v]);
            if(value<1998){
                    value = 1996;
                }else if(value>=1998 && value<2002){
                    value = 2000;
                }else if(value>=2002 && value<2006){
                    value = 2004;
                }else if(value>=2006 && value<2010){
                    value = 2008;
                }else if(value>=2010 && value<2014){
                    value = 2012;
                }else{
                    value = 2016;
                }
            //value = brush.extent()[0];
            handle.attr("cx", function(){
                return x(value);
            });
        }
    }

    chart.margin   = function(_) { if (!arguments.length) return margin;  margin = _; return chart; };
    chart.callback = function(_) { if (!arguments.length) return cback;    cback = _; return chart; };
    chart.value    = function(_) { if (!arguments.length) return value;       upd(_); return chart; };

    return chart;
}
