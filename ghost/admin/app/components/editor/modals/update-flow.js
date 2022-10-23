import Component from '@glimmer/component';
import {inject as service} from '@ember/service';
import {task} from 'ember-concurrency';

export default class UpdateFlowModalComponent extends Component {
    @service settings;

    static modalOptions = {
        className: 'fullscreen-modal-total-overlay publish-modal',
        omitBackdrop: true,
        ignoreBackdropClick: true
    };

    // We only show the newsletter name in the app if there's more than the single default newsletter.
    // However, here we can show historic email data so it could have been sent to a now-archived
    // newsletter in which case we want to force display of the newsletter name to avoid confusion.
    get showNewsletterName() {
        const {publishOptions} = this.args.data;

        return !publishOptions.onlyDefaultNewsletter || publishOptions.post.newsletter?.status === 'archived';
    }

    get isZhLocale() {
        return this.settings.get('locale') ? this.settings.get('locale').startsWith('zh') : true;
    }

    @task
    *saveTask() {
        yield this.args.data.saveTask.perform();
        this.args.close();
        return true;
    }
}
