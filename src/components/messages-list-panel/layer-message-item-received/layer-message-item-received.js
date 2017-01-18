import LUIComponent from '../../../components/component';
import ListItem from '../../../mixins/list-item';
import MessageItemMixin from '../layer-message-item-mixin';

LUIComponent('layer-message-item-received', {
  mixins: [ListItem, MessageItemMixin],
});
