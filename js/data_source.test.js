if (typeof data_source === 'undefined') {
  if (typeof require !== 'undefined')
  {
    var data_source = require('./data_source');
  }
  else
  {
    throw new Error('data_source.test requires data_source');
  }
}

if (typeof chai === 'undefined') {
  if (typeof require !== 'undefined')
  {
    var chai = require('../vendor/chai');
  }
  else
  {
    throw new Error('data_source.test requires chai');
  }
}

var assert = chai.assert;

suite('Define behaviour of default data_source', function(){
  var ds = data_source;

  test('Default min is zero', function(){
    assert.equal(ds.min(),0);
  });

  test('Default max is zero', function(){
    assert.equal(ds.max(),0);
  });

  test('Default function returns zero', function(){
    var x = 42;
    assert.equal(ds(x),0);
  });
});

suite('Polynomial source', function(){

  test('Nullary polynomial source returns zero', function() {
    var ds = data_source.polynomial();
    assert.equal(ds(0),0);
    assert.equal(ds(1),0);
    assert.equal(ds(-1),0);
  });

  test('Unary polynomial creates a constant function', function() {
    var ds = data_source.polynomial(42);
    assert.equal(ds(0),42);
    assert.equal(ds(1),42);
    assert.equal(ds(-1),42);
  });


  test('Binary polynomial with both arguments of zero always returns zero', function() {
    var ds = data_source.polynomial(0,0);
    assert.equal(ds(11.5),0);
  });

  test('Binary polynomial with first argument of zero creates a constant function', function() {
    var a = 0;
    var b = 7;
    var ds = data_source.polynomial(a,b);
    var x = 10;
    assert.equal(ds(11.5),b);
  });

  test('Binary polynomial with second argument of zero creates a line through the origin', function() {
    var a = 7;
    var b = 0;
    var ds = data_source.polynomial(a,b);
    var x = 10;
    var y = a*x;
    assert.equal(ds(x),y);
  });

  test('Binary polynomial composes x->a*x+b', function() {
    var a = 12.5;
    var b = -17;
    var ds = data_source.polynomial(a,b);
    var poly = (function () {return (function(x) {return a*x+b; });})();
    var x = 4.14;
    assert.equal(ds(x),poly(x));
  });

  test('Ternary polynomial composes x->a*x*x+b*x+c', function() {
    var a = 12.5;
    var b = -17;
    var c = 9;
    var ds = data_source.polynomial(a,b,c);
    var poly = (function () {return (function(x) {return a*x*x+b*x+c; });})();
    var x = 4.14;
    assert.equal(ds(x),poly(x));
  });

});

suite('Array of points source', function(){

  var makePoint = data_source.makePoint;

  test('Can retrieve zero from an empty array', function () {
    var pointArray = [];
    var ds = data_source.fromArrayOfPoints(pointArray);
    assert.equal(ds(-17),0);
    assert.equal(ds(0),0);
    assert.equal(ds(42),0);
  });

  test('Can retrieve Y from a single point', function () {
    var x = 12;
    var y = 17;
    var pointArray = [makePoint(x,y)];
    var ds = data_source.fromArrayOfPoints(pointArray);
    assert.equal(ds(x),y);
  });

  test('Can retrieve Y from a two equal points', function () {
    var x = 12;
    var y = 17;
    var point = makePoint(x,y);
    var pointArray = [point,point];
    var ds = data_source.fromArrayOfPoints(pointArray);
    assert.equal(ds(x),y);
  });

  test('Can retrieve Y from horizontal gradient', function () {
    var y = 17;
    var pointArray = [makePoint(11,y), makePoint(42,y)];
    var ds = data_source.fromArrayOfPoints(pointArray);
    var x = 32;
    assert.equal(ds(x),y);
  });

  test('A vertical gradient between two points returns a value within the Y limits', function () {
    var x = 17;
    var yl = -10;
    var yu = 20;
    var pointArray = [makePoint(x,yl), makePoint(x,yu)];
    var ds = data_source.fromArrayOfPoints(pointArray);
    var y = ds(x);
    assert.isTrue(y >= yl);
    assert.isTrue(y <= yu);
  });

});

suite('Array of points retrieve original input', function(){
  var data = [
    {x: -12, y: 1},
    {x: -7, y: 2},
    {x: -1, y: 3},
    {x: 0, y: 4},
    {x: 1, y: 5},
    {x: 7, y: 6},
    {x: 12, y: 7}];
  var ds = data_source.fromArrayOfPoints(data);

  test('Can retrieve original values from data', function () {
    for (var i = 0; i < data.length; i++)
    {
      assert.equal(ds(data[i].x),data[i].y);
    }
  });

  test('importedData field contains original values', function () {
    for (var i = 0; i < data.length; i++)
    {
      assert.equal(data[i].x,(ds.importedData())[i].x);
      assert.equal(data[i].y,(ds.importedData())[i].y);
    }
  });
});

suite('Read a known csv file into an array', function(){
  var ds;

  setup(function(done) {
    ds = data_source.fromCSV("/static/data_source.test.csv", done);
  });

  test('Mocha async works as expected', function(){
    assert.isTrue(ds.ready());
  });

  test('Array has greater than zero length', function () {
    assert.isTrue(ds.importedData().length > 0);
  });

  test('Array contains the arbitrary, expected values', function() {
    var expect = [{x: 1, y:2},
      {x: 3, y:4},
      {x: 5, y:6},
      {x: 7, y:7},
      {x: 8, y:8},
      {x: 9, y:9}];

    assert.deepEqual(expect,ds.importedData());
  });

  test('Min and max are set to the extreme X values of the array', function() {
    assert.equal(ds.min(), 1);
    assert.equal(ds.max(), 9);
  });
});

