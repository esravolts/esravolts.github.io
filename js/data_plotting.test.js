if (typeof data_plotting === 'undefined') {
  if (typeof require !== 'undefined')
  {
    var data_plotting = require('./data_plotting');
  }
  else
  {
    throw new Error('data_plotting.test requires data_plotting');
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

suite('Define behaviour of default data_plotting', function(){

  // At least some tests will involve a dom element.
  test('Initial pass', function () {
    assert.equal(2,2);
  });
});
