import { registerComponent } from '../../../components/component';
import ListItem from '../../../mixins/list-item';
import MessageItemMixin from '../layer-message-item-mixin';
import '../../subcomponents/layer-avatar/layer-avatar';
import '../../subcomponents/layer-delete/layer-delete';
import '../../subcomponents/layer-date/layer-date';
import '../../subcomponents/layer-message-status/layer-message-status';

registerComponent('layer-message-item-sent', {
  mixins: [ListItem, MessageItemMixin],
});
