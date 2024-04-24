<script setup>
import { computed, inject, ref, getCurrentInstance, onMounted, unref } from 'vue';
import ProgressLine from '@components/ProgressLine.vue';
import Lyrics from '@components/Lyrics.vue';
import store from '@store/index';

const { proxy } = getCurrentInstance();
const emit = defineEmits(['audioHandler', 'setVolumeHandler', 'setAudioProgress']);
const playListInfoStore = store.playListInfoStore();
const playerSettingStore = store.playerSettingStore();
const isPlayed = computed(() => playListInfoStore.getIsPlayed);
// 获取当前播放音乐信息
const curSongInfo = computed(() => playListInfoStore.playList[playListInfoStore.playIndex]);
// 音频当前时长
const currentTime = inject('currentTime');

const isMuted = ref(false); // 是否静音
const volumeNum = ref(playerSettingStore.volume);  // 音量值(0~1)
const oldVolume = ref(0);   // 取消禁音的时候，设置保留的上一次的音量值

// 播放暂停按钮
const playIcon = computed(() => !isPlayed.value ? 'icon-audio-play' : 'icon-audio-pause');
// 是否静音图标
const mutedIcon = computed(() => isMuted.value ? 'icon-volume-active' : 'icon-volume');
// 音频播放/暂停/上一首/下一首事件
const audioHandler = (type) => {
    emit('audioHandler', type);
};

// 设置音频音量进度条
const volumeProgressWidth = computed(() => {
    return volumeNum.value * 100;
});
// 音量禁音及取消操作
const volumeHandler = () => {
    isMuted.value = !isMuted.value;
    isMuted.value && (oldVolume.value = volumeNum.value);
    volumeNum.value = isMuted.value ? 0 : oldVolume.value;

    emit('setVolumeHandler', volumeNum.value);
    // 个性化，本地保存用户设置的音量
    playerSettingStore.setPlayerSetting('volume', volumeNum.value);
};
// 点击拖拽音量条，设置当前音量
const setvolumeProgress = (params) => {
    isMuted.value = params.val ? 0 : 1;
    volumeNum.value = params.val;
    oldVolume.value = params.val;

    // 实时改变音量大小
    emit('setVolumeHandler', params.val);
    // 个性化，本地保存用户设置的音量
    playerSettingStore.setPlayerSetting('volume', params.val);
}

// 播放模式
const modeIcon = computed(() => {
    const params = [{
        className: 'icon-loop',
        title: '循环模式'
    }, {
        className: 'icon-single-cycle',
        title: '单曲循环'
    }, {
        className: 'icon-shuffle',
        title: '随机播放'
    }]
    return params[playerSettingStore.mode]
});
// 切换播放模式
const changePlayMode = () => {
    playerSettingStore.mode = playerSettingStore.mode >= 2 ? 0 : playerSettingStore.mode + 1;
    playerSettingStore.setPlayerSetting('mode', playerSettingStore.mode);
}
// 音频的进度条的写法
// 第一种：自定义的进度条  开始
// 音频播放进度条长度
// const audioProgressWidth = computed(() => { // 音频进度条长度
//     return currentTime.value / curSongInfo.value.milliseconds * 100
// });
// // 点击拖拽进度条，设置当前时间
// const setAudioProgress = (params) => {
//     currentTime.value = params.val * curSongInfo.value.milliseconds;

//     // 拖拽的时候，不实时更改音频的时间
//     if (params.flag) {
//         emit('setAudioProgress', currentTime.value);
//     }
// };
// 自定义的进度条  结束
// ===等同===
// 第二种：组件slider 开始
const audioProgressWidth = computed({
    get(){
        return currentTime.value / curSongInfo.value.milliseconds * 100
    },
    set(val){
        currentTime.value = val * curSongInfo.value.milliseconds / 100;
    }
});
const setAudioProgress = (val) => {
    currentTime.value = val * curSongInfo.value.milliseconds / 100;

    emit('setAudioProgress', currentTime.value);
};
// 组件slider 结束