suite('smooth provides a five point moving average', function(){

  test('Single point array smooths to the same point', function () {
    var initial_array = [{x: +12, y: +17}];
    var initial_source = data_source.fromArrayOfPoints(initial_array);
    var smoothed_source = data_source.smooth(initial_source);

    var points = [ -17, -1, 0, 1, 17];
    var expect = [];
    var result = [];
    for (var i = 0; i < points.length; i++)
    {
      expect.push(initial_source(points[i]));
      result.push(smoothed_source(points[i]));
    }
    assert.deepEqual(expect,result);
    assert.deepEqual(initial_source.importedData(),smoothed_source.importedData());
  });

  test('Double point array smooths to the same point', function () {
    var initial_array = [{x:-11, y:-5}, {x: +12, y: +17}];
    var initial_source = data_source.fromArrayOfPoints(initial_array);
    var smoothed_source = data_source.smooth(initial_source);

    var points = [ -17, -1, 0, 1, 17];
    var expect = [];
    var result = [];
    for (var i = 0; i < points.length; i++)
    {
      expect.push(initial_source(points[i]));
      result.push(smoothed_source(points[i]));
    }
    assert.deepEqual(expect,result);
    assert.deepEqual(initial_source.importedData(),smoothed_source.importedData());
  });

  test('Three point smooth sets middle value to mean of array', function () {
    var initial_array = [{x:2, y:3}, {x: +5, y: +12}, {x: +11, y: +18}];
    var expect_array = [{x:2, y:3}, {x: +6, y: +11}, {x: +11, y: +18}];
    var initial_source = data_source.fromArrayOfPoints(initial_array);
    var smoothed_source = data_source.smooth(initial_source);

    assert.deepEqual(expect_array,smoothed_source.importedData());
  });

  test('Four point smooth sets middle two values to means of triples', function () {
    var initial_array = [{x:2, y:3}, {x: +5, y: +12}, {x: +11, y: +18}, {x: +20, y: +27}];
    var expect_array = [{x:2, y:3}, {x: +6, y: +11}, {x: +12, y: +19}, {x: +20, y: +27}];
    var initial_source = data_source.fromArrayOfPoints(initial_array);
    var smoothed_source = data_source.smooth(initial_source);

    assert.deepEqual(expect_array,smoothed_source.importedData());
  });

  test('Five point smooth sets 2,4 values to means of triples and 3 to mean of all five', function () {
    var initial_array = [{x:2, y:3}, {x: +5, y: +12}, {x: +11, y: +18}, {x: +20, y: +27}, {x: +32, y: +36}];
    var expect_array = [{x:2, y:3}, {x: +6, y: +11}, {x: +14, y: +19.2}, {x: +21, y: +27}, {x: +32, y: +36}];
    var initial_source = data_source.fromArrayOfPoints(initial_array);
    var smoothed_source = data_source.smooth(initial_source);

    assert.deepEqual(expect_array,smoothed_source.importedData());
  });
});

suite('Array of points retrieve original input, c1 data input', function(){
  var data = [
    {x: 36.14, y: 4363},
    {x: 36.65, y: 3714},
    {x: 37.17, y: 3123},
    {x: 37.7, y: 2659},
    {x: 38.23, y: 2264},
    {x: 39.32, y: 2025},
    {x: 41.01, y: 1746},
    {x: 42.18, y: 1523},
    {x: 43.39, y: 1346},
    {x: 45.9, y: 1189},
    {x: 49.24, y: 1051},
    {x: 52.09, y: 928.4},
    {x: 56.67, y: 820.3},
    {x: 60.8, y: 761.6},
    {x: 66.15, y: 681.3},
    {x: 75.07, y: 617.1},
    {x: 85.19, y: 565.8},
    {x: 98.05, y: 525.3},
    {x: 111.3, y: 481.7},
    {x: 126.3, y: 458.4},
    {x: 147.4, y: 420.4},
    {x: 167.3, y: 400.1},
    {x: 198, y: 366.9},
    {x: 224.7, y: 340.6},
    {x: 248, y: 312.3},
    {x: 279, y: 290},
    {x: 301, y: 253.1},
    {x: 323.9, y: 232.1},
    {x: 337.8, y: 210.2},
    {x: 357.4, y: 188},
    {x: 367.6, y: 168.2},
    {x: 383.4, y: 146.8},
    {x: 399.9, y: 128.1},
    {x: 411.3, y: 110.4},
    {x: 423, y: 96.35},
    {x: 435.1, y: 82.03},
    {x: 441.3, y: 69.84},
    {x: 447.5, y: 58.72},
    {x: 453.8, y: 49.99},
    {x: 460.3, y: 41.52},
    {x: 472, y: 35.35},
    {x: 473.4, y: 28.64}];
  var ds = data_source.fromArrayOfPoints(data);

  test('Can retrieve original values from data', function () {
    for (var i = 0; i < data.length; i++)
    {
      assert.equal(ds(data[i].x),data[i].y);
    }
  });

  test('importedData field contains original values', function () {
    for (var i = 0; i < data.length; i++)
    {
      assert.equal(data[i].x,(ds.importedData())[i].x);
      assert.equal(data[i].y,(ds.importedData())[i].y);
    }
  });
});
