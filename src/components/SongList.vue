<script setup>
import { computed, ref, watch, onMounted, nextTick } from 'vue';
import store from '@store/index';

const props = defineProps({
    songList: { // 歌曲列表
        type: Array,
        required: true
    },
    typeSize: { // 播放列表展示类型， 默认normal是歌单下的展示列表，mini是播放条下的歌曲列表的
        type: String,
        default: 'normal'
    },
    // 分页加载 || 无限滚动加载
    isScroll: {
        type: Boolean,
        default: false
    },
    pageSize: { // 分页 每页展示数量
        type: Number,
        default: 20
    },
});
const playListInfoStore = store.playListInfoStore();
const currentPage = ref(1);
const curScroll = ref( -1 || 1);

// 获取歌曲列表
const list = computed(() => {
    if (!props.isScroll) { // 分页加载数据
        return props.songList.slice((currentPage.value - 1) * props.pageSize, currentPage.value * props.pageSize);
    } else {
        return props.songList
    }
});

// 渲染歌单列表，表格列表序号格式化
const indexMethod = (page) => {
    if (!props.isScroll) {
        return (currentPage.value - 1) * props.pageSize + page + 1
    } else {
        return page + 1
    }
};

// 获取当前播放音乐信息
const curSongInfo = computed(() => playListInfoStore.playList[playListInfoStore.playIndex]);

// 当前播放歌曲icon状态
const playIcon = computed(() => {
    return item => {
        return ['iconfont', 'playicon', playListInfoStore.isPlayed && (item.id === curSongInfo.value.id) ? 'icon-pause' : 'icon-play']
    }
});
// 播放列表样式
const isCurSong = computed(() => {
    return item => {
        return ['list-item', playListInfoStore.isPlayed && (item.id === curSongInfo.value.id) ? 'active' : '', (item.license || item.vip) ? 'disable' : '', item.vip ? 'vip' : '']
    }
});

// 1、列表点击播放/暂停当前音乐
const playCurrentSong = (item) => {
    // 若当前唔歌曲 或者 当前播放歌曲不是本歌单显示的歌曲  立即播放当前歌单
    if (!curSongInfo.value || curSongInfo.value.id != item.id) {
        playListInfoStore.selectPlay([item]);
    } else {
        playListInfoStore.$patch({
            isPlayed: !playListInfoStore.isPlayed
        })
    }
    
}

// 添加当前歌曲到播放列表
const addSongList = (item) => {
    playListInfoStore.addToList([item]);
};

// 在播放列表删除歌曲，播放列表、播放索引重置更新
const delItem = (index) => {
    if (playListInfoStore.playList.length > 1) {
        playListInfoStore.playList.splice(index, 1);
        
        if (playListInfoStore.playIndex >= index) {
            playListInfoStore.setPlayIndex(playListInfoStore.playIndex - 1);
        }
        playListInfoStore.setPlayList(playListInfoStore.playList);
    } else {
        playListInfoStore.setPlayList();
    }
};

// 是否显示分页功能
const isShowPagination = computed(() => {
    return props.songList.length > props.pageSize && !props.isScroll
});
// 歌曲列表分页功能
const currentChange = (page) => {
    currentPage.value = page
};

const curSongRef = ref();
// TODO 点击偏上的音乐，不会自动滚动到最中间
// 滚动到当前播放音乐的位置
const scrollCurSong = (cur) => {
    if (props.isScroll) {
        const curIndex = props.songList.findIndex(item => {
            return item.id === cur.id
        })

        if (curIndex > 7 && curIndex < props.songList.length - 8) {
            curScroll.value = -(curIndex - 4) * 50
        } else if (curIndex >= (props.songList.length - 8) && props.songList.length - 8 > 0) {
            curScroll.value = -(props.songList.length - 8) * 50
        } else {
            curScroll.value = 0
        }

        const $curSongRef = curSongRef.value;
        $curSongRef.addEventListener('wheel', (event) => {
            if (event.wheelDelta > 0 || event.detail < 0) {
                curScroll.value = Math.abs(curScroll.value) > 0 ? curScroll.value + 50 : 0
            } else {
                curScroll.value = Math.abs(curScroll.value) < (props.songList.length - 8) / 2 * 100 ? curScroll.value - 50 : curScroll.value
            }
        }, {passive: true});
    }
};

