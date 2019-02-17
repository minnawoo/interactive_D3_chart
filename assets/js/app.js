var svgWidth = 800;
var svgHeight = 600;

// Set margins
var margin = {
  top: 50,
  right: 50,
  bottom: 100,
  left: 100
};

// Set chart width and height
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select(".chart").append("svg").attr("width", svgWidth).attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

//// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// Function used for updating x-scale var upon click on axis label
function xScale(stateData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(stateData, d => d[chosenXAxis]) * 0.8, d3.max(stateData, d => d[chosenXAxis]) * 1.2]) // Add space so circles don't overlap on axes
    .range([0, width]);
  return xLinearScale;
}

// Function used for updating xAxis variable upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);
  return xAxis;
}

// Function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXaxis, chosenYaxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("transform", d => "translate("+newXScale(d[chosenXAxis])+","+newYScale(d[chosenYAxis])+")");
    //.attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

var toolTip = d3.tip()

// Function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  if (chosenXAxis === "age") {
    var label = "Age (Median):";
  }
  else {
    var label = "In Poverty:";
  }

  toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([100, 0])
    .html(function(d) {
      return (`${d.state}<br>${label} ${d[chosenXAxis]}%<br>Lacks Healthcare: ${d[chosenYAxis]}%`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data, this);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data, this);
    });

  return circlesGroup;
}

// Import Data
d3.csv("./assets/data/data.csv").then(function(stateData) {

	console.log(stateData);

  // Step 1: Parse Data/Cast as numbers
  // ==============================
  stateData.forEach(function(data) {
    data.poverty = parseFloat(data.poverty);
    data.healthcare = parseFloat(data.healthcare);
    data.age = parseFloat(data.age);
  });

  // Step 2: Create scale functions
  // ==============================
  // // Non-bonus
  // var xLinearScale = d3.scaleLinear()
  //   .domain(d3.extent(stateData, d => d.poverty).map((a, i) => a + [-1, 1][i])) 
  //   .range([0, width]);

  // Bonus:
  // xLinearScale function above csv import
  var xLinearScale = xScale(stateData, chosenXAxis);

  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(stateData, d => d.healthcare) + 1]) // Add space to top so circles do not overlap the chart "boundaries"
    .range([height, 0]);

  // Step 3: Create Initial Axis Functions
  // ==============================
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // Step 4: Append Axes to the chart
  // ==============================
  // // Non-bonus:
  // chartGroup.append("g")
  //   .attr("transform", `translate(0, ${height})`)
  //   .call(bottomAxis);

  // Append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // Append y axis
  chartGroup.append("g")
    .call(leftAxis);

  // Step 5: Create Initial Circles
  // ==============================
  // Create and place the svg groups containing the circle and the text 
  var circlesGroup = chartGroup.selectAll("g")
    .data(stateData)
    .enter()
    .append("g")
    .attr("transform", d => "translate("+xLinearScale(d.poverty)+","+yLinearScale(d.healthcare)+")");

  // Create the circle for each group
  var circles = circlesGroup.append("circle")
    .classed("stateCircle", true)
    .attr("r", "15");

  // Create the text for each group
  circlesGroup.append("text")
    .attr("dy", 6)
    .classed("stateText", true)
    .text(d => d.abbr);

  // // Non-bonus:
  // // Step 6: Initialize tool tip
  // // ==============================
  // var toolTip = d3.tip()
  //   .attr("class", "d3-tip")
  //   .offset([100, 0])
  //   .html(function(d) {
  //     return (`${d.state}<br>In Poverty: ${d.poverty}%<br>Lacks Healthcare: ${d.healthcare}%`);
  // });

  // // Step 7: Create tooltip in the chart
  // // ==============================
  // chartGroup.call(toolTip);
  
  // // Step 8: Create event listeners to display and hide the tooltip
  // // ==============================
  // circlesGroup
  //   .on("mouseover", function(data) {
  //     toolTip.show(data, this);
  //   })
  //   // onmouseout event
  //   .on("mouseout", function(data, index) {
  //     toolTip.hide(data);
  //   });

  // Create and append group for 2 x-axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 40})`);

  var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

	// Append y axis label
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left + 50)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("aText", true)
    .text("Lacks Healthcare (%)");
  // // Non-bonus:
  // chartGroup.append("text")
  //   .attr("transform", `translate(${width / 2}, ${height + 40})`)
  //   .classed("aText", true)
  //   .text("In Poverty (%)");

  // Create chart title
  chartGroup.append("text")
    .attr("transform", `translate(${width/2 - 200}, ${-20})`)
    .classed("title-text", true)
    .text("Scatter Plot of Health Indicators by U.S. State");

  // Call updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // X-axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXaxis with value
        chosenXAxis = value;

        // TODO: Replace chosenYaxis with value
        chosenYAxis = 'healthcare';

        console.log(chosenXAxis)

        // Update x scale for new data
        xLinearScale = xScale(stateData, chosenXAxis);

        // Update x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // Update circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        // Update tooltip with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // Change classes to change bold text (axes)
        if (chosenXAxis === "age") {
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
});