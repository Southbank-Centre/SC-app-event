'use strict';
/**
 * Example Spec
 */

describe('Example', function() {

  beforeEach(function(){
    browser.get(browser.params.url + '/');
  });

  it('should have a title', function(){
    expect(browser.getTitle()).not.toBeDefined();
  });

});