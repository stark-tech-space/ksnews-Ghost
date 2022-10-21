import Component from '@ember/component';
import classic from 'ember-classic-decorator';
import {action, computed} from '@ember/object';
import {inject as service} from '@ember/service';

const VISIBILITIES = [
    {label: 'Public', name: 'public'},
    {label: 'Members only', name: 'members'},
    {label: 'Paid-members only', name: 'paid'}
];

@classic
export default class GhPsmVisibilityInput extends Component {
    @service settings;

    @service intl;

    // public attrs
    post = null;

    @computed('post.visibility')
    get selectedVisibility() {
        return this.get('post.visibility') || this.settings.defaultContentVisibility;
    }

    init() {
        super.init(...arguments);
        this.availableVisibilities = [...VISIBILITIES];
        this.availableVisibilities.push({label: 'Specific tier(s)', name: 'tiers'});
        this.availableVisibilities = this.availableVisibilities.map((_) => {
            return {
                ..._,
                label: this.intl.t(`Manual.Settings.${_.label.replace(/ /g, '_')}`)
            };
        });
    }

    @action
    updateVisibility(newVisibility) {
        this.post.set('visibility', newVisibility);
        if (newVisibility !== 'tiers') {
            this.post.set('tiers', []);
        }
    }
}
