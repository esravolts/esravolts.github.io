(function() {
  /* This file contains the contents of the drop down menus in the front end */
  "use strict";
  var root = this;

  var previous_volts_configuration = root.volts_configuration;

  var my = {};
  /* Content starts here */

  my.resolution = 101; // Number of points on the X axis
  
  my.alternating_current_data = [
    {source: "ac_c1.csv", label: "c1 - Safety curve"},
    {source: "ac_c2.csv", label: "c2 - 5% Probability"},
    {source: "ac_c3.csv", label: "c3 - 50% Probability"}];

  my.direct_current_data = [
    {source: "dc_c1.csv", label: "c1 - Safety curve"},
    {source: "dc_c2.csv", label: "c2 - 5% Probability"},
    {source: "dc_c3.csv", label: "c3 - 50% Probability"}];

  my.all_current_data = [
    {source: "ac_c1.csv", label: "AC: c1 - Safety curve"},
    {source: "ac_c2.csv", label: "AC: c2 - 5% Probability"},
    {source: "ac_c3.csv", label: "AC: c3 - 50% Probability"},
    {source: "dc_c1.csv", label: "DC: c1 - Safety curve"},
    {source: "dc_c2.csv", label: "DC: c2 - 5% Probability"},
    {source: "dc_c3.csv", label: "DC: c3 - 50% Probability"}];

  my.alternating_impedance_data = [
    {source: "Constant", label: "Constant"},
    {source: "zt1.csv", label: "z1 - 5% Dry"},
    {source: "zt2.csv", label: "z2 - 50% Dry"},
    {source: "zt3.csv", label: "z3 - 95% Dry"},
    {source: "waterwetzt1.csv", label: "z1 - 5% Wet"},
    {source: "waterwetzt2.csv", label: "z2 - 50% Wet"},
    {source: "waterwetzt3.csv", label: "z3 - 95% Wet"},
    {source: "saltwetzt1.csv", label: "z1 - 5% Salt"},
    {source: "saltwetzt2.csv", label: "z2 - 50% Salt"},
    {source: "saltwetzt3.csv", label: "z3 - 95% Salt"},
    {source: "oldzt1.csv", label: "z1 - 5% Old IEC"},
    {source: "oldzt2.csv", label: "z2 - 50% Old IEC"},
    {source: "oldzt3.csv", label: "z3 - 95% Old IEC"}];

  my.direct_impedance_data = [
    {source: "Constant", label: "Constant"},
    {source: "dc_zt1.csv", label: "z1 - 5% Dry"},
    {source: "dc_zt2.csv", label: "z2 - 50% Dry"},
    {source: "dc_zt3.csv", label: "z3 - 95% Dry"}];

  my.all_impedance_data = [
    {source: "Constant", label: "Constant"},
    {source: "zt1.csv", label: "AC: z1 - 5% Dry"},
    {source: "zt2.csv", label: "AC: z2 - 50% Dry"},
    {source: "zt3.csv", label: "AC: z3 - 95% Dry"},
    {source: "waterwetzt1.csv", label: "AC: z1 - 5% Wet"},
    {source: "waterwetzt2.csv", label: "AC: z2 - 50% Wet"},
    {source: "waterwetzt3.csv", label: "AC: z3 - 95% Wet"},
    {source: "saltwetzt1.csv", label: "AC: z1 - 5% Salt"},
    {source: "saltwetzt2.csv", label: "AC: z2 - 50% Salt"},
    {source: "saltwetzt3.csv", label: "AC: z3 - 95% Salt"},
    {source: "oldzt1.csv", label: "AC: z1 - 5% Old IEC"},
    {source: "oldzt2.csv", label: "AC: z2 - 50% Old IEC"},
    {source: "oldzt3.csv", label: "AC: z3 - 95% Old IEC"},
    {source: "dc_zt1.csv", label: "DC: z1 - 5% Dry"},
    {source: "dc_zt2.csv", label: "DC: z2 - 50% Dry"},
    {source: "dc_zt3.csv", label: "DC: z3 - 95% Dry"}];

  // The dropdown menu will be in the same order as this array
  // A value of null indicates that this field is not used by
  // the indicated method.

   my.method_path_data_table = [
    {
      source: "european_average",
      label: "Average Method",
      methodname: "average",
      BodyFactor: null,
      HeartFactor: null,
      force_additional_resistance_to_one: false
    },
    {
      source: "left_hand_both_feet_Rb1000",
      label: "Left hand to both feet for (Rb = 1000)",
      methodname: "rb1000",
      BodyFactor: null,
      HeartFactor: 1.0,
      force_additional_resistance_to_one: null
    },
    {
      source: "right_hand_both_feet_Rb1000",
      label: "Right hand to both feet for (Rb = 1000)",
      methodname: "rb1000",
      BodyFactor: null,
      HeartFactor: 0.8,
      force_additional_resistance_to_one: null
    },
    {
      source: "both_hands_to_both_feet_Rb1000",
      label: "Both hands to both feet for (Rb = 1000)",
      methodname: "rb1000",
      BodyFactor: null,
      HeartFactor: 1.0,
      force_additional_resistance_to_one: null
    },
    {
      source: "hand_to_hand_Rb1000",
      label: "Hand to hand for (Rb = 1000)",
      methodname: "rb1000",
      BodyFactor: null,
      HeartFactor: 0.4,
      force_additional_resistance_to_one: null
    },
    {
      source: "left_hand_to_left_foot",
      label: "Left hand to left foot",
      methodname: "normal",
      BodyFactor: 1,
      HeartFactor: 1,
      force_additional_resistance_to_one: false
    },
    {
      source: "left_hand_to_right_foot",
      label: "Left hand to right foot",
      methodname: "normal",
      BodyFactor: 1,
      HeartFactor: 1,
      force_additional_resistance_to_one: false
    },
    {
      source: "right_hand_to_left_foot",
      label: "Right hand to left foot",
      methodname: "normal",
      BodyFactor: 1,
      HeartFactor: 0.8,
      force_additional_resistance_to_one: false
    },
    {
      source: "right_hand_to_right_foot",
      label: "Right hand to right foot",
      methodname: "normal",
      BodyFactor: 1,
      HeartFactor: 0.8,
      force_additional_resistance_to_one: false
    },
    {
      source: "hand_to_hand",
      label: "Left hand to right hand",
      methodname: "normal",
      BodyFactor: 0.8,
      HeartFactor: 0.4,
      force_additional_resistance_to_one: false
    },
    {
      source: "right_hand_to_both_feet",
      label: "Right hand to both feet",
      methodname: "normal",
      BodyFactor: 0.75,
      HeartFactor: 0.8,
      force_additional_resistance_to_one: false
    },
    {
      source: "left_hand_to_both_feet",
      label: "Left hand to both feet",
      methodname: "normal",
      BodyFactor: 0.75,
      HeartFactor: 1,
      force_additional_resistance_to_one: false
    },
    {
      source: "both_hands_to_both_feet",
      label: "Both hands to both feet",
      methodname: "normal",
      BodyFactor: 0.5,
      HeartFactor: 1,
      force_additional_resistance_to_one: false
    },
    {
      source: "seat_to_left_hand",
      label: "Seat to left hand",
      methodname: "normal",
      BodyFactor: 0.56,
      HeartFactor: 0.7,
      force_additional_resistance_to_one: false
    },
    {
      source: "seat_to_right_hand",
      label: "Seat to right hand",
      methodname: "normal",
      BodyFactor: 0.56,
      HeartFactor: 0.7,
      force_additional_resistance_to_one: false
    },     
    {
      source: "seat_to_both_hands",
      label: "Seat to both hands",
      methodname: "normal",
      BodyFactor: 0.33,
      HeartFactor: 0.7,
      force_additional_resistance_to_one: false
    },
    {
      source: "left_hand_to_seat",
      label: "Left hand to seat",
      methodname: "normal",
      BodyFactor: 0.5,
      HeartFactor: 0.7,
      force_additional_resistance_to_one: false
    },
    {
      source: "right_hand_to_seat",
      label: "Right hand to seat",
      methodname: "normal",
      BodyFactor: 0.5,
      HeartFactor: 0.7,
      force_additional_resistance_to_one: false
    },
    {
      source: "both_hands_to_seat",
      label: "Both hands to seat",
      methodname: "normal",
      BodyFactor: 0.25,
      HeartFactor: 0.7,
      force_additional_resistance_to_one: false
    },
    {
      source: "back_to_right_hand",
      label: "Back to right hand",
      methodname: "normal",
      BodyFactor: 0.52,
      HeartFactor: 0.3,
      force_additional_resistance_to_one: false
    },
    {
      source: "back_to_left_hand",
      label: "Back to left hand",
      methodname: "normal",
      BodyFactor: 0.52,
      HeartFactor: 0.7,
      force_additional_resistance_to_one: false
    },
    {
      source: "chest_to_right_hand",
      label: "Chest to right hand",
      methodname: "normal",
      BodyFactor: 0.52,
      HeartFactor: 1.3,
      force_additional_resistance_to_one: false
    },
    {
      source: "chest_to_left_hand",
      label: "Chest to left hand",
      methodname: "normal",
      BodyFactor: 0.52,
      HeartFactor: 1.5,
      force_additional_resistance_to_one: false
    },
    {
      source: "foot_to_foot",
      label: "Left foot to right foot",
      methodname: "normal",
      BodyFactor: 0.275,
      HeartFactor: 0.04,
      force_additional_resistance_to_one: false
    }];
    
  var mathematical_backgrounds = [
    {source: "Linear", label: "Linear", withImage: false, xmin: 0, xmax: 10000, xtype: "linear", ymin: 0, ymax: 10000, ytype: "linear", invertData: false},
    {source: "LogLin", label: "Logarithmic X", withImage: false, xmin: 10, xmax: 10000, xtype: "logarithmic", ymin: 0, ymax: 10000, ytype: "linear", invertData: false},
    {source: "LinLog", label: "Logarithmic Y", withImage: false, xmin: 0, xmax: 10000, xtype: "linear", ymin: 10, ymax: 10000, ytype: "logarithmic", invertData: false},
    {source: "Logarithmic", label: "Logarithmic X and Y", withImage: false, xmin: 10, xmax: 10000, xtype: "logarithmic", ymin: 10, ymax: 10000, ytype: "logarithmic", invertData: false}];

  var risk_backgrounds = [
    {source: "Vtpic.bmp", label: "Figure 4 - Permissible touch voltage EN 50522:2010", withImage: true, xmin: 10, xmax: 10000, xtype: "logarithmic", ymin: 0, ymax: 1000, ytype: "linear", invertData: false},
    {source: "CroppedFigB2.bmp", label: "Figure B2 - Examples for curves for different Ra EN 50522", withImage: true, xmin: 10, xmax: 10000, xtype: "logarithmic", ymin: 0, ymax: 5000, ytype: "linear", invertData: false},
    {source: "CroppedVtSiemens2.bmp", label: "Siemens IEC touch voltage-3.pdf (page 6)", withImage: true, xmin: 10, xmax: 10000, xtype: "logarithmic", ymin: 0, ymax: 1000, ytype: "linear", invertData: false},
    {source: "EA4124.bmp", label: "EA 41-24 1992 Figure 2 Page 55", withImage: true, xmin: 10, xmax: 10000, xtype: "logarithmic", ymin: 10, ymax: 1000, ytype: "logarithmic", invertData: true},
    {source: "HD637S1.bmp", label: "HD637 S1 1999 Figure C.2", withImage: true, xmin: 50, xmax: 10000, xtype: "logarithmic", ymin: 50, ymax: 5000, ytype: "logarithmic", invertData: false},
    {source: "BS50522_FigNA.1.png", label: "BS EN50522 Figure NA.1", withImage: true, xmin: 10, xmax: 10000, xtype: "logarithmic", ymin: 0, ymax: 1000, ytype: "linear", invertData: false},
    {source: "BS50522_FigNA.2.png", label: "BS EN50522 Figure NA.2", withImage: true, xmin: 10, xmax: 10000, xtype: "logarithmic", ymin: 50, ymax: 5000, ytype: "linear", invertData: false}];

  var current_graphic_backgrounds = [
    {source: "Fig20_AC_479.png", label: "AC: Figure 20 IEC479", withImage: true, xmin: 0.1, xmax: 10000, xtype: "logarithmic", ymin: 10, ymax: 10000, ytype: "logarithmic", invertData: false},
    {source: "Fig20_DC_479.png", label: "DC: Figure 22 IEC479", withImage: true, xmin: 0.1, xmax: 10000, xtype: "logarithmic", ymin: 10, ymax: 10000, ytype: "logarithmic", invertData: false}];

  my.ac_risk_background_data = mathematical_backgrounds.concat(risk_backgrounds);
  my.dc_risk_background_data = mathematical_backgrounds.concat(risk_backgrounds);
  my.current_background_data = mathematical_backgrounds.concat(current_graphic_backgrounds);
  my.impedance_background_data = mathematical_backgrounds;

  my.resistance_database = [
    {label: "Additional resistance", source: "0"},
    {label: "Example", source: "42"}
  ];

  /* Content ends here */
  var volts_configuration = my;

  volts_configuration.noConflict = function() {
    root.volts_configuration = previous_volts_configuration;
    return volts_configuration;
  };

  if( typeof exports !== 'undefined' ) {
    if( typeof module !== 'undefined' && module.exports ) {
      exports = module.exports = volts_configuration;
    }
    exports.volts_configuration = volts_configuration;
  }
  else {
    root.volts_configuration = volts_configuration;
  }

}).call(this);
