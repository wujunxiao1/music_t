import { defineStore } from 'pinia';

export const accountInfoStore = defineStore('account_info', {
    state: () => {
        return {
            isLogin: false, // 用户登录状态
            accountInfo: null, // 登录用户信息
        }
    },
    getters: {
        getLogin: (state) => {
            return state.isLogin || JSON.parse(window.localStorage.getItem('isLogin'));
        },
        getAccountInfo: (state) => {
            return state.accountInfo || JSON.parse(window.localStorage.getItem('accountInfo') || '{}');
        }
    },
    actions: {
        logout() {
            this.$patch({
                isLogin: false,
                accountInfo: null,
            })
        }
    }
});

