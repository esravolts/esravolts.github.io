(function () {
  /*
     This module wraps the state of the graphical user interface.
     It does so in terms of graph index - a uuid for a given curve
     which corresponds directly to the order in which they are shown
     in the gui.
     This module does not mutate the gui directly, only store the
     state required for other modules to do so.
   */
  "use strict";
  var root = this;
  var previous_volts_selections = root.volts_selections;

  /* Content starts here */

  var volts_selections = function (initial_state)
  {
    // When called, creates an instance of a gui state.
    // We use one for AC and one for DC.
    var active_selection_index = 0;
    var active_background_key = initial_state.background_data[0].source;
    
    var gui_state = [];
    gui_state[0] =
    {
      current: initial_state.current,
      impedance: initial_state.impedance,
      method: initial_state.method,
      additional_resistance: initial_state.additional_resistance,
      constant_impedance_value: initial_state.constant_impedance_value,  
      curve_metadata: initial_state.curve_metadata,
    };

    function copy_curve_metadata(arg)
    {
      var ret = {};
      ret.name = arg.name;
      ret.colour = arg.colour;
      return ret;
    }
    
    var my = {};
    my.mode = initial_state.mode;
    my.title = initial_state.title;
    my.button = initial_state.button;
    my.current_title = initial_state.current_title;
    my.current_data = initial_state.current_data;
    my.impedance_title = initial_state.impedance_title;
    my.impedance_data = initial_state.impedance_data;
    my.method_path_title = initial_state.method_path_title;
    my.method_path_data = initial_state.method_path_data;
    my.background_data = initial_state.background_data;
    my.additional_resistance_title = initial_state.additional_resistance_title;
    my.resistance_database = initial_state.resistance_database;  
    my.x_axis_label = initial_state.x_axis_label;
    my.y_axis_label = initial_state.y_axis_label;

    my.get_number_of_curves = function ()
    {
      return gui_state.length;
    }
    my.delete_curve_at_index = function (index)
    {
      gui_state.splice(index,1);
    }
    my.set_active_selection_index = function (index)
    {
      active_selection_index = index;
    }
    my.get_active_selection_index = function ()
    {
      return active_selection_index;
    }

    function background_from_key(key)
    {
      var index = 0;

      var len = my.background_data.length;
      var opt, j;
      for (j = 0; j < len; j++)
      {
	opt = my.background_data[j];
	if (opt.source == active_background_key)
	{
	  index = j;
	  break;
	}
      }
      return my.background_data[index];
    }
    
    my.set_active_background_key = function (key)
    {
      active_background_key = key;
    }
    my.get_active_background_key = function ()
    {
      return active_background_key;
    }
    my.get_active_background = function ()
    {
      return background_from_key(active_background_key);
    }

    my.set_current = function (index,sel)
    {
      gui_state[index].current = sel;
    }
    my.get_current = function (index)
    {
      return gui_state[index].current;
    }
    my.set_impedance = function (index,sel)
    {
      gui_state[index].impedance = sel;
    }
    my.get_impedance = function (index)
    {
      return gui_state[index].impedance;
    }
    my.set_method = function (index,sel)
    {
      gui_state[index].method = sel;
    }
    my.get_method = function (index)
    {
      return gui_state[index].method;
    }
    my.set_additional_resistance = function (index,sel)
    {
      gui_state[index].additional_resistance = sel;
    }
    my.get_additional_resistance = function (index)
    {
      if (typeof gui_state[index].additional_resistance == 'undefined')
      {
        my.set_additional_resistance(0);
      }
      return gui_state[index].additional_resistance;
    }
    my.set_constant_impedance = function (index,sel)
    {
      gui_state[index].constant_impedance = sel;
    }
    my.get_constant_impedance = function (index)
    {
      if (typeof gui_state[index].constant_impedance == 'undefined')
      {
        my.set_constant_impedance(index,0);
      }
      return gui_state[index].constant_impedance;
    }
    my.set_curve_metadata = function (index,sel)
    {
      gui_state[index].curve_metadata = copy_curve_metadata(sel);
    }
    my.get_curve_metadata = function (index)
    {
      return copy_curve_metadata(gui_state[index].curve_metadata);
    }
    
    my.create_curve_at_index_from_existing_index = function (new_index,old_index)
    {
      gui_state[new_index] = {};
      my.set_current(new_index,my.get_current(old_index));
      my.set_impedance(new_index,my.get_impedance(old_index));
      my.set_method(new_index,my.get_method(old_index));
      my.set_additional_resistance(new_index,my.get_additional_resistance(old_index));
      my.set_constant_impedance(new_index,my.get_constant_impedance(old_index));
      my.set_curve_metadata(new_index,my.get_curve_metadata(old_index));
    }
    return my;
  }

  /* Content ends here */

  volts_selections.noConflict = function() {
    root.volts_selections = previous_volts_selections;
    return volts_selections;
  };

  if( typeof exports !== 'undefined' ) {
    if( typeof module !== 'undefined' && module.exports ) {
      exports = module.exports = volts_selections;
    }
    exports.volts_selections = volts_selections;
  }
  else {
    root.volts_selections = volts_selections;
  }

}).call(this);
