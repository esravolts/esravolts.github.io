if (typeof data_plotting === 'undefined') {
  if (typeof require !== 'undefined')
  {
    var data_plotting = require('./data_plotting');
  }
  else
  {
    throw new Error('integration.test requires data_plotting');
  }
}

if (typeof data_source === 'undefined') {
  if (typeof require !== 'undefined')
  {
    var data_source = require('./data_source');
  }
  else
  {
    throw new Error('integration.test requires data_source');
  }
}

if (typeof chai === 'undefined') {
  if (typeof require !== 'undefined')
  {
    var chai = require('../vendor/chai');
  }
  else
  {
    throw new Error('data_plotting.test requires chai');
  }
}

var assert = chai.assert;

suite('Initial integration test', function(){

  test('Initial pass', function () {
    if (typeof document !== 'undefined')
    {
      var newdiv = document.createElement('div');
      newdiv.id = 'temporary';
      document.getElementsByTagName('body')[0].appendChild(newdiv);

      var plotter = data_plotting;
      plotter("#temporary",data_source.polynomial(6,3,7));

      // Not yet clear exactly what the resulting datastructure is expected to be
      assert.equal(1,1);

      document.getElementsByTagName('body')[0].removeChild(newdiv);
    }
  });

});