const popoverBtn = ref();
const lyricsBtnRef = ref();
const playlistBtnRef = ref();
const clickType = ref();
// 显示歌词面板
const popoverRef = ref();
const isShowLyrics = ref(false);
const lyricsHanlder = () => {
    popoverBtn.value = lyricsBtnRef.value;
    if (clickType.value == 'lyrics') {
        isShowLyrics.value = !isShowLyrics.value;
    } else {
        isShowLyrics.value = true;
    }

    clickType.value = 'lyrics';
}
const lyricHanlder = (e) => {
    const composedPath = e.composedPath();
    
    if (composedPath.includes(popoverRef.value)) return;
    isShowLyrics.value = false;
}
const playlistHanlder = () => {
    popoverBtn.value = playlistBtnRef.value;
    if (clickType.value == 'playlist') {
        isShowLyrics.value = !isShowLyrics.value;
    } else {
        isShowLyrics.value = true;
    }

    clickType.value = 'playlist';
}

const isShowTips = computed(() => playListInfoStore.isShowTips);

// 清空播放列表
const clearSonglist = () => {
    playListInfoStore.setPlayIndex();
    playListInfoStore.setPlayList();
    playListInfoStore.$patch({
        isPlayed: false
    });
    isShowLyrics.value = false;
};
</script>

<template>
<div class="play-bar" v-if="curSongInfo" ref="playBar" v-click-outside="lyricHanlder">
    <el-slider class="audioProgress" v-model="audioProgressWidth" :show-tooltip="false" @change="setAudioProgress" />
    <!-- <progress-line class="audioProgress" :progressWidth="audioProgressWidth" @setProgressLine="setAudioProgress"></progress-line> -->
    <div class="play-bar-main">
        <div class="bar-l">
            <router-link :to="{ path: '/song', query: { id: curSongInfo.id }}">
                <el-image :src="curSongInfo.album.picUrl" class="bar-cover-img">
                    <div slot="placeholder" class="image-slot">
                        <i class="iconfont icon-placeholder"></i>
                    </div>
                </el-image>
            </router-link>
            <div class="bar-name">
                <router-link :to="{ path: '/song', query: { id: curSongInfo.id }}" class="song_name">{{curSongInfo.name}}</router-link>
                <p><router-link :to="{ path: '/singer/detail', query: { id: author.id }}" class="song_author" v-for="(author, k) in curSongInfo.singer" :key="author.name">{{ k !== 0 ? ' / ' + author.name : author.name }}</router-link></p>
            </div>
            <div class="bar-time">
                <span>{{$utils.formatSongTime(currentTime * 1000)}}</span> / {{curSongInfo.duration}}
            </div>
        </div>
        <div class="bar-m">
            <div class="bar-control">
                <i class="iconfont icon-audio-prev" title="上一首" @click.stop="audioHandler('prev')"></i>
                <i :class="['iconfont', playIcon]" @click.stop="audioHandler('play')"></i>
                <i class="iconfont icon-audio-next" title="下一首" @click.stop="audioHandler('next')"></i>
            </div>
        </div>
        <div class="bar-r">
            <div class="bar-oper">
                <div class="volume-main">
                    <i :class="['iconfont', mutedIcon]" title="音量" @click.stop="volumeHandler"></i>
                    <progress-line class="volumeLine" :progressWidth="volumeProgressWidth" @setProgressLine="setvolumeProgress"></progress-line>
                </div>
                <i class="iconfont" :class="modeIcon.className" :title="modeIcon.title" @click.stop="changePlayMode"></i>
                <div class="lyric" ref="lyricsBtnRef" @click="lyricsHanlder">
                    <span class="lyric-btn" title="歌词">词</span>
                </div>
                <el-tooltip
                    class="box-item"
                    effect="dark"
                    placement="top"
                    :hide-after="3000"
                    :offset=20
                    v-model:visible="isShowTips.visiable"
                >
                    <template #content>
                        <span >{{isShowTips.txt}}</span>
                    </template>
                    <div class="playlist-main" ref="playlistBtnRef" @click="playlistHanlder">
                        <i class="iconfont icon-gedan"></i>
                        <div class="playlist-num" v-if="playListInfoStore.playList">{{ 99 > playListInfoStore.playList.length ? playListInfoStore.playList.length : '99+'}}</div>
                    </div>
                </el-tooltip>
            </div>
        </div>
    </div>
</div>
<el-popover
    placement="top-end"
    :show-arrow="false"
    v-model:visible="isShowLyrics"
    :width="clickType == 'lyrics' ? 400 : 550"
    :virtual-ref="popoverBtn"
    :offset=20
    effect="dark"
    virtual-triggering
