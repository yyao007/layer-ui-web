/**
 * This is the base class for all UI classes in the Layer UI Framework.
 *
 * It works with the webcomponent API/polyfill to define components that:
 *
 * * Provides getters/setters for all defined properties
 * * Read the widget's attributes on being initialized, copying them into properties and triggering property setters
 * * Provides created and destroyed callbacks
 * * Automate standard template-related tasks
 * * Automate standard event-related tasks
 *
 * Methods and properties defined here should only be needed by developers wishing to build new widgets or evolve existing widgets.
 * Note that widgets can be created using other frameworks based on the webcomponent polyfill and still work here.
 *
 * A new component is created using:
 *
 * ```
 * var componentDefinition = {
 *   properties: {
 *      prop1: {
 *          set: function(value) {
 *              this.myRenderer();
 *          }
 *      },
 *      prop2: {
 *          get: function() {
 *              return this.scrollTop;
 *          }
 *      },
 *      prop3: {
 *          value: "Frodo is a Dodo"
 *      },
 *      prop4: {
 *          type: Function
 *      }
 *   },
 *   methods: {
 *     created: function() {
 *        alert("The widget has been created");
 *     },
 *     myRenderer: function() {
 *        this.innerHTML = this.props.prop1;
 *     }
 *   }
 * };
 * ```
 *
 * A component defined this way can be registered as follows:
 *
 * ```
 * var layerUI = require('websdk-ui-webcomponents');
 * layerUI.registerComponent(componentDefinition);
 * ```
 *
 * ### Properties
 *
 * A property definition can be as simple as:
 *
 * ```
 * layerUI.registerComponent({
 *    properties: {
 *       prop1: {}
 *    }
 * });
 * ```
 *
 * The above code declares `prop1` to be a property, sets up a setter that writes `widget.props.prop1` any time `widget.prop1` is set,
 * and sets up a getter to read the value from `widget.props.prop1`.  It also insures that at initialization time, if a `prop1` attribute
 * is found, it will be used as the `prop1` property.
 *
 * Property Definitions support the following keys:
 *
 * *  set: A setter function whose input is the new value.  Note that your setter function is called AFTER this.props.propName
 *    has been set with the new value; your setter is for any side effects, rendering updates, or additional processing and NOT
 *    for writing the value itself.
 * *  get: A getter is needed if getting the property value from `this.props.propName` is not getting the latest value.
 *    Perhaps you want to return `this.nodes.input.value` to get text typed in by a user.
 * *  value: If a `value` key is provided, then this will be the default value of your property, to be used if a value is
 *    not provided by the component creator.
 * *  type: Currently accepts `Boolean` or `Function` (not a string, the actual javascript keyword).  Using a type makes the system
 *    more forgiving when processing strings.  For example, if type is Boolean, and "false" or "0" is passed in as a string, this will
 *    evaluate to `false`.  This exists because attributes frequently arrive as strings due to the way HTML attributes work.
 *    Using this with functions will cause your function string to be evaled, but will lose your function scope and `this` pointer.
 *
 * Example
 *
 * ```
 *  isEnabled: {
 *    type: Boolean,
 *    value: true,
 *    set: function(inValue) {
 *       this.classList.toggle('widget-enabled', inValue);
 *    },
 *    get: function() {
 *       return this.classList.contains('widget-enabled');
 *    }
 * }
 * ```
 *
 * ### Events
 *
 * As part of your layerUI.components.Component.registerComponents call you can pass in an `events` array; this is an array of strings representing events to listen for,
 * and provide as property-based event listeners.
 *
 * Example:
 *
 * ```
 * layerUI.registerComponent({
 *    events: ['layer-something-happening', 'layer-nothing-happening', 'your-custom-event']
 * });
 * ```
 *
 * The above component definition will result in:
 *
 * 1. The component will listen for the 3 events listed, regardless of whether this component triggered the event,
 *    or its child components triggered the event.
 * 2. The component will define the following properties: `onSomethingHappening`, `onNothingHappening` and `onYourCustomEvent`. These properties
 *    are defined for you, you do not need to do anything more than list the events in the events array.
 * 3. Your app can now use either `document.body.addEventListener('layer-nothing-happening')` or `widget.onNothingHappening = function(evt) {}`
 *
 * ### Methods
 *
 * You may provide any methods you want within the `methods` hash; be aware though that some methods have already been setup for you
 * and that some methods have important life-cycle implications if you create them:
 *
 * * created: where you can initialize your component's state
 * * destroyed: where you can cleanup any resources used by your component
 *
 *
 * @class layerUI.components.Component
 */


