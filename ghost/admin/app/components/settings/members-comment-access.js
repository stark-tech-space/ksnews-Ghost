import Component from '@glimmer/component';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';

export default class SettingsMembersCommentAccess extends Component {
    @service settings;
    @service intl;

    get options() {
        return [
            {
                name: 'Nobody',
                description: 'Disable commenting completely',
                value: 'off',
                icon: 'no-members',
                icon_color: 'midlightgrey-d2'
            },
            {
                name: 'All members',
                description: 'Logged-in members',
                value: 'all',
                icon: 'members-all',
                icon_color: 'blue'
            },
            {
                name: 'Paid-members only',
                description: 'Only logged-in members with an active Stripe subscription',
                value: 'paid',
                icon: 'members-paid',
                icon_color: 'pink'
            }
        ].map((_) => {
            return {
                ..._,
                name: this.intl.t(`Manual.Settings.${_.name.replace(/\s/g, '_')}`),
                description: this.intl.t(`Manual.Settings.${_.description.replace(/\s/g, '_')}`)
            };
        });
    }

    get selectedOption() {
        return this.options.find((o) => o.value === this.settings.commentsEnabled);
    }

    @action
    setCommentAccess(option) {
        this.settings.commentsEnabled = option.value;
        this.args.onChange?.(option.value);
    }
}