>
    <div class="pop-main" ref="popoverRef">
        <template v-if="clickType == 'lyrics'">
            <h3 class="pop-header">
                <span>歌词</span>
            </h3>
            <lyrics :sId="curSongInfo.id" :currentTime="currentTime"></lyrics>
        </template>
        <template v-if="clickType == 'playlist'">
            <h3 class="pop-header">
                <span>播放列表<em>(共{{playListInfoStore.playList.length}}首)</em></span>
                <div class="del-songlist" @click="clearSonglist"><i class="iconfont icon-del" title="清空列表"></i>清空列表</div>
            </h3>
            <song-list :songList="playListInfoStore.playList" :typeSize="'mini'" :isScroll="true"></song-list>
        </template>
    </div>
</el-popover>
</template>

<style lang='less' scoped>
.play-bar {
    position: fixed;
    bottom: 0;
    left: @menuWidth + @paddingW;
    z-index: 5;
    width: calc(100% - @menuWidth - @paddingW - @paddingW);
    height: 70px;
    background: var(--box-background);
    box-shadow: var(--t-modal-shadow);
}
.play-bar-main {
    display: flex;
    font-size: 0;
    line-height: 0;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    margin: 0 auto;

    .bar-l {
        display: flex;
        width: 300px;
        align-items: center;
        justify-content: center;
    }

    .bar-cover-img {
        width: 50px;
        height: 50px;
        border-radius: var(--border-radius);
        box-shadow: var(--t-modal-shadow);
    }

    .bar-name {
        flex: 1;
        font-size: 0;
        padding: 0 20px;
        overflow: hidden;

        .song_name {
            display: block;
            margin-bottom: 20px;
            line-height: 12px;
            font-size: 12px;
            font-weight: bold;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        p {
            line-height: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .song_author {
            line-height: 12px;
            font-size: 12px;
            color: var(--t-light-color);
        }
    }

    .bar-time {
        line-height: 50px;
        font-size: 14px;
        color: #606266;
        text-align: center;
    }

    .bar-control {
        display: flex;
        padding: 15px 0;
        line-height: 1;
        align-items: center;
        justify-content: center;

        .iconfont {
            margin: 0 20px;
            font-size: 25px;
            cursor: pointer;
            color: #666;
        }

        .icon-audio-play, .icon-audio-pause {
            font-size: 40px;
            font-weight: bold;
            color: var(--t-highlight-color);
        }
    }

    .bar-oper {
        position: relative;
        display: flex;
        font-size: 0;
        line-height: 50px;
        align-items: center;
        justify-content: center;

        .iconfont {
            margin-left: 10px;
            font-size: 20px;
            cursor: pointer;
            vertical-align: middle;
        }
    }

    .volume-main {
        flex: 1;
        padding: 10px 0;
        display: flex;
        align-items: center;

        .volumeLine {
            width: 150px;
            margin: 0 10px;
        }
    }

    .lyric {
        display: inline-block;
        padding: 18px 5px 18px 15px;
        font-size: 18px;
        line-height: 18px;
        vertical-align: top;
        color: var(--t-light-color);
        cursor: pointer;
    }

    .playlist-main {
        position: relative;
        padding-right: 20px;

        .playlist-num {
            position: absolute;
            top: 20%;
            left: 50%;
            width: 24px;
            text-align: center;
            font-size: 12px;
            line-height: 12px;
            color: var(--t-muted-color);
        }
    }
}

.pop-main {
    min-height: 420px;

    .pop-header {
        display: flex;
        line-height: 40px;

        span {
            display: inline-block;
            flex: 1;
        }

        em {
            display: inline-block;
            padding-left: 10px;
            font-size: 12px;
            line-height: 14px;
            font-style: normal;
            font-weight: normal;
            color: #666;
            vertical-align: baseline;
        }

        .del-songlist {
            font-size: 14px;
            font-weight: normal;
            cursor: pointer;

            .iconfont {
                font-size: 22px;
                vertical-align: middle;
            }
        }
    }
}

.audioProgress {
    position: absolute;
    top: -16px;
    z-index: 9;
    
    :deep(.el-slider__runway) {
        background: transparent;
    }
}
</style>