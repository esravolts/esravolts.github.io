(function() {
  /* This file contains the contents of the drop down menus in the front end */
  "use strict";
  var root = this;

  var previous_volts_calculations = root.volts_calculations;

  var d3 = root.d3;
  if (typeof d3 === 'undefined')
  {
    if (typeof require !== 'undefined')
    {
      var d3 = require('../vendor/d3');
    }
    else
    {
      throw new Error('volts_calculations requires D3, see d3js.org');
    }
  }

  var data_source = root.data_source;
  if (typeof data_source === 'undefined') {
    if (typeof require !== 'undefined')
    {
      var data_source = require('./data_source');
    }
    else
    {
      throw new Error('volts_calculations requires data_source');
    }
  }

  var volts_configuration = root.volts_configuration;
  if (typeof volts_configuration === 'undefined') {
    if (typeof require !== 'undefined')
    {
      var volts_configuration = require('./volts_configuration');
    }
    else
    {
      throw new Error('volts_calculations requires volts_configuration');
    }
  }
  
  /* Content starts here */

  var my = {};


  // The following method covers those that need no additional resistances:
  // funcbtlh (BF = 0.52, HF = 0.7)
  // funcbtrh (BF = 0.52, HF = 0.3)
  // funcctlh (BF = 0.52, HF = 1.5)
  // funcctrh (BF = 0.52, HF = 1.3)
  // funchth (BF = 1, HF = 0.4)
  // funclftrf (BF = 0.275, HF = 0.04)
  // funclhbf (BF = 0.75, HF = 1)
  // funcrhbf (BF = 0.75, HF = 0.8)
  // funcsbh (BF = 0.33, HF = 0.7)
  // funcslh (BF = 0.56, HF = 0.7)
  // funcsrh (BF = 0.56, HF = 0.7)

  // method_path should return a function that takes a current_data_source and
  // an impedance data souce, possibly also an additional resistance. This function
  // is then called whenever one of the dropdown menus is changed.

  function create_active_method_data_source(BodyFactor, HeartFactor, force_additional_resistance_to_one)
  {
    // It is currently unclear why some methods force ResistanceFactor to unity and others don't.
    return function (current_data_source, impedance_data_source, ResistanceFactor)
    {
      if (force_additional_resistance_to_one)
      {
        ResistanceFactor = 1;
      }
      var smoothed_current = data_source.smooth(current_data_source);
      return calculation_impl(BodyFactor, HeartFactor, ResistanceFactor, smoothed_current, impedance_data_source);
    };
  }

  function create_active_method_data_source_for_average()
  {
    return function (current_data_source, impedance_data_source, ResistanceFactor)
    {
      var smoothed_current = data_source.smooth(current_data_source);
      return average_calculation_impl(ResistanceFactor, smoothed_current, impedance_data_source);
    };
  }

  function create_active_method_data_source_for_Rb1000(HeartFactor)
  {
    return function (current_data_source, impedance_data_source, ResistanceFactor)
    {
      var smoothed_current = data_source.smooth(data_source.invert(current_data_source));
      return Rb1000_calculation_impl(HeartFactor, ResistanceFactor, smoothed_current);
    };
  }


  function create_active_method_data_source_from_current()
  {
    return function (current_data_source, impedance_data_source, ResistanceFactor)
    {
      return current_data_source;
    };
  }

  function create_active_method_data_source_from_impedance()
  {
    return function (current_data_source, impedance_data_source, ResistanceFactor)
    {
      return impedance_data_source;
    };
  }

  function create_active_method_data_source_from_constant_ResistanceFactor_field()
  {
    return function (current_data_source, impedance_data_source, ResistanceFactor)
    {
      return data_source.polynomial(ResistanceFactor);
    };
  }
    
  function create_active_method_data_source_from_constant(k)
  {
    return function (current_data_source, impedance_data_source, ResistanceFactor)
    {
      return data_source.polynomial(k);
    };
  }

  function create_combined_data_source(current, impedance, create_method)
  {
    return create_method(current, impedance);
  }

  function Rb1000_calculation_impl(HeartFactor, ResistanceFactor, c_t_source)
  {
    "use strict";
    var ctImportedData = c_t_source.importedData;

    if (typeof ctImportedData !== "function")
    {
      console.log("Requested a plot from data sources without importedData field");
      return data_source;
    }
    ctImportedData = ctImportedData();
    var Impedance = 1000;
    var Rf = ResistanceFactor;

    // zt1.csv contains v, z, read in as z = f(v)
    // c1.csv contains c, t, read in as t = f(c)

    var my = function (time)
    {
      return ((c_t_source(time)/HeartFactor) * (Impedance + Rf))/1000;
    }

    var importedData = [];
    var ctImportedDataLength = ctImportedData.length;
    var point;
    for (var i = 0; i < ctImportedDataLength; i++)
    {
      point = data_source.makePoint(ctImportedData[i].x, my(ctImportedData[i].x));
      importedData.push(point);
    }

    my.min = function() {return c_t_source.min(); }
    my.max = function() {return c_t_source.max(); }
    my.ready = function() {return c_t_source.ready(); }
    my.importedData = function() {return importedData; }
    return my;
  }

  function make_voltage_estimate_from_current (BF, zv_data) {
    var makePoint = data_source.makePoint;
    var genarray = [];
    var zv_data_len = zv_data.length;
    var i;
    for (i = 0; i < zv_data_len; i++)
    {
      var V = zv_data[i].x;
      var Z = zv_data[i].y;
      var BC =  1000 * V / (BF * Z);
      var point = makePoint(BC,V);
      genarray.push(point);
    }
    return data_source.fromArrayOfPoints(genarray);
  }

  function make_voltage_as_function_of_time(RF,HF,ct_data,voltage_from_current) {
    var makePoint = data_source.makePoint;
    var genarray = [];
    var ct_data_len = ct_data.length;
    var i;
    for (i = 0; i < ct_data_len; i++)
    {
      var allowable_body_current = (ct_data[i].x) / HF;
      var Vctrhwa = voltage_from_current(allowable_body_current);
      if(isNaN(Vctrhwa))
      {
        // This implies impedance was zero. No voltage can be
        // safely tolerated if there is no resistance.
        Vctrhwa = 0;
      }
      var Vctrhrf = (allowable_body_current / 1000) * RF;
      var Vctrh = Vctrhwa + Vctrhrf;      
      var V = Vctrh;
      var T = ct_data[i].y;
      var point = makePoint(T,V);
      genarray.push(point);
    }
    return data_source.fromArrayOfPoints(genarray);
  }

  function make_voltage_as_function_of_time_for_average(HF,ct_data,voltage_from_current) {
    /* The average calculation does not take Rf into account until the very end */
    var makePoint = data_source.makePoint;
    var genarray = [];
    var ct_data_len = ct_data.length;
    var i;
    for (i = 0; i < ct_data_len; i++)
    {
      var allowable_body_current = (ct_data[i].x) / HF;
      var Vctrhwa = voltage_from_current(allowable_body_current);
      if(isNaN(Vctrhwa))
      {
        // This implies impedance was zero. No voltage can be
        // safely tolerated if there is no resistance.
        Vctrhwa = 0;
      }
      
      var V = Vctrhwa;
      var T = ct_data[i].y;
      var point = makePoint(T,V);
      genarray.push(point);
    }
    return data_source.fromArrayOfPoints(genarray);
  }

  function calculation_impl(BodyFactor, HeartFactor, ResistanceFactor, c_t_source,z_v_source)
  {
    "use strict";
    if ( (typeof c_t_source.importedData !== "function") ||
         (typeof z_v_source.importedData !== "function"))
    {
      console.log("Requested a plot from data sources without importedData field");
      return data_source;
    }

    var raw_ct_data = c_t_source.importedData();
    var raw_zv_data = z_v_source.importedData();

    var additional_resistance = ResistanceFactor;
    // zt1.csv contains v, z, read in as z = f(v)
    // c1.csv contains c, t, read in as t = f(c)

    // Body current from V/Z appears to be a pointwise calculation, not a streaming one
    // Body current points are used to construct v = f(bc), evaluated at c points
    // Body current points can be used to assemble a stream of BC -> V

    var voltage_estimate_from_current = make_voltage_estimate_from_current(BodyFactor, raw_zv_data);

    var voltage_as_function_of_time = make_voltage_as_function_of_time(additional_resistance, HeartFactor, raw_ct_data, voltage_estimate_from_current);

    return voltage_as_function_of_time;
  }

  function average_calculation_impl(ResistanceFactor, c_t_source,z_v_source)
  {
    "use strict";
    if ( (typeof c_t_source.importedData !== "function") ||
         (typeof z_v_source.importedData !== "function"))
    {
      console.log("Requested a plot from data sources without importedData field");
      return data_source;
    }

    var raw_ct_data = c_t_source.importedData();
    var raw_zv_data = z_v_source.importedData();
    var RF = ResistanceFactor;
    var BF = 0;
    var HF = 0;

    function make_voltage(HF,BF)
    {
      return make_voltage_as_function_of_time_for_average(HF,raw_ct_data,make_voltage_estimate_from_current(BF,raw_zv_data));
    }

    BF = 0.75;
    HF = 1.0;
    var Vlhbf = make_voltage(HF,BF);

    BF = 0.75;
    HF = 0.8;
    var Vrhbf = make_voltage(HF,BF);

    BF = 0.5;
    HF = 1.0;
    var Vbhbf = make_voltage(HF,BF);

    BF = 1.0;
    HF = 0.4;
    var Vhth = make_voltage(HF,BF);

    return (function (ct_data) {
      var makePoint = data_source.makePoint;
      var genarray = [];
      var ct_data_len = ct_data.length;
      var i;
      for (i = 0; i < ct_data_len; i++)
      {
        var body_current = (ct_data[i].x); // No heart factor involved here
        var time = (ct_data[i].y);
	// This is not strictly a weighted average
	// We follow the standard here
        var Vave = (Vlhbf(time) + Vrhbf(time) + Vbhbf(time) + 0.7*Vhth(time))/4;

        var Vctrhrf = (body_current / 1000) * RF;
        var Vctrh = Vave + Vctrhrf;

        var V = Vctrh;
        var T = ct_data[i].y;
        var point = makePoint(T,V);
        genarray.push(point);
      }
      return data_source.fromArrayOfPoints(genarray);
    })(raw_ct_data);

  }

  /*
   * <!-- The 1kOhm value is used by the older standard -->
   */

  function mark_methods_with_uses_resistance_factor(arr)
  {
    var len = arr.length;
    var i;
    for (i = 0; i < len; i++)
    {
      arr[i].method.uses_resistance_factor = arr[i].uses_resistance_factor;
    }
  }

  my.method_path_current = [
    {
      source: "current_checking",
      label: "Input current data",
      method: function ()
      {
        return create_active_method_data_source_from_current();
      },
      uses_resistance_factor: false
    },
    {
      source: "constant_current",
      label: "Constant current",
      method: function ()
      {
        return create_active_method_data_source_from_constant_ResistanceFactor_field();
      },
      uses_resistance_factor: true
    }];
  mark_methods_with_uses_resistance_factor(my.method_path_current);
    
  my.method_path_impedance = [
    {
      source: "impedance_checking",
      label: "Input impedance data",
      method: function ()
      {
        return create_active_method_data_source_from_impedance();
      },
      uses_resistance_factor: false
    },
    {
      source: "constant_impedance",
      label: "Constant impedance",
      method: function ()
      {
        return create_active_method_data_source_from_constant_ResistanceFactor_field();
      },
      uses_resistance_factor: true
    }];
  mark_methods_with_uses_resistance_factor(my.method_path_impedance);
    

  my.method_path_data = (function () {
    var local = [];
    var len = volts_configuration.method_path_data_table.length;
    for (var i = 0; i < len; i++)
    {
      (function () {
	var e = {}
	var t = volts_configuration.method_path_data_table[i];
	e.source = t.source;
	e.label = t.label;
	e.force_additional_resistance_to_one = t.force_additional_resistance_to_one;

        // force_additional_resistance_to_one is true|false|null
        // only when force_additional_resistance_to_one is == false do we use the
        // resistance factor.

      	e.uses_resistance_factor = e.force_additional_resistance_to_one == false;

	if (t.methodname === "average")
	{
	  e.method = function()
	  {
	    return create_active_method_data_source_for_average();
	  }
	}
	else if (t.methodname === "normal")
	{
	  e.method = function ()
	  {
	    return create_active_method_data_source(t.BodyFactor, t.HeartFactor, t.force_additional_resistance_to_one);
	  }
	}
	else if (t.methodname === "rb1000")
	{
	  e.method = function ()
	  {
            return create_active_method_data_source_for_Rb1000(t.HeartFactor);
	  }
	}
	else
	{
	  return;
	}
	local.push(e);
      }());
    }

    return local;
  }
  )();

  mark_methods_with_uses_resistance_factor(my.method_path_data);


  my.path_calculations = (function(){
    "use strict";
    var path_calc = {};
    var i = 0;
    var len;
    var identifier;
    var calculation;

    len = my.method_path_data.length;
    for (i = 0; i < len; i++)
    {
      identifier = my.method_path_data[i].source;
      calculation = my.method_path_data[i].method;
      path_calc[identifier] = calculation;
    }

    len = my.method_path_current.length;
    for (i = 0; i < len; i++)
    {
      identifier = my.method_path_current[i].source;
      calculation = my.method_path_current[i].method;
      path_calc[identifier] = calculation;
    }

    len = my.method_path_impedance.length;
    for (i = 0; i < len; i++)
    {
      identifier = my.method_path_impedance[i].source;
      calculation = my.method_path_impedance[i].method;
      path_calc[identifier] = calculation;
    }
    
    return path_calc;
  })();

  var volts_calculations = my;
  /* Content ends here */

  volts_calculations.noConflict = function() {
    root.volts_calculations = previous_volts_calculations;
    return volts_calculations;
  };

  if( typeof exports !== 'undefined' ) {
    if( typeof module !== 'undefined' && module.exports ) {
      exports = module.exports = volts_calculations;
    }
    exports.volts_calculations = volts_calculations;
  }
  else {
    root.volts_calculations = volts_calculations;
  }

}).call(this);
