<script setup>
import { computed, getCurrentInstance, toRefs, reactive, onMounted, watch } from 'vue';
import store from '@store/index';

const { proxy } = getCurrentInstance();
const playListInfoStore = store.playListInfoStore();
const props = defineProps({
    sId: {
        type: [Number, String],
        default: 0
    },
    currentTime: {
        type: Number,
        default: 0
    },
    maxH: {
        type: [Number, String],
        default: '390px'
    }
});

const info = reactive({
    lyric: null,
    lyricObj: [],
    curIndex: 0,
    isFull: false
});

// 获取当前播放音乐信息
const curSongInfo = computed(() => playListInfoStore.playList[playListInfoStore.playIndex]);

const isCurLyric = computed(() => {
    return (index) => {
        return index === info['curIndex'] && props['currentTime'] && curSongInfo.value.id == props.sId ? 'active' : '';
    }
});

// 歌词实时滚动
const transform = computed(() => {
    if (info['curIndex'] > 6 && curSongInfo.value.id == props.sId) {
        return `transform: translateY(-${30 * (info['curIndex'] - 6)}px)`;
    } else {
        return 'transform: translateY(0)';
    }
});

const  getLyrics = async (id) => {
    const { data: res } = await proxy.$http.lyrics({ id: id })

    if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败')
    }
    
    formartLyric(res.lrc);
};

const formartLyric = (lrc) => {
    const lrcReg = /^\[(\d{2}):(\d{2}.\d{2,})\]\s*(.+)$/;

    if (!lrc.lyric) {
        info['lyric'] = true
        return
    }
    const lyricLis = lrc.lyric.split('\n')

    info['lyric'] = lrc.lyric
    lyricLis.forEach(item => {
        const arr = lrcReg.exec(item)

        if (!arr) {
            return
        }

        info['lyricObj'].push({ t: arr[1] * 60 * 1 + arr[2] * 1, txt: arr[3] })
    })

    // 根据时间轴重排顺序
    info['lyricObj'].sort((a, b) => {
        return a.t - b.t
    })
};

const findCurIndex = (t) => {
    for (let i = 0; i < info['lyricObj'].length; i++) {
        if (t <= info['lyricObj'][i].t) {
            return i
        }
    }
    return info['lyricObj'].length
};

// 页面歌词可以展开查看更多
const fullLyric = () => {
    info['isFull'] = !info['isFull'];
};

onMounted(() => {
    getLyrics(props.sId);
});

watch(() => props.sId, (newVal, oldVal) => {
    info['lyric'] = null
    info['lyricObj'] = []
    info['curIndex'] = 0
    getLyrics(newVal);
});

watch(() => props.currentTime, (newVal, oldVal) => {
    // 无歌词的时候 不做动画滚动
    if (!info['lyricObj'].length) {
        return
    }
    info['curIndex'] = findCurIndex(newVal) - 1
});
</script>
<template>
    <div>
        <div class="lyrics-main" :style="{maxHeight: maxH}">
            <div class="lyrics" ref="lyrics" v-if="info.lyricObj.length" :style="transform">
                <p :class="[isCurLyric(index)]" v-for="(item, index) in info.lyricObj" :key="index">{{item.txt}}</p>
            </div>
            <div v-else class="lyric-empty">
                <p v-if="info.lyric">纯音乐，无歌词</p>
                <p v-else>歌词加载中......</p>
            </div>
        </div>
    </div>
</template>

<style scoped lang="less">
.lyrics-main {
    min-height: 120px;
    height: 100%;
    overflow-y: auto;
    transition: all 1.5s ease-in-out;
}

.lyrics {
    font-size: 0;
    transform: translateY(0);
    transition: transform 1.5s ease-in-out;

    :deep(p) {
        margin: 0;
        line-height: 30px;
        font-size: 14px;
        font-weight: 300;

        &.active {
            color: var(--t-highlight-color);
        }
    }
}
.lyric-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 100px;
    font-size: 14px;
    color: var(--t-highlight-color);

    ~ .more-lyric {
        display: none;
    }
}
.page-lyrics {
    color: #666;
    overflow: hidden;

    .lyric-empty {
        justify-content: left;
    }

    &.fullLyrics {
        max-height: none;
    }
}

.lyric-more span {
    display: inline-block;
    line-height: 30px;
    cursor: pointer;
    color: var(--t-highlight-color);
}
</style>
