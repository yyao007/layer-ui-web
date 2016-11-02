/**
 * The Layer Date widget renders a date.
 *
 * This is provided as a specialized component so that it can be easily redefined by your app to
 * provide your own date formatting.
 *
 * @class layerUI.components.misc.Date
 * @extends layerUI.components.Component
 */
var layerUI = require('../../../base');
var layer = layerUI.layer;
var LUIComponent = require('../../../components/component');
LUIComponent('layer-file-upload-button', {
  properties: {

    /**
     * Date to be rendered
     *
     * @property {Date}
     */
    date: {
      set: function(value){
        if (value) {
          var dateStr = value.toLocaleDateString(),
            timeStr = value.toLocaleTimeString()
          this.innerHTML = new Date().toLocaleDateString() == dateStr ? timeStr : dateStr + ' ' + timeStr;
        } else {
          this.innerHTML = '';
        }
      }
    }
  },
  methods: {

    /**
     * Constructor.
     *
     * @method created
     * @private
     */
    created: function() {
      this.nodes.input.id = layer.Util.generateUUID();
      this.nodes.label.setAttribute('for', this.nodes.input.id);
      this.nodes.input.addEventListener('change', this.onChange.bind(this));
      this.addEventListener('click', function(evt) {this.nodes.input.click();}.bind(this));
    },

    /**
     * When the file input's value has changed, gather the data and trigger an event
     */
    onChange: function() {
      var files = this.nodes.input.files;
      var parts = Array.prototype.map.call(files, function(file) {
        return new layer.MessagePart(file);
      }, this);
      layerUI.files.processAttachments(parts, {width: 300, height: 300}, function(newParts) {
        this.trigger('layer-file-selected', {
          parts: newParts
        });
      }.bind(this));
    }
  }
});
