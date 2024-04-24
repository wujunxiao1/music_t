import { defineStore } from 'pinia';
import utils from '@utils/util';

// 合并歌曲到播放列表查重
const concatPlayList = (list, playList = []) => {
    // filter过滤无版权及vip歌曲
    return utils.concatPlayList(list.filter(item => { return !item.license && !item.vip }), playList)
}
// 当前歌曲在播放列表的索引
const findIndex = (list, playList) => {
    return playList.findIndex(d => { return d.id === list.id })
}

let timer = null;

export const playListInfoStore = defineStore('playListInfo', {
    state: () => {
        return {
            playList: JSON.parse(window.localStorage.getItem('PLAYLIST')) || [],        // 当前播放列表
            playIndex: JSON.parse(window.localStorage.getItem('PLAYINDEX')) || 0,        // 当前音乐播放索引
            isPlayed: false,   // 当前是否播放歌曲
            isShowTips: {  // 1: 已添加到播放列表 2: 已开始播放
                visiable: false,
                txt: ''
            },
        }
    },
    getters: {
        getPlayList: (state) => {
            return state.playList || [];
        },
        getPlayIndex: (state) => {
            return state.playIndex || 0;
        },
        getIsPlayed: (state) => {
            return state.isPlayed || false;
        },
    },
    actions: {
        // 播放当前选中的歌曲
        selectPlay (list) {
            const playList = concatPlayList(list, this.playList);

            this.playList = playList;
            this.playIndex = findIndex(list[0], playList);
            this.isPlayed = true;
            this.isShowTips =  {
                visiable: true,
                txt: '已开始播放'
            };

            clearTimeout(timer);
            timer = setTimeout(() => {
                this.isShowTips.visiable = false;
            }, 2500);

            window.localStorage.setItem('PLAYLIST', JSON.stringify(playList));
            window.localStorage.setItem('PLAYINDEX', this.playIndex);
        },
        // 添加歌曲到当前播放列表
        addToList (list) {
            const playList = concatPlayList(list, this.playList);

            this.playList = playList;
            this.isShowTips =  {
                visiable: true,
                txt: '已添加到播放列表'
            };

            clearTimeout(timer);
            timer = setTimeout(() => {
                this.isShowTips.visiable = false;
            }, 2500);

            window.localStorage.setItem('PLAYLIST', JSON.stringify(playList));
        },
        // 播放歌曲列表里全部歌曲（清空当前播放列表）
        playAll (list) {
            const playList = concatPlayList(list);

            this.playList = playList;
            this.playIndex = 0;
            this.isShowTips =  {
                visiable: true,
                txt: '已添加到播放列表'
            };

            clearTimeout(timer);
            timer = setTimeout(() => {
                this.isShowTips.visiable = false;
            }, 2500);

            window.localStorage.setItem('PLAYLIST', JSON.stringify(list));
            window.localStorage.setItem('PLAYINDEX', this.playIndex);
        },
        setPlayIndex(val = 0) {
            this.playIndex = val
            window.localStorage.setItem('PLAYINDEX', val);
        },
        setPlayList(val = []) {
            this.playList = val
            window.localStorage.setItem('PLAYLIST', JSON.stringify(val));
        }
    }
});
