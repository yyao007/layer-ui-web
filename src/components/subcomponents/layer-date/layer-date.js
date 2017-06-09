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
    format: {
      value: {},
      set(value) {
        if (typeof value === 'string') {
          try {
            this.properties.format = JSON.parse(value);
          } catch (e) {
            this.properties.format = {};
          }
        }
        this.onRender();
      },
    },

    todayFormat: {
      value: {},
      set(value) {
        if (typeof value === 'string') {
          try {
            this.properties.todayFormat = JSON.parse(value);
          } catch (e) {
            this.properties.todayFormat = {};
          }
        }
        this.onRender();
      },
    },

    /**
     * Date to be rendered
     *
     * TODO: We do not need seconds in a typical date output; need to investigate how to do that with localizations
     *
     * @property {Date} [date=null]
     */
    date: {
      set(value) {
        this.setAttribute('title', value ? value.toLocaleString() : '');
        this.onRender();
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

    /**
     * Values are 'always', 'never', 'ifold'.
     */
    showYear: {
      value: 'ifold',
    },
  },
  methods: {
    onRender: function onRender() {
      const value = this.date;
      if (value) {
        if (this.dateRenderer) {
          this.value = this.dateRenderer(value);
        } else {
          const today = new Date();
          const isToday = value.toLocaleDateString() === today.toLocaleDateString();
          const formatSrc = isToday ? this.todayFormat : this.format;
          const isThisYear = today.getFullYear() === value.getFullYear();
          const monthsDiff = today.getMonth() - value.getMonth() + (12 * (today.getFullYear() - value.getFullYear()));
          const isWithinSixMonths = monthsDiff < 6;
          const format = {};
          Object.keys(formatSrc).forEach(name => (format[name] = formatSrc[name]));

          if (!format.year) {
            switch (this.showYear) {
              case 'always':
                format.year = 'numeric';
                break;
              case 'ifold':
                if (!isThisYear && !isWithinSixMonths) format.year = 'numeric';
                break;
            }
          }
          this.value = value.toLocaleString('lookup', format);
        }
      } else {
        this.value = '';
      }
    },
  },
});

