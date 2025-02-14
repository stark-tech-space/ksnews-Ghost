import AjaxServiceSupport from 'ember-ajax/mixins/ajax-support';
import RESTAdapter from '@ember-data/adapter/rest';
import ghostPaths from 'ghost-admin/utils/ghost-paths';
import {inject as service} from '@ember/service';
import {underscore} from '@ember/string';

export default RESTAdapter.extend(AjaxServiceSupport, {
    host: window.location.origin,
    namespace: ghostPaths().apiRoot.slice(1),

    session: service(),

    shouldBackgroundReloadRecord() {
        return false;
    },

    query(store, type, query) {
        let id;

        if (query.id) {
            id = query.id;
            delete query.id;
        }

        return this.ajax(this.buildURL(type.modelName, id), 'GET', {data: query});
    },

    pathForType() {
        const type = this._super(...arguments);
        return underscore(type);
    },

    buildURL() {
        // Ensure trailing slashes
        let url = this._super(...arguments);

        // fix: 修复微前端聚合错误
        url = url.replace('ttps://ksnews.ctripintl.com/', '')
        url = url.replace('http://localhost:8080', 'https://ksnews.ctripintl.com')
        url = url.replace('https://admin-test.tripintl.com', 'https://ksnews.ctripintl.com')

        let parsedUrl = new URL(url);

        if (!parsedUrl.pathname.endsWith('/')) {
            parsedUrl.pathname += '/';
        }

        return parsedUrl.toString();
    }
});
