import clickOutside from './clickOutside';

const directives = {
    clickOutside
};

export default {
    install(app) {
        Object.keys(directives).forEach((key) => {
            app.directive(key, directives[key])
        })
    }
}