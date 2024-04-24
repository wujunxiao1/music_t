import { defineStore } from 'pinia';

export const loginDialogStore = defineStore('loginDialog', {
    state: () => {
        return {
            loginDialogVisible: false, // 登录弹窗显示与隐藏
        }
    },
    getters: {},
    actions: {
        setLoginDialogVisible(val) {
            this.loginDialogVisible = val;
        }
    }
});
