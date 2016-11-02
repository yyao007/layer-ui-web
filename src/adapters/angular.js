'use strict';
var layerUI = require('../base');

/**
 * Call this function to initialize all of the angular 1.x directives needed to handle the Layer UI for Web widgets.
 *
 * When passing scope values/function into widget properties, prefix the property with `ng-`;
 * for functions, replace `on-` with `ng-`:
 *
 * ```
 *    <layer-conversation ng-query="myscopeProp.query"></layer-conversation>
 *    <layer-conversation-list ng-conversation-selected="myscope.handleSelectionFunc"></layer-conversation-list>
 * ```
 *
 * Call this function to initialize angular 1.x Directives:
 *
 * ```
 * layerUI.adapters.angular(angular);
 * angular.module('MyApp', ['layerUIControllers']);
 * ```
 *
 *   Now you can put `<layer-conversation>` and other widgets into angular templates and expect them to work.
 *   Prefix ALL property names with `ng-`.
 *
 * @class layerUI.adapters.angular
 * @singleton
 * @param {Object} angular     Pass in the AngularJS library
 */

function initAngular(angular) {

  // Define the layerUIController
  var controllers = angular.module('layerUIControllers', []);

  // Setup the properties for the given widget that is being generated
  function setupProps(scope, elem, attrs, props) {

    /*
     * For each property we are going to do the following:
     *
     * 1. See if there is an initial value
     * 2. Evaluate it against the scope via scope.$eval() so we have a resolved value
     * 3. $observe() for any changes in the property
     * 4. $watch() for any changes in the output of scope.$eval()
     *
     * One complicating factor here: while we do support passing in values such as `query` or `query-id`, these
     * values, if placed within an html template, will be passed directly on to a webcomponent BEFORE
     * this code triggers and corrects those values.  This can cause errors.
     *
     * Instead, if one passes `ng-query` or `ng-query-id` in via the html template, there is no `ng-query` property
     * to pass this value on to until the code below triggers.  The code below will map `ng-query` to `query` AFTER
     * its been evaluated.
     *
     * The above steps are applied once for `query-id`, and a second time for `ng-query-id` so that either one works, but `ng-`
     * works better.
     *
     * Best Practice therefore: Use `ng-` prefix on all properties passed via html template files.
     */
    props.forEach(function(prop) {
      var ngAttributeName = prop.attributeName.indexOf('on-') === 0 ? 'ng-' + prop.attributeName.substring(3) : 'ng-' + prop.attributeName;
      var ngPropertyName = prop.propertyName.indexOf('on') === 0 ? 'ng' + prop.propertyName.substring(2) : 'ng' + prop.propertyName.substring(0,1).toUpperCase() + prop.propertyName.substring(1);
      attrs.$observe(prop.propertyName, function(value) {
        scope.$watch(value, function(value) {
          elem[prop.propertyName] = value;
        });
      });

      attrs.$observe(ngPropertyName, function(value) {
        scope.$watch(value, function(value) {
          if (elem.props) {
            elem[prop.propertyName] = value;
          } else {
            if (!elem.tmpdata) elem.tmpdata = {};
            elem.tmpdata[prop.propertyName] = value;
          }
        });
      });
    });
  }

  // Gather all UI Components flagged as Main Components; other components don't require special wrappers that allow properties
  // embedded in Angular's Templates to correctly handle values.
  Object.keys(layerUI.components).filter(function(componentName) {
    var component = layerUI.components[componentName];
    return component.properties.filter(function(prop) {
      return prop.propertyName === 'isMainComponent';
    }).length;
  }).forEach(function(componentName) {
    var component = layerUI.components[componentName];

    // Get the camel case controller name
    var controllerName = componentName.replace(/-(.)/g, function(str, value) {
      return value.toUpperCase();
    });

    controllers.directive(controllerName, function() {
      return {
        retrict: 'E',
        link: function(scope, elem, attrs) {
          var functionProps = component.properties;
          setupProps(scope, elem[0], attrs, functionProps);
        }
      }
    });
  });
};

module.exports = initAngular;
layerUI.addAdapter('angular', initAngular);
