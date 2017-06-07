/**
 * The Layer Date widget renders a date.
 *
 * This is provided as a specialized component so that it can be easily redefined by your app to
 * provide your own date formatting.  Note that most customization of date rendering can be accomplished instead
 * using layerUI.components.ConversationPanel.dateRenderer.
 *
 * ```
 * layerUI.registerComponent('layer-date', {
 *    properties: {
 *      date: {
 *        set: function(value) {
 *           // Render a random date value that is related to but not exactly the provided value
 *           var newDate = new Date(value);
 *           newDate.setHours(newDate.getHours() + Math.random() * 10);
 *           this.innerHTML = newDate.toISOString();
 *        }
 *      }
 *    }
 * });
 *
 * // Call init after custom components are defined
 * layerUI.init({
 *   appId:  'layer:///apps/staging/UUID'
 * });
 * ```
 *
 * @class layerUI.components.subcomponents.Date
 * @extends layerUI.components.Component
 */
import { registerComponent } from '../../../components/component';

registerComponent('layer-date', {
  properties: {

    /**
     * Date to be rendered
     *
     * TODO: We do not need seconds in a typical date output; need to investigate how to do that with localizations
     *
     * @property {Date} [date=null]
     */
    date: {
      set(value) {
        if (value) {
          if (this.dateRenderer) {
            this.value = this.dateRenderer(value);
          } else {
            const dateStr = value.toLocaleDateString();
            const timeStr = value.toLocaleTimeString();
            if (this.dateOrTime) {
              this.value = new Date().toLocaleDateString() === dateStr ? timeStr : dateStr;
            } else {
              this.value = new Date().toLocaleDateString() === dateStr ? timeStr : dateStr + ' ' + timeStr;
            }
          }
        } else {
          this.value = '';
        }
      },
    },

    /**
     * The actual rendered string.
     *
     * @property {String} [value='']
     */
    value: {
      set(value) {
        this.innerHTML = value;
      },
    },

    /**
     * Provide property to override the function used to render a date for each Message Item.
     *
     * Note that changing this will not regenerate the list; this should be set when initializing a new List.
     *
     * ```javascript
     * dateItem.dateRenderer = function(date) {
     *    return date.toISOString();
     * };
     * ```
     *
     * @property {Function} [dateRender=null]
     */
    dateRenderer: {},

    dateOrTime: {
      type: Boolean,
    },
  },
});

