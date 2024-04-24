<script setup>
import { computed, nextTick, onMounted, ref, watch, watchEffect } from 'vue';
import store from '@store/index';

const emit = defineEmits(['setCurrentTime']);
const myAudio = ref(null);
const playListInfoStore = store.playListInfoStore();
const playerSettingStore = store.playerSettingStore();
const isPlayed = computed(() => playListInfoStore.getIsPlayed);
// 获取当前播放音乐信息
const curSongInfo = computed(() => playListInfoStore.playList[playListInfoStore.playIndex]);
// 初始化音频准备
const initAudioReady = ref(false);

// 音频初始化后准备就绪
const canplaySong = (e) => {
    initAudioReady.value = true;
};

// 音频播放时候 初始化状态，获取音频总时长
const playSong = (e) => {
    initAudioReady.value = true;
    playListInfoStore.$patch({
        isPlayed: true
    });
};

// 音乐 播放/暂停/上一首/下一首
const playAudioType = (type) => {
    if (type === 'play') {
        playListInfoStore.$patch({
            isPlayed: !isPlayed.value
        });
    } else {
        changeSong(type);
    }
};

// 手动切换歌曲
const changeSong = (type) => { // type: prev/next  上一首/下一首
    if (playListInfoStore.playList.length !== 1) { // 若播放列表只有一首歌则单曲循环
        let index = playListInfoStore.playIndex;
        if (playerSettingStore.mode === 2) { // 随机模式
            index = Math.floor(Math.random() * playListInfoStore.playList.length - 1) + 1
        } else {
            if (type === 'prev') {
                index = index === 0 ? playListInfoStore.playList.length - 1 : --index
            } else {
                index = index >= playListInfoStore.playList.length - 1 ? 0 : ++index
            }
        }

        initAudioReady.value = false;
        playListInfoStore.isPlayed = false;
        playListInfoStore.setPlayIndex(index);
    } else {
        loopSong()
    }
};

// 单曲循环歌曲
const loopSong = () => {
    const $myAudio = myAudio.value;

    $myAudio.currentTime = 0;
    $myAudio.play();
    playListInfoStore.$patch({
        isPlayed: true,
    });
};

// 音频播放结束 自动播放下一首
const endedSong = (e) => {
    if (playerSettingStore.mode === 1) {
        loopSong()
    } else {
        changeSong('next')
    }
};

// 设置音频音量大小
const setVolumeHandler = (val) => {
    const $myAudio = myAudio.value;
    $myAudio.volume = val;
    $myAudio.muted = val ? 0 : 1;
}

// 点击拖拽进度条，设置当前时间
const setAudioProgress = (t) => {
    const $myAudio = myAudio.value;
    $myAudio.currentTime = t;
}

// 监听音频时间， 实时更新当前播放时间
const updateSongTime = (e) => {
    if (!initAudioReady.value) {
        return
    }
    emit('setCurrentTime', e.target.currentTime);
};

onMounted(() => {
    // 页面初始化后，给音频设置音量
    nextTick(() => {
        const $myAudio = myAudio.value;

        if ($myAudio) {
            $myAudio.volume = playerSettingStore.volume;
        }
    })
});

// 监听当前播放歌曲的信息
watch(curSongInfo, (newSong, oldSong) => {
    if (!newSong || (oldSong && newSong.id === oldSong.id)) {
        return
    }
    // 当前播放歌曲变化的时候  重置状态及当前播放的时长
    initAudioReady.value = false;
    emit('setCurrentTime', 0);
    
    nextTick(() => {
        const $myAudio = myAudio.value;

        if ($myAudio) {
            $myAudio.play();
        }
    })
    console.log(1111);
}, { deep:true });

watchEffect(() => {
    // 等待音频加载成功完成后播放
    if (!initAudioReady.value) {
        return
    };

    const $myAudio = myAudio.value;

    if ($myAudio) {
        isPlayed.value ? $myAudio.play() : $myAudio.pause()
    }
})

defineExpose({
    playAudioType,
    setVolumeHandler,
    setAudioProgress
})
</script>

<template>
    <audio
    v-if="curSongInfo"
    ref="myAudio"
    preload="auto"
    @canplay="canplaySong"
    @playing="playSong"
    @ended="endedSong"
    @timeupdate="updateSongTime"
    :src="curSongInfo.url">
    </audio>
</template>

<style lang='less' scoped>
</style>