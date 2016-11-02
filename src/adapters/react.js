'use strict';
var layerUI = require('../base');
var libraryResult;
/**
 * Call this function to initialize all of the react components needed to handle the Layer UI for Web widgets.
 *
 * Initialize with:
 *
 * ```
 * import React from 'react';
 * import ReactDom from 'react-dom';
 * const { Conversation, ConversationList, UserList, Notifier } = layerUI.adapters.react(React, ReactDom);
 * ```
 *
 * Calling this will expose the following React Components:
 *
 * * Conversation: A wrapper around a layerUI.components.Conversation
 * * ConversationList: A wrapper around a layerUI.components.ConversationList
 * * UserList: A wrapper around a layerUI.components.UserList
 * * Notifier: A wrapper around a layerUI.components.misc.Notifier
 *
 * You can then use:
 *
 * ```
 * render: function() {
 *    return <ConversationList
 *      on-conversation-selected={this.mySelectHandler}></ConversationList>
 * }
 * ```
 *
 * @class layerUI.adapters.react
 * @singleton
 * @param {Object} React - Pass in the reactJS library
 * @param {Object} ReactDom - Pass in the ReactDom library
 */
function initReact(React, ReactDom) {
  if (libraryResult) return libraryResult;
  libraryResult = {};

  // Gather all UI Components flagged as Main Components; other components don't require special React Components for direct use.
  Object.keys(layerUI.components).filter(function(componentName) {
    var component = layerUI.components[componentName];
    return component.properties.filter(function(prop) {
      return prop.propertyName === 'isMainComponent';
    }).length;
  }).forEach(function(componentName) {
    var component = layerUI.components[componentName];

    // Get the camel case Component name
    var className = (componentName.substring(0, 1).toUpperCase() + componentName.substring(1).replace(/-(.)/g, function(str, value) {
      return value.toUpperCase();
    })).replace(/^Layer/, '');

    libraryResult[className] = React.createClass({
      /**
       * Copy all properties into the dom node, but never let React recreate this widget.
       */
      shouldComponentUpdate: function(nextProps) {
        Object.keys(nextProps).forEach(function(propName) {
          var camelName = layerUI.camelCase(propName);
          if (nextProps[propName] !== this.props[propName]) {
            this.node[camelName] = nextProps[propName];
          }
        }, this);
        return false;
      },

      /**
       * On mounting, copy in all properties, and optionally setup a Query.
       */
      componentDidMount: function() {
        this.node = ReactDom.findDOMNode(this);
        // Without this delay, Webcomponents property setters will be blown away in safari and firefox
        layerUI.defer(function() {
          Object.keys(this.props).forEach(function(propName) {
            var camelName = layerUI.camelCase(propName);
            this.node[camelName] = this.props[propName];
          }, this);
        }.bind(this));
      },

      render: function() {
        return React.createElement(componentName);
      }
    });
  });
  return libraryResult;
};

module.exports = initReact;
layerUI.addAdapter('react', initReact);