const curSongSty = computed(() => {
    return `transform: translateY(${curScroll.value}px)`
});

onMounted(() => {
    scrollCurSong(curSongInfo.value);
});

watch(curSongInfo,
val => {
    // 添加歌曲的时候，props的歌曲列表没有更新
    nextTick(() => {
        val && scrollCurSong(val);
    })
    console.log(2222);
}, { deep:true });

</script>

<template>
    <div class="songs-list-main" :class="{'mini' : props.typeSize == 'mini'}">
        <div class="list-header flex">
            <div class="columnIndex">序号</div>
            <div class="columnSong">歌曲</div>
            <div class="columnSinger">歌手</div>
            <div class="columnAlbum" v-if="props.typeSize !== 'mini'">专辑</div>
            <div class="columnTime">时长</div>
        </div>
        <div class="list-scroll" ref="curSongRef">
            <div class="list-main" :style="curSongSty">
                <div :class="isCurSong(item)" v-for="(item, index) in list" :key="item.id">
                    <div class="columnIndex">
                        <span class="songlist-index">{{ indexMethod(index) }}</span>
                        <div class="audio-icon">
                            <div class="column" style="animation-delay: -1.2s;"></div>
                            <div class="column"></div>
                            <div class="column" style="animation-delay: -1.5s;"></div>
                            <div class="column" style="animation-delay: -0.9s;"></div>
                            <div class="column" style="animation-delay: -0.6s;"></div>
                        </div>
                        <i :class="playIcon(item)" @click="playCurrentSong(item)"></i>
                    </div>
                    <div class="columnSong songlist-name">
                        <router-link :to="{ path: '/song', query: { id: item.id }}" class="song_name">
                            {{ item.name }}
                        </router-link>
                        <template v-if="props.typeSize !== 'mini'">
                            <router-link class="mv-name" :to="{ path: '/mv', query: { id: item.mvId }}" v-if="item.mvId">
                                <i class="iconfont icon-mvlist"></i>
                            </router-link>
                            <i v-if="item.vip" class="iconfont icon-vip"></i>
                        </template>
                    </div>
                    <div class="columnSinger songlist-singer">
                        <router-link :to="{ path: '/singer/detail', query: { id: author.id }}" class="song_singer" v-for="(author, k) in item.singer" :key="author.name">{{ k !== 0 ? ' / ' + author.name : author.name }}</router-link>
                    </div>
                    <div class="columnAlbum" v-if="props.typeSize !== 'mini'">
                        <router-link class="songlist-album" :to="{ path: '/album', query: { id: item.album.id }}" v-if="item.album">{{ item.album.name }}</router-link>
                    </div>
                    <div class="columnTime">
                        <div class="songlist-time">
                            {{item.duration}}
                        </div>
                        <div class="songlist-oper">
                            <i class="iconfont icon-add" v-if="props.typeSize !== 'mini'" title="添加到列表" @click.stop="addSongList(item)"></i>
                            <i class="iconfont icon-collect" title="收藏"></i>
                            <i class="iconfont icon-del" v-if="props.typeSize == 'mini'" title="删除" @click.stop="delItem(index)"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="pagination" v-if="isShowPagination">
            <el-pagination
                v-model:currentPage="currentPage"
                :page-size="props.pageSize"
                layout="prev, pager, next"
                :total="props.songList.length"
                @current-change="currentChange"
            />
        </div>
    </div>
</template>

