// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 700;

var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
    .select("div#scatter")
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
    .classed("svg-content", true);

// Append an SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenXAxis]) * 0.70,
        d3.max(data, d => d[chosenXAxis]) * 1.1
        ])
        .range([0, width]);

    return xLinearScale;

}

function yScale(data, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenYAxis]) * 0.70, 
        d3.max(data, d => d[chosenYAxis]) * 1.1
        ])
        .range([height, 0]);

    return yLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderxAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

function renderyAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderxCircles(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));

    return circlesGroup;
}

function renderyCircles(circlesGroup, newYScale, chosenYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
}

function renderxText(circlesText, newXScale, chosenXAxis) {

    circlesText.transition()
        .duration(1000)
        .attr("dx", d => newXScale(d[chosenXAxis]) - 6.75);

    return circlesText;
}

function renderyText(circlesText, newYScale, chosenYAxis) {

    circlesText.transition()
        .duration(1000)
        .attr("dy", d => newYScale(d[chosenYAxis]) + 3.5);

    return circlesText;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    if (chosenXAxis === "poverty") {
        var xlabel = "Poverty: ";
    }
    else if (chosenXAxis === "age") {
        var xlabel = "Age: ";
    }
    else {
        var xlabel = "Household Income: ";
    }

    if (chosenYAxis === "healthcare") {
        var ylabel = "Lacks Healthcare: ";
    }
    else if (chosenYAxis === "smokes") {
        var ylabel = "Smoking: ";
    }
    else {
        var ylabel = "Obesity: ";
    }

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .html(function (d) {
            return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function (entry) {
        toolTip.show(entry);
    })
        // onmouseout event
        .on("mouseout", function (entry, index) {
            toolTip.hide(entry);
        });

    return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv", function (err, data) {
    if (err) throw err;

    // parse data
    data.forEach(function (entry) {
        entry.poverty = +entry.poverty;
        entry.age = +entry.age;
        entry.income = +entry.income;
        entry.healthcare = +entry.healthcare;
        entry.obesity = +entry.obesity;
        entry.smokes = +entry.smokes;
    });

    // xLinearScale function above csv import
    var xLinearScale = xScale(data, chosenXAxis);

    // Create y scale function
    var yLinearScale = yScale(data, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    // append initial circles   
    var circlesGroup = chartGroup.append("g")
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "stateCircle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 15);

    // append initial text on circles
    var circlesText = chartGroup.append("g")
        .selectAll("text")
        .data(data)
        .enter()
        .append('text')
        .text(d => d.abbr)
        .attr("class", "stateText")
        .attr("font-size", 10)
        .attr("dx", d => xLinearScale(d[chosenXAxis]) - 6.75)
        .attr("dy", d => yLinearScale(d[chosenYAxis]) + 3.5);

    // Create group for  3 x- axis labels
    var xlabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("class", "aText")
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In Poverty (%)");
        
    var ageLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("class", "aText")
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age (Median)");

    var incomeLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("class", "aText")
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Household Income (Median)");

    // Create group for  3 y- axis labels
    var ylabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)");

    var healthcareLabel = ylabelsGroup.append("text")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "4em")
        .attr("class", "aText")
        .attr("value", "healthcare")
        .classed("active", true)
        .text("Lacks Healthcare (%)");

    var smokesLabel = ylabelsGroup.append("text")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "2.5em")
        .attr("class", "aText")
        .attr("value", "smokes")
        .classed("inactive", true)
        .text("Smokes (%)");

    var obesityLabel = ylabelsGroup.append("text")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("class", "aText")
        .attr("value", "obesity")
        .classed("inactive", true)
        .text("Obese (%)");

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x axis labels event listener
    xlabelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var xvalue = d3.select(this).attr("value");
            if (xvalue !== chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = xvalue;

                // console.log(chosenXAxis)

                // functions here found above csv import
                // updates x scale for new data
                xLinearScale = xScale(data, chosenXAxis);

                // updates x axis with transition
                xAxis = renderxAxes(xLinearScale, xAxis);

                // updates circles with new x values
                circlesGroup = renderxCircles(circlesGroup, xLinearScale, chosenXAxis);

                // updates text with new x values
                circlesText =  renderxText(circlesText, xLinearScale, chosenXAxis)

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // changes classes to change bold text
                if (chosenXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenXAxis === "age") {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });

    ylabelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var yvalue = d3.select(this).attr("value");
            if (yvalue !== chosenYAxis) {

                // replaces chosenYAxis with value
                chosenYAxis = yvalue;

                // functions here found above csv import
                // updates y scale for new data
                yLinearScale = yScale(data, chosenYAxis);

                // updates y axis with transition
                yAxis = renderyAxes(yLinearScale, yAxis);

                // updates circles with new y values
                circlesGroup = renderyCircles(circlesGroup, yLinearScale, chosenYAxis);

                // updates text with new y values
                circlesText =  renderyText(circlesText, yLinearScale, chosenYAxis)

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenYAxis, chosenYAxis, circlesGroup);

                // changes classes to change bold text
                if (chosenYAxis === "healthcare") {
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenYAxis === "smokes") {
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obesityLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });
});