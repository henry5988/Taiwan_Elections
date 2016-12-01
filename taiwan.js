var margin = {top: 10, right: 40, bottom: 150, left: 50},
    width = 1000 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var color = d3.scale.threshold()
    .domain([-40, -15, 0, 15, 40])
    .range(["#08519c","#3182bd", "#6baed6","#74c476","#31a354","#006d2c"]);

// Drawing legend
var legend = svg.append("g")
            .attr("class", "key")
            .attr("transform", "translate(0,40)");
var x = d3.scale.linear()
            .domain([-100, 100])
            .rangeRound([450, 700]);

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
    .attr("width", function(d) { return Math.abs(x(d[1]) - x(d[0])); })
    .attr("fill", function(d) { return color(d[0]); });

legend.append("text")
    .attr("class", "caption")
    .attr("x", x.range()[0]+125)
    .attr("y", -6)
    .attr("fill", "#000")
    .attr("text-anchor", "middle")
    .attr("font-weight", "bold")
    .text("Vote Difference Percentile");

legend.call(d3.svg.axis().scale(x).orient("bottom")
    .tickSize(13)
    .tickValues(color.domain()))
    .select(".domain")
    .remove();
        
legend.append("image")
    .attr("xlink:href", "http://www.memidex.com/i/80/wikimedia/kuomintang/blue-sky-white-sun.jpg")
    .attr("x", 405)
    .attr("y", -15)
    .attr("width", 40)
    .attr("height", 40);
        
legend.append("image")
    .attr("xlink:href", "https://upload.wikimedia.org/wikipedia/en/thumb/f/f9/DPP-Taiwan-old.svg/1024px-DPP-Taiwan-old.svg.png")
    .attr("x", 705)
    .attr("y", -15)
    .attr("width", 40)
    .attr("height", 40);

// Election year currently on display
var year = "election_1996.csv";
var currentYear = 1996;
var changeYear = svg.append("g")
    .attr("class", "buttons")
    .attr("transform", "translate(0,5)");
    
changeYear.append("image")
    .attr("xlink:href", "https://cdn0.iconfinder.com/data/icons/significon/512/Significon-Arrow-Right-512.png")
    .attr("height", 80)
    .attr("width", 80)
    .attr("x", 300)
    .attr("y", 0)
    .attr("fill", "#dd0000")
    .on("click", function(){
        d3.selectAll(".yearText")
            .remove();
        if(currentYear == 2016){
            currentYear = 1996;
        }else{
            currentYear += 4;
        }
        return year = "election_" + currentYear +".csv";
    });


changeYear.append("image")
    .attr("xlink:href", "https://cdn0.iconfinder.com/data/icons/significon/512/Significon-Arrow-Left-512.png")
    .attr("height", 80)
    .attr("width", 80)
    .attr("x", 100)
    .attr("y", 0)
    .attr("fill", "#dd0000")
    .on("click", function(){
        d3.selectAll(".yearText")
            .remove();
        if(currentYear == 1996){
            currentYear = 2016;
        }else{
            currentYear -= 4;
        }
        return year = "election_" + currentYear +".csv";
    });



var tooltip = d3.select("body").append("div")
    .attr("class", "hidden tooltip");

d3.json("county.json", function(error, topodata) {
    
    var features = topojson.feature(topodata, topodata.objects.twn_county).features;
    // 這裡要注意的是 topodata.objects["county"] 中的 "county" 為原本 shp 的檔名
   
   
    
    var path = d3.geo.path().projection( // 路徑產生器
        d3.geo.mercator().center([121,24]).scale(8000) // 座標變換函式
        );
        
    var counties = svg.selectAll(".counties")
        .data(features).enter();
    
    function updateMap(sourceFile){
    d3.csv(year, function(data)
        {
        if(year == "election_1996.csv"){
            data.forEach(function(d){
                China_National_Party = +d.China_National_Party,
                Democratic_Progressive_Party = +d.Democratic_Progressive_Party,
                other_1 = +d.Other_1,
                other_2 = +d.Other_2
            });
        }else{
            data.forEach(function(d){
                China_National_Party = +d.China_National_Party,
                Democratic_Progressive_Party = +d.Democratic_Progressive_Party,
                other = +d.other
            });
        }
        console.log(data);
        

        
        d3.select("svg").selectAll("path").data(features)
            .enter().append("path").attr("d",path);
    
        for(i=0 ; i < features.length -1 ; i++){
            console.log(features[i].properties.countyname);
            for(j = 0; j< features.length -1; j++){
                if(features[i].properties.countyname == data[j].County){
                    features[i].properties.vote = data[j].Democratic_Progressive_Party - data[j].China_National_Party;
                    console.log(features[i].properties.vote);
                }
            }
        }
    
       
        
        d3.select("svg").selectAll("path").data(features).attr
            ({
                data: path,
                fill: function(d){
                    return color(d.properties.vote);
                }
            })
            .on("mouseover", function(d){
                d3.select("#tooltip")
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY) + "px")
                    .select("#out")
                    .html(function(d){
                        return("<p>" + d.County + "</p> <p>Chinese Nationalist Party:  " + d.China_National_Party + "% </p> <p>Democratic Progressive Party: " + d.Democratic_Progressive_Party + "% </p>")
                });
            d3.select(".tooltip").classed("hidden", false);
            })
            .on("mouseout", function(){
                d3.select(".tooltip").classed("hidden", true);
            });
        
        changeYear.append("text")
           .attr("class", "yearText")
           .attr("x", 340)
           .attr("y", 45)
           .attr("text-anchor", "middle")
           .style("opacity", 0)
           .transition().duration(200)
           .style("opacity", 1)    
           .text(function(){
                if(currentYear == 2016){
                    return "end";
                }else{
                    return currentYear + 4;
                }
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
        
        changeYear.append("text")
            .attr("class", "yearText")
            .attr("x", 145)
            .attr("y", 45)
            .style("text-anchor", "middle")
            .style("opacity", 0)
            .transition().duration(200)
            .style("opacity", 1)
            .text(function(){
                 if(currentYear == 1996){
                     return "end";
                 }else{
                     return currentYear - 4;
                 }
            });
        })
    }
    updateMap(year);
    
    d3.select(".buttons").on("click", function(){
        updateMap(year);
    })
});