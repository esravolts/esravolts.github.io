(function () {
  /*
     This interface provides the plotting layer. The primary function takes a DOM
     element and a data_source object, with some additional parameters from the GUI.
     Responsibilities include setting up axes and presenting linear or logarithmic data.
   */

  "use strict";
  var root = this;
  var previous_data_plotting = root.data_plotting;

  var d3 = root.d3;
  if (typeof d3 === 'undefined')
  {
    if (typeof require !== 'undefined')
    {
      var d3 = require('../vendor/d3');
    }
    else
    {
      throw new Error('data_source requires D3, see d3js.org');
    }
  }

  /* Content starts here */

  var round_for_output = d3.format(".2f"); // Set number of decimal places here
  
  function log_mouse_coordinates(arg,xscale,yscale)
  {
    var coords = d3.mouse(arg);
    var xval = round_for_output(xscale.invert(coords[0]));
    var yval = round_for_output(yscale.invert(coords[1]));
    console.log(xval + ", " + yval);
  }
  function update_box_cells(arg,xscale,yscale)
  {
    var coords = d3.mouse(arg);
    var xval = xscale.invert(coords[0]);
    var yval = yscale.invert(coords[1]);
    var xbox_text = round_for_output(xval);
    var ybox_text = round_for_output(yval);
    update_box_cells_impl(xbox_text,ybox_text);
  }

  function update_box_cells_impl(xbox_text, ybox_text)
  {
    d3.select("#xbox_value").text(xbox_text);
    d3.select("#ybox_value").text(ybox_text);
  }

  function graph_limits(data_source)
  {
    var xmin = data_source.min();
    var xmax = data_source.max();
    var ymin = data_source(xmin);
    var ymax = data_source(xmax);

    if (ymin > ymax)
    {
      var tmp = ymin;
      ymin = ymax;
      ymax = tmp;
    }

    return {xmin: xmin,
      xmax: xmax,
      ymin: ymin,
      ymax: ymax};
  }

  function graph_limits_array(arr)
  {
    // This sets default limits, for use when no data
    // is selected for plotting.
    var d = graph_limits(arr[0]);
    var xmin = d.xmin;
    var xmax = d.xmax;
    var ymin = d.ymin;
    var ymax = d.ymax;

    for (var i = 1; i < arr.length; i++)
    {
      d = graph_limits(arr[i]);
      xmin = xmin < d.xmin ? xmin : d.xmin;
      ymin = ymin < d.ymin ? ymin : d.ymin;
      xmax = xmax > d.xmax ? xmax : d.xmax;
      ymax = ymax > d.ymax ? ymax : d.ymax;
    }

    return {xmin: xmin,
      xmax: xmax,
      ymin: ymin,
      ymax: ymax};
  }


  function choose_x_points(logarithmic, xmin, xmax, number_points)
  {
    function make_linear_intermediate(xmin,xmax,number_points)
    {
      return function(i)
      {
        return xmin + (i/(number_points-1)) * (xmax-xmin);
      };
    }
    
    function make_logarithmic_intermediate(xmin,xmax,number_points)
    {
      var base = base = Math.pow( xmax / xmin, 1 / number_points );
      return function(i)
      {
        return xmin * Math.pow(base,i+1);
      };
    }
    
    if (logarithmic)
    {
      var intermediate = make_logarithmic_intermediate(xmin,xmax,number_points);
    }
    else
    {
      var intermediate = make_linear_intermediate(xmin,xmax,number_points);
    }

    var xvals = [];
    xvals.push(xmin);
    for (var i = 1; i < number_points - 1; i++)
    {
      xvals.push(intermediate(i));
    }
    xvals.push(xmax);
    
    return xvals;      
  }

  function plotting_array_from_ds(ds,xvals,xmin,xmax,ymin,ymax)
  {
    var data_array = [];

    var yval;
    for (var j = 0; j < xvals.length; j++)
    {
      if ((xmin <= xvals[j]) && (xvals[j] <= xmax))
      {
        var yval = ds(xvals[j]);
        if ((ymin <= yval) && (yval <= ymax))
        {
          data_array.push({x: xvals[j], y: yval});
        }
      }
    }

    return data_array;
  }
  
  function graph_setup (svg_root_element,xscale,yscale,width,height,background_data,logarithmic_x_axis,logarithmic_y_axis,x_axis_label,y_axis_label)
  {
    var margin = {top: 20, right: 40, bottom: 60, left: 100};
    var graphwidth = width + margin.left + margin.right;
    var graphheight = height + margin.top + margin.bottom;

    var xAxis = d3.svg.axis()
      .scale(xscale)
      .orient("bottom")
      .innerTickSize(-height)
      .outerTickSize(0)
      .tickPadding(15);
    
    var yAxis = d3.svg.axis()
      .scale(yscale)
      .orient("left")
      .innerTickSize(-width)
      .outerTickSize(0)
      .tickPadding(10);
 
    var svg = d3.select(svg_root_element)
      .attr("preserveAspectRatio", "none")
      .attr("viewBox", "0 0 " + graphwidth + " " + graphheight)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    if (background_data && background_data.withImage)
    {
      var image_name = "static/" + background_data.source;
      svg.append("image")
      .attr("xlink:href",image_name)
      .attr("preserveAspectRatio", "none")
      .attr("width", width)
      .attr("height", height);            
    }    

    svg.append("rect")
      .attr("class", "overlay")
      .attr("width", width)
      .attr("height", height)
      .on("mousemove", function () {update_box_cells(this,xscale,yscale);});

    function power_of_ten(d)
    {
      return d / Math.pow(10,Math.ceil(Math.log(d) / Math.LN10 - 1e-12)) === 1;
    }

    function round_superscript(d)
    {
      return Math.round(Math.log(d) / Math.LN10);
    }

    if (!logarithmic_x_axis)
    {
      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
    }
    if (!logarithmic_y_axis)
    {
      svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);
    }
    if (logarithmic_x_axis)
    {
      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll(".tick text")
        .text(null)
        .filter(power_of_ten)
        .text(10)
        .append("tspan")
        .attr("dy","-0.7em")
        .text(round_superscript);
    }
    if (logarithmic_y_axis)
    {
      svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .selectAll(".tick text")
        .text(null)
        .filter(power_of_ten)
        .text(10)
        .append("tspan")
        .attr("dy","-0.7em")
        .text(round_superscript);
    }
    
    svg.append("text")
      .attr("class", "x axis_label")
      .attr("transform", "translate(" + (width/2) + " ," + (height + 0.75*margin.bottom) + ")")
      .style("text-anchor","middle")
      .text(x_axis_label);

    svg.append("text")
      .attr("class", "y axis_label")
      .attr("transform", "rotate(-90)")
      .attr("x",(-height/2))
      .attr("y", -0.6*margin.left) // Expect to update this if margins are reduced
      .style("text-anchor","middle")
      .text(y_axis_label);
    
    return svg;
  }

  function is_logarithmic_x_axis(background_data)
  {
    return (background_data.xtype === "logarithmic");
  }

  function is_logarithmic_y_axis(background_data)
  {
    return (background_data.ytype === "logarithmic");
  }

  var my = function (svg_root_element,input_data_source_array,active_index,background_data,resolution,x_axis_label,y_axis_label) {

    // We need to know the limits of the plot area.
    // These are from a background image if we are using one
    // Otherwise they are taken from the data array

    if (!background_data)
    {
      return;
    }

    var logarithmic_x_axis = is_logarithmic_x_axis(background_data);
    var logarithmic_y_axis = is_logarithmic_y_axis(background_data);
    
    var data_source_array = (function(){
      if (background_data.invertData)
      {
        var tmp_axis_label = x_axis_label;
        x_axis_label = y_axis_label;
        y_axis_label = tmp_axis_label;
        
        var dsa = [];
        for (var i = 0; i < input_data_source_array.length; i++)
        {
          dsa.push(data_source.invert(input_data_source_array[i]));
        }
        return dsa;
      }
      else
      {
        return input_data_source_array;
      }
    }());

    var dxmin,dxmax,dymin,dymax; // domain
    if (background_data.withImage)
    {
      dxmin = background_data.xmin;
      dxmax = background_data.xmax;
      dymin = background_data.ymin;
      dymax = background_data.ymax;
    }
    else
    {
      var lim = graph_limits_array(data_source_array);
      dxmin = logarithmic_x_axis ? 10 : 0;
      dxmax = Math.ceil(lim.xmax*10)/10;
      dymin = logarithmic_y_axis ? 10 : 0;
      dymax = Math.ceil(lim.ymax*10)/10;
    }

    // Base this on the dimensions of the parent of this element
    // This is getting a bit messy - need a better way to get the bounding dimensions
    var parent_node = d3.select(svg_root_element).node().parentNode.parentNode;
    var element_dimensions = d3.select(parent_node).node().getBoundingClientRect();
    var width = element_dimensions.width;
    var height = element_dimensions.height;

    /* Changing these to .log() causes problems for zero values */

    var xscale = logarithmic_x_axis ? d3.scale.log().nice() : d3.scale.linear();
    xscale.range([0, width]).domain([dxmin,dxmax]);

    var yscale = logarithmic_y_axis ? d3.scale.log().nice() : d3.scale.linear();
    yscale.range([height, 0]).domain([dymin,dymax]);

    (function clear (svg_root_element)
      {
        d3.select(svg_root_element).selectAll("g").remove();
      }(svg_root_element));
      
    var svg = graph_setup(svg_root_element,xscale,yscale,width,height,background_data,logarithmic_x_axis,logarithmic_y_axis,x_axis_label,y_axis_label);

    var line = d3.svg.line()
      .interpolate("linear")
      .x(function(d) { return xscale(d.x); })
      .y(function(d) { return yscale(d.y); });
    
    function append_line_from_data_array(data_array,dot_colour)
    {
      svg.append("path").datum(data_array).attr("class","line").attr("d",line);

      var show_points = true;
      if (show_points)
      {
        var points = svg.selectAll(".point")
          .data(data_array)
          .enter().append("svg:circle")
          .attr("stroke", "black")
          .attr("fill", function(d) { return dot_colour })
          .attr("cx", function(d) { return xscale(d.x) })
          .attr("cy", function(d) { return yscale(d.y) })
          .attr("r", function(d) { return 3 });
      }
    }

    var i = 0;
    var dot_colour;
    var data_array;

    function data_array_from_data_source(ds)
    {
      var xvals = choose_x_points(logarithmic_x_axis, dxmin, dxmax, resolution);
      return plotting_array_from_ds(ds,xvals,dxmin,dxmax,dymin,dymax);
    }
    
    for (i = 0; i < data_source_array.length; i++)
    {
      dot_colour = data_source_array[i].curve_metadata.colour;
      data_array = data_array_from_data_source(data_source_array[i]); 
      append_line_from_data_array(data_array,dot_colour);
    }
  };

  my.choose_x_points = choose_x_points;
  my.graph_limits_array = graph_limits_array;
  my.round_for_output = round_for_output;
  my.is_logarithmic_x_axis = is_logarithmic_x_axis;
  my.is_logarithmic_y_axis = is_logarithmic_y_axis;

  var data_plotting = my;

  /* Content ends here */

  data_plotting.noConflict = function() {
    root.data_plotting = previous_data_plotting;
    return data_plotting;
  };

  if( typeof exports !== 'undefined' ) {
    if( typeof module !== 'undefined' && module.exports ) {
      exports = module.exports = data_plotting;
    }
    exports.data_plotting = data_plotting;
  }
  else {
    root.data_plotting = data_plotting;
  }

}).call(this);
