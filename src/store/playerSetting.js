import { defineStore } from 'pinia';

const playerSettingInfo = JSON.parse(window.localStorage.getItem('player-setting')) || {};

export const playerSettingStore = defineStore('playerSetting', {
    state: () => {
        return {
            "mode": playerSettingInfo.mode || 0,       // 播放模式  0循环播放、1单曲循环、2随机播放
            "volume": playerSettingInfo.volume ?? .8,    // 播放音量
            "lock": playerSettingInfo.lock || false,    // 播放条是否固定
            "themeMode": playerSettingInfo.themeMode,    // 网站配色
        }
    },
    getters: {
        getMode: (state) => {
            return state.mode || 0;
        },
        getVolume: (state) => {
            return state.volume ?? .8;
        },
        getLock: (state) => {
            return state.lock || false;
        },
        getThemeMode: (state) => {
            return state.themeMode;
        },
    },
    actions: {
        setPlayerSetting(type, val) {
            const info = JSON.parse(window.localStorage.getItem('player-setting')) || {};

            info[type] = val;

            window.localStorage.setItem('player-setting', JSON.stringify(info));
        }
    }
});
