var svgWidth = 800;
var svgHeight = 600;

// Set margins
var margin = {
  top: 40,
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

// Bonus:
//// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// Function used for updating x-scale var upon click on axis label
function xScale(stateData, chosenXAxis) {

  // Create x scale
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(stateData, d => d[chosenXAxis]) * 0.8, d3.max(stateData, d => d[chosenXAxis]) * 1.2]) // Add space so circles don't overlap on axes
    .range([0, width]);
  return xLinearScale;
}

// Function used for updating y-scale var upon click on axis label
function yScale(stateData, chosenYAxis) {

  // Create y scale
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(stateData, d => d[chosenYAxis]) * 0.9, d3.max(stateData, d => d[chosenYAxis]) * 1.1]) // Add space to top so circles do not overlap the chart "boundaries"
    .range([height, 0]);
  return yLinearScale;
}

// Function used for updating xAxis variable upon click on axis label
function renderXAxis(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);
  return xAxis;
}

// Function used for updating yAxis variable upon click on axis label
function renderYAxis(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);
  yAxis.transition()
    .duration(1000)
    .call(leftAxis);
  return yAxis;
}

// Function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXaxis, chosenYaxis) {
  circlesGroup.transition()
    .duration(1000)
    .attr("transform", d => "translate("+newXScale(d[chosenXAxis])+","+newYScale(d[chosenYAxis])+")");
  return circlesGroup;
}

