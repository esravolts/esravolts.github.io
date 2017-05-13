(function () {
  /*
     This interface defines an abstraction over data that will be plotted
     elsewhere in the volts application. The purpose is to provide a common
     interface from formatted text files, mathematical expressions or
     embedded data. An instance of a data_source acts as a function in the
     fashion y = data_source(x). It also provides min() and max() to indicate
     the function domain, will acquire additional functionality as required.
   */

  "use strict";
  var root = this;
  var previous_data_source = root.data_source;

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
  /* Default data source is never ready and only returns zero */
  var data_source = function(x) {return 0;};
  data_source.min = function() {return 0;};
  data_source.max = function() {return 0;};
  data_source.ready = function() {return false;};

  /* Helper functions bound to data_source */
  data_source.makePoint = function (_x, _y){return {x: +_x, y: +_y};};

  data_source.polynomial = function() {
    var args = arguments;
    var narg = arguments.length;

    var my = function (x){
      var p,i;
      if (narg <= 0)
      {
        return 0;
      }

      p = args[0];
      for (i = 1; i < narg; i++) {
        p = p * x + args[i];
      }

      return p;
    };

    var importedData = [];
    var point;

    var x_min = -1000;
    var x_max = +1000;
    var x_avg = (x_min + x_max)/2;

    point = data_source.makePoint(x_min, my(x_min));
    importedData.push(point);
    point = data_source.makePoint(x_avg, my(x_avg));
    importedData.push(point);
    point = data_source.makePoint(x_max, my(x_max));
    importedData.push(point);

    my.ready = function() {return true;};
    my.min = function() {return x_min; };
    my.max = function() {return x_max; };    
    my.importedData = function() {return importedData;};

    return my;
  };

  data_source.smooth = function (source) {
    // Produce a new data source by smoothing the data from the input

    var smoothed_array = [];
    var smoothed_data_source;
    var ready = false;
    var min = 0;
    var max = 0;
    var importedData;
    var curve_metadata;
    
    function build()
    {
      if (!ready)
      {
        if (source.ready())
          {
          var input_array = source.importedData();
          var l = input_array.length;
          var point;

          for (var i = 0; i < l; i++)
          {
            point = data_source.makePoint(input_array[i].x,input_array[i].y);
            smoothed_array.push(point);
          }

          if (l > 2)
          {
            // TODO: Clean this up
            smoothed_array[1].x = (input_array[0].x + input_array[1].x + input_array[2].x)/3;
            smoothed_array[1].y = (input_array[0].y + input_array[1].y + input_array[2].y)/3;

            smoothed_array[l-2].x = (input_array[l-3].x + input_array[l-2].x + input_array[l-1].x)/3;
            smoothed_array[l-2].y = (input_array[l-3].y + input_array[l-2].y + input_array[l-1].y)/3;

            for (var j = 2; j < l - 2; j++)
            {
              smoothed_array[j].x = (input_array[j-2].x + input_array[j-1].x + input_array[j].x + input_array[j+1].x + input_array[j+2].x)/5;
              smoothed_array[j].y = (input_array[j-2].y + input_array[j-1].y + input_array[j].y + input_array[j+1].y + input_array[j+2].y)/5;
            }
          }

          smoothed_data_source = data_source.fromArrayOfPoints(smoothed_array);
          if (source.curve_metadata !== undefined)
          {
            curve_metadata = source.curve_metadata;
          }
          min = smoothed_data_source.min();
          max = smoothed_data_source.max();
          importedData = smoothed_array;
          ready = true;
        }
      }
      return ready;
    }

    build();

    var my = function(x) {
      if (!build()) { return 0; }
      return smoothed_data_source(x);
    };

    my.ready = function() {return ready;};
    my.min = function() {return min; };
    my.max = function() {return max; };
    my.importedData = function() {return importedData;};
    my.curve_metadata = curve_metadata;
    return my;
  };

  data_source.invert = function (source) {
    // Produce a new data source by inverting the x and y of the input data source
    // Preserve any metadata on the input source
      
    var inverted_array = [];
    var inverted_data_source;
    var ready = false;
    var min = 0;
    var max = 0;
    var importedData;
    var curve_metadata;
    function build()
    {
      if (!ready)
      {
        if (source.ready())
        {
          var input_array = source.importedData();
          var l = input_array.length;
          var point;

          for (var i = 0; i < l; i++)
          {
            point = data_source.makePoint(input_array[i].y,input_array[i].x);
            inverted_array.push(point);
          }

          inverted_data_source = data_source.fromArrayOfPoints(inverted_array);
          if (source.curve_metadata !== undefined) // preserve metadata
          {
            curve_metadata = source.curve_metadata;
          }
          min = inverted_data_source.min();
          max = inverted_data_source.max();
          importedData = inverted_array;
          ready = true;
        }
      }
      return ready;
    }

    build();

    var my = function(x) {
      if (!build()) { return 0; }
      return inverted_data_source(x);
    };

    my.ready = function() {return ready;};
    my.min = function() {return min; };
    my.max = function() {return max; };
    my.importedData = function() {return importedData;};
    my.curve_metadata = curve_metadata;
    return my;
  };

  data_source.fromArrayOfPoints = function(arrPts) {
    /* Expect the points to contain a field called x, another called y */

    function stableSort(arr) {

      var comparePoints = function(a,b) {
        var lhs = +a.x;
        var rhs = +b.x;
        return lhs - rhs;
      };

      var arrOfWrapper = arr.map(function(elem, idx){
        return {elem: elem, idx: idx};
      });

      //sort the wrappers, breaking sorting ties by using their elements orig index position
      arrOfWrapper.sort(function(lhs, rhs){
        var diff = comparePoints(lhs.elem, rhs.elem);
        return diff === 0 ? lhs.idx - rhs.idx : diff;
      });

      //unwrap and return the elements
      return arrOfWrapper.map(function(wrapper){
        return wrapper.elem;
      });
    }

    var sortedData = stableSort(arrPts);
    var empty = arrPts.length == 0;

    var ready = true; // This is synchronous
    var min = empty ? 0 : sortedData[0].x;
    var max = empty ? 0 : sortedData[sortedData.length-1].x;

    var linearInterpolate = function (lower, upper, xvalue)
    {
      var rangeX = upper.x - lower.x;
      var rangeY = upper.y - lower.y;

      if ((rangeX === 0) || (rangeY === 0)) { return (lower.y + upper.y)/2; }

      var gradient = rangeY / rangeX;
      // Minimise impact of rounding errors by averaging these
      var constant_lower = lower.y - gradient * lower.x;
      var constant_upper = upper.y - gradient * upper.x;
      var constant = (constant_upper + constant_lower)/2;

      return gradient * xvalue + constant;
    };

    var my = function(x)
    {
      if (!ready) { return 0; }

      // This implementation is O(N)
      var len = sortedData.length;
      if (len == 0)
      {
        return 0;
      }
      if (len == 1)
      {
        return sortedData[0].y;
      }
      if ((len == 2) || (x < sortedData[0].x))
      {
        return linearInterpolate(sortedData[0],sortedData[1],x);
      }

      for (var i = 1; i < len; i++)
      {
        if (sortedData[i].x === x)
        {
          return sortedData[i].y;
        }
        if (sortedData[i].x > x)
        {
          return linearInterpolate(sortedData[i-1],sortedData[i],x);
        }
      }
      return linearInterpolate(sortedData[len-2],sortedData[len-1],x);
    };

    my.min = function() {return min; };
    my.max = function() {return max; };
    my.ready = function() {return ready;};
    my.importedData = function() {return arrPts;}
    return my;
  };

  data_source.fromCSV = function(filename, callback) {

    callback = callback || function () {};
    var ready = false; // This is not synchronous

    var importedData = [];

    var impl = function (x) { return 0; }
    impl.min = function() { return 0; }
    impl.max = function() { return 0; }

    var my = function (x){
      // Calling this before ready is true is an error
      if (!ready) { return 0; }

      return impl(x);
    };

    if (typeof XMLHttpRequest === 'undefined')
    {
      if (typeof fs === 'undefined')
      {
        var fs = require("fs");
      }

      fs.readFile(filename, "utf8", function (error,text)
        {
          if (error)
          {
            console.log(error);
          }
          else
          {
            importedData = d3.csv.parseRows(text).map(function(row) {
              var point = {x : +row[0], y : +row[1]};
              return point;
            });
          }
          impl = data_source.fromArrayOfPoints(importedData);
          ready = true;
          callback();
        });
    }
    else
    {
      d3.text(filename, function(text) {
        importedData = d3.csv.parseRows(text).map(function(row) {
          var point = {x : +row[0], y : +row[1]};
          return point;
        });
        impl = data_source.fromArrayOfPoints(importedData);
        ready = true;
        callback();
      });
    }
    my.ready = function() {return ready;};
    my.min = function() {return impl.min();};
    my.max = function() {return impl.max();};
    my.importedData = function() {return importedData; };
    return my;
  };


  /* Content ends here */

  data_source.noConflict = function() {
    root.data_source = previous_data_source;
    return data_source;
  };

  if( typeof exports !== 'undefined' ) {
    if( typeof module !== 'undefined' && module.exports ) {
      exports = module.exports = data_source;
    }
    exports.data_source = data_source;
  }
  else {
    root.data_source = data_source;
  }

}).call(this);