/**
 * Register a component using the specified HTML tagName.
 *
 * Note that if you have used layerUI.settings `customComponents` to prevent loading
 * of a Component, and are now providing your own Component definition,
 * you need to use the `force` parameter to allow this definition to register.
 *
 * Note that you may define your components and styles any way you like, you do not need to conform your
 * component structure to the expected input of this function.  This function Does however provide
 * many simplifying capabilities including
 *
 *  * Auto-generation of setters/getters removing unneccessary boilerplate
 *  * Automatic mapping of hyphen-cased properties to camel-case attributes used within your component
 *  * Automatic applying of any property values passed in before your setters could trigger; gaurentees setters trigger after initialization
 *  * Automatic detection and copying of attribute values into properties
 *  * Utilities for managing templates and styles that are seen within `layerUI` all depend upon this structure.
 *
 * @method registerComponent
 * @static
 * @param {String} tagName - Tag name that is being defined (`layer-avatar`)
 * @param {Object} classDef - Definition of your class
 * @param {Object} classDef.properties - Definition of your class properties
 * @param {Object} classDef.methods - Definition of your class methods
 * @param {String[]} classDef.events - Array of events to listen for and repackage as event handler properties
 * @param {Boolean} force - If set to true, layerUI.settings.customComponents will not skip this class definition.
 */
