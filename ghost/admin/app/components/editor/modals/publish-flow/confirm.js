import Component from '@glimmer/component';
import moment from 'moment-timezone';
import {htmlSafe} from '@ember/template';
import {isArray} from '@ember/array';
import {isServerUnreachableError} from 'ghost-admin/services/ajax';
import {inject as service} from '@ember/service';
import {task} from 'ember-concurrency';
import {tracked} from '@glimmer/tracking';

function isString(str) {
    return toString.call(str) === '[object String]';
}

export default class PublishFlowOptions extends Component {
    @service settings;

    @tracked errorMessage;

    @service intl;

    // store any derived state from PublishOptions on creation so the copy
    // doesn't change whilst the post is saving
    willEmail = this.args.publishOptions.willEmail;
    willPublish = this.args.publishOptions.willPublish;

    buttonTextMap = {
        'publish+send': {
            idle: 'Publish & send',
            running: 'Publishing & sending',
            success: 'Published & sent'
        },
        send: {
            idle: 'Send email',
            running: 'Sending',
            success: 'Sent'
        },
        publish: {
            idle: 'Publish',
            running: 'Publishing',
            success: 'Published'
        },
        schedule: {
            // idle: '', - uses underlying publish type text
            running: 'Scheduling',
            success: 'Scheduled'
        }
    };

    get isZhLocale() {
        return this.settings.get('locale') ? this.settings.get('locale').startsWith('zh') : true;
    }

    get publishType() {
        const {publishOptions} = this.args;

        if (this.willPublish && this.willEmail) {
            return 'publish+send';
        } else if (publishOptions.willOnlyEmail) {
            return 'send';
        } else {
            return 'publish';
        }
    }

    get confirmButtonText() {
        let buttonText = '';

        const isZhLocale = this.isZhLocale;

        buttonText = this.buttonTextMap[this.publishType].idle;
        if (buttonText) {
            buttonText = this.intl.t(`Manual.Posts.${buttonText.replace(/ /g, '_')}`);
        }

        if (this.publishType === 'publish') {
            const displayName = this.intl.t(`Manual.Components.${this.args.publishOptions.post.displayName}`);
            buttonText += `${isZhLocale ? '' : ' '}${displayName}`;
        }

        if (this.args.publishOptions.isScheduled) {
            const scheduleMoment = moment.tz(this.args.publishOptions.scheduledAtUTC, this.settings.timezone);

            const scheduleStr = `${this.intl.t('Manual.Components._on_')}${scheduleMoment.format('MMMM Do')}`;
            if (isZhLocale) {
                buttonText = `${scheduleStr}${buttonText}`;
            } else {
                buttonText += `,${scheduleStr}`;
            }
        } else {
            const rightNowStr = this.intl.t('Manual.Components._right_now');
            if (isZhLocale) {
                buttonText = `${rightNowStr}${buttonText}`;
            } else {
                buttonText += `,${rightNowStr}`;
            }
        }

        return buttonText;
    }

    get confirmRunningText() {
        const publishType = this.args.publishOptions.isScheduled ? 'schedule' : this.publishType;
        return this.intl.t(`Manual.Posts.${this.buttonTextMap[publishType].running.replace(/ /g, '_')}`);
    }

    get confirmSuccessText() {
        const publishType = this.args.publishOptions.isScheduled ? 'schedule' : this.publishType;
        return this.intl.t(`Manual.Posts.${this.buttonTextMap[publishType].success.replace(/ /g, '_')}`);
    }

    @task({drop: true})
    *confirmTask() {
        this.errorMessage = null;

        try {
            yield this.args.saveTask.perform();
        } catch (e) {
            if (e === undefined && this.args.publishOptions.post.errors.length !== 0) {
                // validation error
                const validationError = this.args.publishOptions.post.errors.messages[0];
                this.errorMessage = `Validation failed: ${validationError}`;
                return false;
            }

            let errorMessage = '';

            const payloadError = e?.payload?.errors?.[0];

            if (isServerUnreachableError(e)) {
                errorMessage = 'Unable to connect, please check your internet connection and try again.';
            } else if (payloadError?.type === 'HostLimitError') {
                errorMessage = htmlSafe(payloadError.context.replace(/please upgrade/i, '<a href="#/pro">$&</a>'));
            } else if (e && isString(e)) {
                errorMessage = e;
            } else if (e && isArray(e)) {
                // This is here because validation errors are returned as an array
                // TODO: remove this once validations are fixed
                errorMessage = e[0];
            } else if (payloadError?.message) {
                errorMessage = e.payload.errors[0].message;
            } else {
                errorMessage = 'Unknown Error';
            }

            this.errorMessage = htmlSafe(errorMessage);
            return false;
        }
    }
}
