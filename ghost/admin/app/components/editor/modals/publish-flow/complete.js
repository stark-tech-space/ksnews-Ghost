import Component from '@glimmer/component';
import {inject as service} from '@ember/service';

export default class PublishFlowOptions extends Component {
    @service settings;

    get isZhLocale() {
        return this.settings.get('locale') ? this.settings.get('locale').startsWith('zh') : true;
    }
}