var layerUI = require('../base');
module.exports = layerUI.registerComponent = function(tagName, classDef, force) {
  if (layerUI.settings.customComponents.indexOf(tagName) !== -1 && !force) return;

  // Provides a basic mixin mechanism; Provide an array of objects with a `properties` key and a `methods` key,
  // and all property defintions and method defintions will be copied into your classDef UNLESS your classDef
  // has provided its own definition.
  // If your mixin provides a created() method, it will be called after the classDef created() method is called;
  // this will be called for any number of mixins.
  if (classDef.mixins) {
    classDef.mixins.forEach(function(mixin) {
      Object.keys(mixin.properties || []).forEach(function(propertyName) {
        if (!classDef.properties[propertyName]) classDef.properties[propertyName] = mixin.properties[propertyName];
      });

      Object.keys(mixin.methods || []).forEach(function(propertyName) {
        if (propertyName === 'created') {
          if (!classDef.__created) classDef.__created = [];
          classDef.__created.push(mixin.methods.created);
        } else {
          if (!classDef.methods[propertyName]) classDef.methods[propertyName] = mixin.methods[propertyName];
        }
      });
    });
  }

  classDef.properties._layerEventSubscriptions = {};

  // Any event specified in the events array we are going to listen for, and make available to the user of this Component
  // as a `widget.onEventName = myfunc(evt){...}` event handler assignment, allowing them to use this or
  // `addEventListener`.  The events array may contain events from child components or events triggered by this component.
  (classDef.events || []).forEach(function(eventName) {
    var camelEventName = layerUI.camelCase(eventName.replace(/^layer-/, ''));
    var callbackName = 'on' + camelEventName.charAt(0).toUpperCase() + camelEventName.substring(1);
    if (!classDef.properties[callbackName]) {
      classDef.properties[callbackName] = {
        type: Function,
        set: function(value) {
          if (this.props['old-' + eventName]) {
            this.removeEventListener(eventName, this.props['old-' + eventName]);
            this.props['old-' + eventName] = null;
          }
          if (value) {
            this.addEventListener(eventName, value);
            this.props['old-' + eventName] = value;
          }
        }
      }
    }
  }, this);

  // For each property in the methods hash, setup the setter/getter
  var propertyDefHash = {};
  var props = Object.keys(classDef.properties).map(function(propName) {
    return {
      propertyName: propName,
      attributeName: layerUI.hyphenate(propName),
      order: classDef.properties[propName].order
    };
  }).sort(function(a, b) {
    if (a.order !== undefined && b.order === undefined) return -1;
    if (b.order !== undefined && a.order === undefined) return 1;
    if (a.order < b.order) return -1;
    if (a.order > b.order) return 1;
    return 0;
  });

  props.forEach(function(prop) {
    var name = prop.propertyName;
    var attributeName = prop.attributeName;
    var propDef = classDef.properties[name];
    propertyDefHash[name] = propDef;

    // The new definition which will be derived from the provided definition.
    var newDef = {};

    // If a getter is provided, use it. else provide a getter that returns this.props[name]
    // so that developers don't have to provide a getter for every property.
    if (propDef.get) {
      newDef.get = propDef.get;
    } else {
      newDef.get = function() {
        return this.props[name];
      };
    }

    // The property setter will set this.props[name] and then if there is a custom setter, it will be invoked.
    // This means that the setter does NOT need to write to this.props, but can handle side effects, transformations, etc...
    newDef.set = function(value) {
      if (layerUI.debug) console.log("Set property " + this.tagName + '.' + name + " to ", value);
      // Currently Boolean is the only supported type, and is used so that anyone passing a value via innerHTML which is always a string will
      // have some chance of it not being treated as always true.
      switch(propDef.type) {
        // Flag the input string as a Boolean value so that when we get the value as a string, we can make sure a string of "false" or "0" is not treated as true
        case Boolean:
          if (['false', '0', 'null', 'undefined'].indexOf(value) !== -1) {
            value = false;
          } else {
            value = Boolean(value);
          }
          break;

        // Flag onRenderListItem as a Function to make sure it gets evaled and is executable
        case Function:
          value = typeof value === 'string' ? eval('(' + value + ')') : value;
          break;
      }
      var oldValue = (classDef[name].get) ? classDef[name].get.call(this) : this.props[name];
      if (oldValue !== value) {
        this.props[name] = value;
        if (propDef.set) propDef.set.call(this, value, oldValue);
      }
    };

    // Write the property def to our class
    classDef[name] = newDef;
  });

  // Safari gets back something other than the constructor with `this.constructor`;
  // this property is the new way to access the constructor.
  classDef._constructor = {
    get: function() {return layerUI.components[tagName];}
  }

  // Cleanup; we no longer need this properties object.
  delete classDef.properties;

  // For every method, add the expected structure to the function
  var methods = Object.keys(classDef.methods);
  methods.forEach(function(name) {
    classDef[name] = {
      value: classDef.methods[name],
      writable: true
    };
  });
  delete classDef.methods;

  /**
   * If your component has a `created` method, it will be called as follows:
   *
   * * Your widget will be initialized
   * * A template will be copied into your widget
   * * Key nodes in the template will be found and added to `this.nodes`
   * * Your `created` method is called
   * * Any Mixin `created` methods will be called
   * * Any attributes found on your widget will be copied from attributes into properties and trigger property setters
   *
   * Note that the widget may have a parent element when `created` is called, but it is not gaurenteed yet to be within `body`.
   *
   * Notes on Lifecycle:
   *
   * * properties are set from attributes after `created` as `created` is assumed to initialize all state, pointers, etc...
   *   This allows property setters to work with a fully initialized state.
   *
   * @method created
   */
  classDef.createdCallback = {
    value: function() {
      if (!layerUI.components[tagName]) return;
      /**
       * Hash of all property names/values for this widget.
       *
       * All properties are stored in `this.props`; any property defined in the class definition's properties hash
       * are read and written here.
       *
       * @property {Object} props
       */
      this.props = {
        _layerEventSubscriptions: []
      };

      /**
       * Any dom node in a template file that has a `layer-id` will be written to this hash.
       *
       * Example:
       *
       * ```
       * <template>
       *   <a layer-id='link'><img layer-id='image' /></a>
       * </template
       * ```
       *
       * The above template will result in a `nodes` value of:
       *
       * ```
       * {
       *     link: anchorObject,
       *     image: imageObject
       * }
       * ```
       *
       * And then allow me to have code such as:
       *
       * ```
       * render: function() {
       *    this.nodes.image.src = this.props.url;
       * }
       * ```
       *
       * @property {Object} nodes    Hash of nodes indexed by layer-id attribute value.
       */
      this.nodes = {};

      // If a template has been assigned for this class, append it to this node, and parse for layer-ids
      var template = this.getTemplate();
      if (template) {
        var clone = document.importNode(template.content, true);
        this.appendChild(clone);
        this.setupDomNodes();
      }

      // Call the Compoent's created method
      if (this.created) this.created();

      // Call any Mixin created methods
      if (classDef.__created) classDef.__created.forEach(function(mixinCreated) {
        mixinCreated.apply(this);
      }, this);

      // Copy all DOM attributes into class properties, triggering property setters
      props.forEach(function(prop) {
        var value = this.getAttribute(prop.attributeName);
        // Firefox seems to need this alternative to getAttribute().
        // TODO: Verify this and determine if it uses the getter here.
        if (value === null && this[prop.attributeName] !== undefined) {
          value = this[prop.attributeName];
        }

        if (value === null && this.tmpdata && this.tmpdata[prop.propertyName] !== undefined) {
          value = this.tmpdata[prop.propertyName];
        }

        if (value !== null) {
          this[prop.propertyName] = value;
        } else if (this[prop.propertyName] !== undefined) {
          value = this[prop.propertyName];
          // this only happens in firefox; somehow the property rather than the attribute is set, but
          // the setter is never called; call it now.
          // TODO: Verify this
          if (classDef[prop.propertyName].set) {
            classDef[prop.propertyName].set.call(this, value);
          }
        } else if ('value' in propertyDefHash[prop.propertyName]) {
          this[prop.propertyName] = propertyDefHash[prop.propertyName].value;
        } else {
          this.props[prop.propertyName] = null;
        }
      }, this);
      if (this.tmpdata) this.tmpdata = null;
    }
  };

  /**
   * The setupDomNodes method looks at all child nodes of this node that have layer-id properties and indexes them in the `nodes` property.
   *
   * Typically, this node has child nodes loaded via its template, and ready by the time your `created` method is called.
   *
   * This call is made on your behalf prior to calling `created`, but if using templates after `created` is called,
   * you may need to call this directly.
   *
   * @method setupDomNodes
   */
  classDef.setupDomNodes = {
    value: function() {
      this.nodes = {};
      this.querySelectorAllArray('*').forEach(function(node) {
        var id = node.getAttribute('layer-id');
        if (id) this.nodes[id] = node;
      }, this);
    }
  };

  /**
   * Add a `destroyed` method to your component which will be called when your component has been removed fromt the DOM.
   *
   * Use this instead of the WebComponents `detachedCallback` as some
   * boilerplate code needs to be run (this code will shut off all event listeners the widget has setup).
   *
   * Your `destroyed` callback will run after the node has been removed from the document
   * for at least 10 seconds.  See the `layer-widget-destroyed` event to prevent the widget from being destroyed after removing
   * it from the document.
   *
   * @method destroyed
   */
  /**
   * By default, removing this widget from the dom will cause it to be destroyed.
   *
   * Using the `layer-widget-destroyed` event, you may override this behavior using `evt.preventDefault()`:
   *
   * ```
   * document.body.addEventListener('layer-widget-destroyed', function(evt) {
   *    if (evt.target === nodeToNotDestroy) {
   *      evt.preventDefault();
   *    }
   * });
   * ```
   *
   * @event layer-widget-destroyed
   */
  classDef.detachedCallback = {
    value: function() {

      // Wait 10 seconds after its been removed, then check to see if its still removed from the dom before doing cleanup and destroy.
      setTimeout(function() {
        if (!document.body.contains(this) && !document.head.contains(this) && this.trigger('layer-widget-destroyed')) {
          this._layerEventSubscriptions.forEach(function(subscribedObject) {
            subscribedObject.off(null, null, this);
          }, this);
          this._layerEventSubscriptions = [];
          this.classList.add('layer-node-destroyed');

          // Call the provided constructor
          if (this.destroyed) this.destroyed();
        }
      }.bind(this), 10000);
    }
  };

  /**
   * Any time a widget's attribute has changed, copy that change over to the properties where it can trigger the property setter.
   *
   * @method attributeChangedCallback
   * @param {String} name      Attribute name
   * @param {Mixed} oldValue   Original value of the attribute
   * @param {Mixed} newValue   Newly assigned value of the attribute
   */
  classDef.attributeChangedCallback = {
    value: function(name, oldValue, newValue) {
      if (layerUI.debug) console.log("Attribute Change on " + this.tagName + '.' + name + " from " + oldValue + " to ", newValue);
      this[layerUI.camelCase(name)] = newValue;
    }
  }

  /**
   * Return the default template or the named template for this Component.
   *
   * Get the default template:
   *
   * ```
   * var template = widget.getTemplate();
   * ```
   *
   * Get a named template:
   *
   * ```
   * var template = widget.getTemplate('layer-message-item-received');
   * ```
   *
   * Typical components should not need to call this; this will be called automatically prior to calling the Component's `created` method.
   * Some components wanting to reset dom to initial state may use this method explicitly:
   *
   * ```
   * var template = this.getTemplate();
   * var clone = document.importNode(template.content, true);
   * this.appendChild(clone);
   * this.setupDomNodes();
   * ```
   *
   * @method getTemplate
   * @param {String} [templateName='default']
   * @returns {HTMLTemplateElement}
   */
  classDef.getTemplate = {
    value: function(templateName) {
      templateName = templateName || 'default';

      if (layerUI.components[tagName].styles && layerUI.components[tagName].styles[templateName] && layerUI.components[tagName].renderedStyles[templateName] === false) {
        var styleNode = document.createElement('style');
        styleNode.id='style-' + this.tagName.toLowerCase() + '-' + templateName;
        styleNode.innerHTML = layerUI.components[tagName].styles[templateName];
        document.getElementsByTagName('head')[0].appendChild(styleNode);
        layerUI.components[tagName].renderedStyles[templateName] = true;
      }
      return layerUI.components[tagName].templates ? layerUI.components[tagName].templates[templateName] : null;
    }
  };

  /**
   * Triggers a dom level event which bubbles up the dom.
   *
   * Call with an event name and a `detail` object:
   *
   * ```
   * this.trigger('something-happened', {
   *   someSortOf: 'value'
   * });
   * ```
   *
   * The `someSortOf` key, and any other keys you pass into that object can be accessed via `evt.detail.someSortOf` or `evt.detail.xxxx`:
   *
   * ```
   * // Listen for the something-happened event which because it bubbles up the dom,
   * // can be listened for from any parent node
   * document.body.addEventListener('something-happened', function(evt) {
   *   console.log(evt.detail.someSortOf);
   * });
   * ```
   *
   * layerUI.components.Component.events can be used to generate properties to go with your events, allowing
   * the following widget property to be used:
   *
   * ```
   * this.onSomethingHappened = function(detail) {
   *   console.log(detail.someSortOf);
   * });
   * ```
   *
   * @method trigger
   * @param {String} eventName
   * @param {Object} detail
   * @returns {Boolean} True if process should continue with its actions, false if application has canceled
   *                    the default action using `evt.preventDefault()` (perhaps an event listener wanted to handle the action itself)
   */
  classDef.trigger = {
    value: function(eventName, details) {
      var evt = new CustomEvent(eventName, {
        detail: details,
        bubbles: true,
        cancelable: true
      });
      this.dispatchEvent(evt);
      return !evt.defaultPrevented;
    }
  };

  /**
   * Return array of matching elements as an Array.
   *
   * This basically just calls this.querySelectorAll and then returns a proper Array rather than a NodeList.
   *
   * @method querySelectorAllArray
   * @param {String} XPath selector
   * @returns {HTMLElement[]}
   */
  classDef.querySelectorAllArray = {
    value: function(selector) {
      return Array.prototype.slice.call(this.querySelectorAll(selector));
    }
  };

  // Register the component with our components hash as well as with the document.
  layerUI.components[tagName] = document.registerElement(tagName, {
    prototype: Object.create(HTMLElement.prototype, classDef)
  });

  /**
   * Hash of template names as keys, Template dom nodes as values.
   *
   * These templates are used during Component initializations.
   *
   * @type {Object}
   * @private
   * @static
   */
  layerUI.components[tagName].templates = {};

  /**
   * Hash of template names as keys, and stylesheet strings as values.
   *
   * A stylesheet string can be added to the document via `styleNode.innerHTML = value` assignment.
   *
   * @type {Object}
   * @private
   * @static
   */
  layerUI.components[tagName].styles = {};

  /**
   * Hash of template names as keys, and booleans as values, indicating which template's styles have been added to the DOM.
   *
   * A style node should only ever be added to the DOM once; if the boolean is set to true, then its been added.
   *
   * @type {Object}
   * @private
   * @static
   */
  layerUI.components[tagName].renderedStyles = {};

  /**
   * Identifies the properties exposed by this component.
   *
   * Used by adapters.  Each element of the array consists of:
   *
   * ```
   * {
   *    propertyName: 'onReadThisDoc',
   *    attributeName: 'on-read-this-doc',
   *    order: 10
   * }
   * ```
   *
   * @type {Object[]}
   * @static
   */
  layerUI.components[tagName].properties = props;
};