// Function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
  if (chosenXAxis === "income") {
    var xlabel = "Household Income (Median): $";
    var xUnit = "";
  }
  else if (chosenXAxis === "age") {
  	var xlabel = "Age (Median): ";
  	var xUnit = "";
  }
  else {
    var xlabel = "In Poverty: ";
    var xUnit = "%";
  }

  if (chosenYAxis === "obesity") {
    var ylabel = "Obese:";
  }
  else if (chosenYAxis === "smokes") {
    var ylabel = "Smokes:";
  }
  else {
    var ylabel = "Lacks Healthcare:";
  }

  toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([100, 0])
    .html(function(d) {
      return (`${d.state}<br>${xlabel}${d[chosenXAxis]}${xUnit}<br>${ylabel} ${d[chosenYAxis]}%`);
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

// Function to update the paragraph text
function updateParagraphText(chosenXAxis, chosenYAxis) {
	if (chosenXAxis === "income") {
    var xdescrip = "the median household income";
    var xlabel = "income";
    var pattern = "downwards to the right shows a negative correlation";
  }
  else if (chosenXAxis === "age") {
  	var xdescrip = "the median age";
  	var xlabel = "age";
  	var pattern = "downwards to the right shows a negative correlation";
  }
  else {
    var xdescrip = "the percentage of those who are in poverty";
    var xlabel = "poverty";
    var pattern = "upwards to the right shows a positive correlation";
  }

  if (chosenYAxis === "obesity") {
    var ydescrip = "who are obese";
    var ylabel = "obesity";
  }
  else if (chosenYAxis === "smokes") {
    var ydescrip = "who smoke";
    var ylabel = "smoking";
    if (chosenXAxis === "age") { var pattern = "upwards to the right shows a positive correlation"; }
  }
  else {
    var ydescrip = "lacking healthcare";
    var ylabel = "lack of healthcare";
  }

  var descrip = `Currently, the chart plots the percentage of those ${ydescrip} against ${xdescrip}.`;
  d3.select("#descrip").text(descrip);

  var analysis = `The pattern of circles slanting ${pattern} between ${ylabel} and ${xlabel}.`
  d3.select("#analysis").text(analysis);
}

// Import Data
d3.csv("../static/data/data.csv").then(function(stateData) {

	console.log(stateData);

  // Step 1: Parse Data/Cast as numbers
  // ==============================
  stateData.forEach(function(data) {
    data.poverty = parseFloat(data.poverty);
    data.healthcare = parseFloat(data.healthcare);
    data.age = parseFloat(data.age);
    data.income = +data.income;
    data.smokes = parseFloat(data.smokes);
    data.obese = parseFloat(data.obese);
  });

  // Step 2: Create scale functions
  // ==============================
  // // Non-bonus
  // var xLinearScale = d3.scaleLinear()
  //   .domain(d3.extent(stateData, d => d.poverty).map((a, i) => a + [-1, 1][i])) 
  //   .range([0, width]);

  // var yLinearScale = d3.scaleLinear()
  //   .domain([0, d3.max(stateData, d => d.healthcare) + 1]) // Add space to top so circles do not overlap the chart "boundaries"
  //   .range([height, 0]);

  // Bonus:
  // xLinearScale function above csv import
  var xLinearScale = xScale(stateData, chosenXAxis);

	// yLinearScale function above csv import
  var yLinearScale = yScale(stateData, chosenYAxis);

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

  // // Append y axis
  // chartGroup.append("g")
  //   .call(leftAxis);

  // Bonus:
  // Append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // Append y axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
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

  // Create chart title
  chartGroup.append("text")
    .attr("transform", `translate(${width/2 - 175}, ${-20})`)
    .classed("title-text", true)
    .text("Scatter Plot of Indicators by U.S. State");

  // // Non-bonus:
  // chartGroup.append("text")
  //   .attr("transform", `translate(${width / 2}, ${height + 40})`)
  //   .classed("aText", true)
  //   .text("In Poverty (%)");

  // Bonus:
  // Create and append group for 2 x-axis labels
  var xLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  var incomeLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

 // // Non-bonus
 // // Append y axis label
 //  chartGroup.append("text")
 //    .attr("transform", "rotate(-90)")
 //    .attr("y", 0 - margin.left + 50)
 //    .attr("x", 0 - (height / 2))
 //    .attr("dy", "1em")
 //    .classed("aText", true)
 //    .text("Lacks Healthcare (%)");

 	// Bonus:
 	// Create and append group for 2 x-axis labels
  var yLabelsGroup = chartGroup.append("g")
    .attr("transform", `rotate(-90) translate(-225, -15)`)
    .attr("dy", "1em");

  var healthcareLabel = yLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", -20)
    .attr("value", "healthcare") // value to grab for event listener
    .classed("active", true)
    .text("Lacks Healthcare (%)");

  var smokesLabel = yLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", -40)
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("Smokes (%)");

  var obesityLabel = yLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", -60)
    .attr("value", "obesity") // value to grab for event listener
    .classed("inactive", true)
    .text("Obese (%)");

  // Call updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // X-axis labels event listener
  xLabelsGroup.selectAll("text")
    .on("click", function() {

      // Get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXaxis with value
        chosenXAxis = value;

        console.log(chosenXAxis)

        // Update x scale for new data
        xLinearScale = xScale(stateData, chosenXAxis);

        // Update x axis with transition
        xAxis = renderXAxis(xLinearScale, xAxis);

        // Update circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        // Update tooltip with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // Change classes to change bold text (axes)
        if (chosenXAxis === "income") {
        	incomeLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
        	incomeLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);       
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
        	incomeLabel
            .classed("active", false)
            .classed("inactive", true);   
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }

      // Update Paragraph Text
      updateParagraphText(chosenXAxis, chosenYAxis);  
    });

    // Y-axis labels event listener
  	yLabelsGroup.selectAll("text")
    .on("click", function() {

      // Get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {

        // replaces chosenXaxis with value
        chosenYAxis = value;

        console.log(chosenYAxis)

        // Update y scale for new data
        yLinearScale = yScale(stateData, chosenYAxis);

        // Update y axis with transition
        yAxis = renderYAxis(yLinearScale, yAxis);

        // Update circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        // Update tooltip with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // Change classes to change bold text (axes)
        if (chosenYAxis === "obesity") {
        	obesityLabel
            .classed("active", true)
            .classed("inactive", false);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis === "smokes") {
        	obesityLabel
            .classed("active", false)
            .classed("inactive", true);   
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true); 
        }
        else {
        	obesityLabel
            .classed("active", false)
            .classed("inactive", true);   
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }

      // Update paragraph text
      updateParagraphText(chosenXAxis, chosenYAxis);
    });
});