<style lang='less' scoped>
.list-header {
    display: flex;
    line-height: 50px;
    border-bottom: 1px solid #EBEEF5;
    font-weight: 400;
    color: var(--t-text-color);
}
.columnIndex {
    width: 60px;
    line-height: 50px;
    padding-left: 10px;
}
.columnSong {
    display: flex;
    flex: 2;
    width: 0;
    padding-right: 10px;
    overflow: hidden;
    align-items: center;
}
.columnSinger {
    flex: 1.5;
    width: 0;
    padding-right: 10px;
    overflow: hidden;
}
.columnAlbum {
    flex: 1;
    width: 0;
}
.columnTime {
    width: 100px;
    padding-right: 10px;
    text-align: right;
}
.list-main {
    transition: transform .3s;
}
.list-item {
    display: flex;
    align-items: flex-start;
    line-height: 50px;
    font-weight: 300;
    color: var(--t-text-color);

    .iconfont {
        margin-left: 10px;
        font-size: 22px;
        cursor: pointer;
        vertical-align: middle;

        &:hover {
            color: var(--t-highlight-color);
        }
    }

    .icon-mv {
        font-size: 14px;
    }

    .songlist-index {
        display: inline-block;
        width: 24px;
        text-align: center;
    }

    .playicon {
        display: none;
        margin-left: 0;
    }

    .songlist-name {
        a {
            display: inline-block;
            max-width: 80%;
            line-height: 50px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            vertical-align: top;
        }

        i:hover {
            color: var(--t-highlight-color);
            cursor: pointer;
        }

        .mv-name {
            text-decoration: none;
        }
    }

    .songlist-singer, .songlist-album {
        display: inline-block;
        max-width: 100%;
        line-height: 50px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        vertical-align: top;
    }

    .songlist-time {
        line-height: 50px;
    }

    .songlist-oper {
        display: none;
        line-height: 50px;
    }

    &.active {
        color: var(--t-highlight-color);
        border-radius: var(--border-radius);
        box-shadow: var(--t-modal-shadow);
        background: var(--s-background);

        .songlist-index, .playicon {
            display: none;
        }

        .audio-icon {
            display: flex;
        }

        &:hover {
            .playicon {
                display: block;
                color: var(--t-highlight-color);
            }
            .audio-icon {
                display: none;
            }
        }

    }

    &:hover {
        border-radius: var(--border-radius);
        box-shadow: var(--t-modal-shadow);
        background: var(--s-background);

        .songlist-time, .songlist-index {
            display: none;
        }

        .songlist-oper {
            display: flex;
            justify-content: flex-end;
        }

        .playicon {
            display: block;
        }
    }

    .icon-vip {
        font-size: 30px;
        color: var(--t-highlight-color);
    }

    &.disable {
        color: #ccc;

        a {
            color: #ccc;
        }

        .playicon, .songlist-oper {
            display: none;
        }

        .songlist-index, .songlist-time {
            display: block;
        }
    }

    &.vip {
        // color: var(--t-highlight-color);

        a {
            // color: var(--t-highlight-color);
        }
    }
}

.audio-icon {
    display: none;
    width: 20px;
    height: 18px;
    margin: 16px 2px;
    overflow: hidden;

    .column {
        width: 2px;
        height: 100%;
        margin-left: 2px;
        background-color: var(--t-highlight-color);
        -webkit-animation: play .9s linear infinite alternate;
        animation: play .9s linear infinite alternate
    }
}

.pagination {
    display: flex;
    justify-content: center;
    padding: 30px 0;
}

.mini {
    .list-scroll {
        height: 400px;
        -moz-user-select:none; /*火狐*/
        -webkit-user-select:none; /*webkit浏览器*/
        -ms-user-select:none; /*IE10*/
        -khtml-user-select:none; /*早期浏览器*/
        user-select:none;
        overflow-y: hidden;
    }
}

@-webkit-keyframes play {
    0% {
        -webkit-transform: translateY(0);
        transform: translateY(0)
    }

    to {
        -webkit-transform: translateY(75%);
        transform: translateY(75%)
    }
}

@keyframes play {
    0% {
        -webkit-transform: translateY(0);
        transform: translateY(0)
    }

    to {
        -webkit-transform: translateY(75%);
        transform: translateY(75%)
    }
}
</style>