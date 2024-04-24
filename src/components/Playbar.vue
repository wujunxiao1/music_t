<script setup>
import AudioBox from '@components/AudioBox.vue';
import StripBar from '@views/playbar/StripBar.vue';
import { ref, watch } from 'vue';

const emit = defineEmits(['setCurrentTime']);
const audioRef = ref(null);
const currentTime = ref(0);

// 歌曲播放操作； 播放、暂停、上一首、下一首
const playSongStates = (state) => {
    audioRef.value.playAudioType(state);
};
// 设置音量
const setvolumeNum = (val) => {
    audioRef.value.setVolumeHandler(val);
}

// 当前音频的播放时长
const setCurrentTime = (t) => {
    currentTime.value = t;
};

// 拖拽音频进度条
const setAudioProgress = (t) => {
    audioRef.value.setAudioProgress(t);
};

watch(currentTime, (newVal) => {
    emit('setCurrentTime', newVal);
})
</script>
<template>
    <div class="playbar-main">
        <strip-bar 
        @audioHandler="playSongStates"
        @setVolumeHandler="setvolumeNum"
        @setAudioProgress="setAudioProgress"
        ></strip-bar>
        <audio-box ref="audioRef" @setCurrentTime="setCurrentTime"></audio-box>
    </div>
</template>

<style lang="less" scoped>
.playbar-main  {
    position: fixed;
    bottom: 0;
    z-index: 9;
}
</style>