import app from '@utils/app';
import { createPinia } from 'pinia';
import router from './router/index';
import util from '@utils/util';
import area from '@assets/js/area'
import * as getApis from './apis/http';
import Directives from '@directives/index.js';

import '@assets/less/global';

// 绑定全局属性
app.config.globalProperties['$http'] = getApis;
app.config.globalProperties['$utils'] = util;
app.config.globalProperties['$AREA'] = area;
app.config.globalProperties['$msg'] = ElMessage;
app.config.globalProperties['$msgBox'] = ElMessageBox;

app.use(router).use(createPinia()).use(Directives).mount('#app');

