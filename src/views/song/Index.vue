<script setup>
import { getCurrentInstance, onMounted, reactive, computed, ref, inject } from 'vue';
import { onBeforeRouteUpdate, useRoute } from 'vue-router';
import Lyrics from '@components/Lyrics.vue';
import CommentList from '@components/Comments.vue';
import { formatSongInfo } from '@utils/song';

import store from '@store/index';

const { proxy } = getCurrentInstance();
const route = useRoute();
const playListInfoStore = store.playListInfoStore();
const info = reactive({
    sId: '',
    coverDesc: '',
    songInfo: null,
    simiSong: [],
    playlists: [],
    simiArtist: [],
    simiUser: [],
    mlog: [],
    commentType: 0, // 0: 歌曲 1: mv 2: 歌单 3: 专辑  4: 电台 5: 视频 6: 动态
});
// 音频当前时长
const currentTime = inject('currentTime');
const cBox = ref();

// 获取当前播放音乐信息
const curSongInfo = computed(() => playListInfoStore.playList[playListInfoStore.playIndex]);
// 当前播放歌曲icon状态
const playIcon = computed(() => {
    return item => {
        return ['iconfont', 'playicon', playListInfoStore.isPlayed && (item.id === curSongInfo.value.id) ? 'icon-pause' : 'icon-play']
    }
});

// 获取歌曲详情
const getSongDetail = async () => {
    const { data: res } = await proxy.$http.songDetail({ ids: info.sId, timestamp: new Date().valueOf() })

    if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败')
    }

    // 是否有版权播放
    res.songs[0].license = !res.privileges[0].cp;
    info['songInfo'] = proxy.$utils.formatSongs(res.songs, res.privileges)[0];
    // 显示歌曲简介
    info['coverDesc'] = info['songInfo'].alia.join(' / ');

    // getSimiArtist(info['songInfo'].singer[0].id);
};

// 包含这首歌的歌单
const getSimiPlayList = async() => {
    const { data: res } = await proxy.$http.simiPlayList({ id: info.sId })

    if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败')
    }

    info['playlists'] = res.playlists;
};

// 获取最近 5 个听了这首歌的用户
// const getSimiUser = async() => {
//     const { data: res } = await proxy.$http.simiUser({ id: info.sId })

//     if (res.code !== 200) {
//         return proxy.$msg.error('数据请求失败')
//     }

//     info['simiUser'] = res.userprofiles;
// };

// 获取可以调用此接口获取歌曲相关视频 (区别于 MV)， 有些歌曲没有 MV 但是有用户上传的与此歌曲相关的 Mlog
const getMlog = async() => {
    const { data: res } = await proxy.$http.mlog({ id: info.sId })

    if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败')
    }

    info['mlog'] = res.data.feeds;
};

// 获取相似歌手  * 需要登录
// const getSimiArtist = async(id) => {
//     const { data: res } = await proxy.$http.simiArtist({ id: id })

//     if (res.code !== 200) {
//         return proxy.$msg.error('数据请求失败')
//     }

//     info['simiArtist'] = res.artists;
// };

// 获取相似音乐
const getSimiSong = async() => {
    const { data: res } = await proxy.$http.simiSong({ id: info.sId })

    if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败')
    }

    info['simiSong'] = res.songs.map(item => {
        return formatSongInfo(item);
    })

};

// 播放音乐
const plyaing = (params) => {
    // 若当前唔歌曲 或者 当前播放歌曲不是本页显示的歌曲  立即播放当前页面歌曲
    if (!curSongInfo.value || curSongInfo.value.id !== params.id) {
        // 无版权及vip不可播放
        if (params.license) {
            proxy.$msg.error('由于版权保护，您所在的地区暂时无法使用。')
            return
        }

        if (params.vip) {
            proxy.$msg.error('付费歌曲，请在网易云音乐播放')
            return
        }

        playListInfoStore.selectPlay([params]);
        playListInfoStore.$patch({
            isPlayed: true,
        });
    } else {
        playListInfoStore.$patch({
            isPlayed: !playListInfoStore.isPlayed
        });
    }
};

// 添加到播放列表
const addPlayList = item => {
    playListInfoStore.addToList([item]);
};

const jumpComment = () => {
    cBox.value.scrollIntoView(true);
};


onBeforeRouteUpdate((to) => {
    info['sId'] = to.query.id;
    _initialize(); 
});

onMounted(() => {
    info['sId'] = route.query.id;
    _initialize(); 
});

const _initialize = () => {
    if (info['sId']) {
        getSongDetail();
        getSimiSong();
        getSimiPlayList();
        // getSimiUser();
        getMlog();
    }
};
</script>

<template>
    <div class="song">
        <div class="song-container" v-if="info.songInfo">
            <div class="song-main">
                <div class="song-l">
                    <div class="cover">
                        <!-- <img src="/src/assets/img/stylus.png" class="cover-stylus" /> -->
                        <div class="cover-img">
                            <el-image :src="info.songInfo.album.picUrl">
                                <div slot="placeholder" class="image-slot">
                                    <i class="iconfont icon-placeholder"></i>
                                </div>
                            </el-image>
                        </div>
                        <div class="cover-play-img">
                            <el-image :src="info.songInfo.album.picUrl">
                                <div slot="placeholder" class="image-slot">
                                    <i class="iconfont icon-placeholder"></i>
                                </div>
                            </el-image>
                        </div>
                    </div>
                    <div class="song-oper">
                        <span class="play-btn play-all" @click="plyaing(info.songInfo)"><i :class="playIcon(info.songInfo)"></i> {{info.songInfo.vip ? 'VIP尊享' : '播放'}}</span>
                        <span class="play-btn play-add" @click="addPlayList(info.songInfo)"><i class="iconfont icon-add"></i> 添加</span>
                        <span class="play-btn play-collect"><i class="iconfont icon-collect"></i> 收藏</span>
                        <span class="play-btn play-comment" @click="jumpComment"><i class="iconfont icon-comment"></i> 评论</span>
                    </div>
                    <div class="simi-song">
                        <h3 class="simi-song-title">相似歌曲</h3>
                        <div class="aside-main">
                            <div class="simi-item" v-for="simiItem in info.simiSong" :key="simiItem.id">
                                <div class="simi-info">
                                    <router-link class="simi-name" :to="{ path: '/song', query: { id: simiItem.id }}">
                                        {{ simiItem.name }}
                                    </router-link>
                                    <div class="simi-author"><router-link :to="{ path: '/singer/detail', query: { id: author.id }}" class="song-author" v-for="(author, k) in simiItem.singer" :key="author.name">{{ k !== 0 ? ' / ' + author.name : author.name }}</router-link></div>
                                </div>
                                <div class="simi-song-status">
                                    <i v-if="simiItem.vip" class="iconfont icon-vip"></i>
                                    <template v-else>
                                        <i @click="plyaing(simiItem)" :class="playIcon(simiItem)"></i>
                                        <i class="iconfont icon-add" title="添加到列表" @click="addPlayList(simiItem)"></i>
                                    </template>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="song-m">
                    <div class="song-info">
                        <div class="song-info-head">
                            <div class="song-title">{{info.songInfo.name}}</div>
                            <router-link class="song-mv" :to="{ path: '/mv', query: { id: info.songInfo.mvId }}" v-if="info.songInfo.mvId">
                                <i class="iconfont icon-mvlist"></i>
                            </router-link>
                            <i v-if="info.songInfo.vip" class="iconfont icon-vip"></i>
                        </div>
                        <div class="song-desc" v-if="info.coverDesc">
                            {{info.coverDesc}}
                        </div>
                        <div class="song-related">
                            <div class="song-author">
                                歌手： <router-link :to="{ path: '/singer/detail', query: { id: author.id }}" class="song-author" v-for="(author, k) in info.songInfo.singer" :key="author.name">{{ k !== 0 ? ' / ' + author.name : author.name }}</router-link>
                            </div>
                            <div class="song-album">
                                所属专辑：<router-link class="song-album" :to="{ path: '/album', query: { id: info.songInfo.album.id }}">{{ info.songInfo.album.name }}</router-link>
                            </div>
                        </div>
                    </div>
                    <div class="lyrics">
                        <lyrics :sId="info.sId" :currentTime="currentTime" :maxH="'500px'"></lyrics>
                    </div>
                    <div class="song-comments" ref='cBox'>
                        <comment-list :type="info.commentType" :sId="info.sId"></comment-list>
                    </div>
                </div>
            </div>
            <div class="song-aside">
                <div class="sidebar-box playlist-simi" v-if="info.playlists.length">
                    <h3 class="aside-title">包含这首歌的歌单</h3>
                    <div class="aside-main">
                        <router-link class="playlist-item" :to="{ path: '/playlist/detail', query: { id: item.id }}" v-for="item in info.playlists" :key="item.id">
                            <el-image :src="item.coverImgUrl">
                                <div slot="placeholder" class="image-slot">
                                    <i class="iconfont icon-placeholder"></i>
                                </div>
                            </el-image>
                            <div class="playlist-info">
                                <div class="playlist-name">{{item.name}}</div>
                                <div class="playlist-author">
                                    By. <router-link :to="{ path: '/home', query: { id: item.creator.userId }}">{{ item.creator.nickname }}</router-link>
                                </div>
                            </div>
                        </router-link>
                    </div>
                </div>
                <div class="sidebar-box simi-mlog" v-if="info.mlog.length">
                    <h3 class="aside-title">相关视频</h3>
                    <div class="aside-main">
                        <router-link :to="{ path: '/mv', query: { id: mlog.id }}" class="mlog-item" v-for="(mlog, k) in info.mlog" :key="mlog.id">
                            <div class="mlog-img">
                                <i class="iconfont icon-mvlist"></i>
                                <el-image :src="mlog.resource.mlogBaseData.coverUrl" class="mlog-cover">
                                    <div slot="placeholder" class="image-slot">
                                        <i class="iconfont icon-placeholder"></i>
                                    </div>
                                </el-image>
                            </div>
                            <div class="mlog-time"><i class="iconfont icon-time"></i> {{$utils.formatSongTime(mlog.resource.mlogBaseData.duration)}}</div>
                            <div class="mlog-name">{{ mlog.resource.mlogBaseData.text }}</div>
                            <div class="mlog-footer">
                                <span class="mlog-author">{{ mlog.resource.userProfile.nickname }}</span>
                                <span class="mlog-pubTime">{{ $utils.formatMsgTime(mlog.resource.mlogBaseData.pubTime) }}</span>
                            </div>
                        </router-link>
                    </div>
                </div>
                
            </div>
        </div>
    </div>
</template>

<style lang='less' scoped>
.song-container {
    display: flex;
    padding: 35px 0 0 0;

    .song-main {
        flex: 1;
        display: flex;

        .song-l {
            width: 360px;
            padding-right: 100px;
        }

        .song-m {
            flex: 1;
        }
    }

    .song-aside {
        width: @sideWidth;
        padding-bottom: 25px;
        flex-shrink: 0;
        padding-left: @paddingW
    }
}

.song-info-head {
    display: flex;
    padding-top: 40px;

    .song-title {
        font-size: 34px;
        font-weight: bold;
        height: 34px;
        line-height: 34px;
    }

    .iconfont {
        margin-left: 10px;
        font-size: 24px;
        color: var(--t-highlight-color);
    }

    .song-mv {
        display: flex;
        align-items: center;

        &:hover {
            text-decoration: none;
        }
    }

    .icon-vip {
        font-size: 32px;
    }
}

.song-desc {
    padding-top: 10px;
    line-height: 14px;
    font-size: 14px;
    color: var(--t-light-color);
    font-weight: 300;
}

.song-related {
    display: flex;
    font-size: 0;
    padding: 30px 0;
    color: var(--t-light-color);

    .song-author, .song-album {
        font-size: 14px;
        line-height: 14px;
        font-weight: 300;
        padding-right: 20px;
    }

    a {
        display: inline-block;
        line-height: 14px;
        font-weight: 400!important;
        color: var(--t-text-color);
    }
}

.cover {
    position: relative;
    width: 250px;
    margin-bottom: 50px;

    .cover-stylus {
        position: absolute;
        right: 0;
        top: -30px;
        z-index: 3;
        transform: rotate(-90deg);
    }

    .cover-img {
        position: relative;
        z-index: 2;
        width: 250px;
        height: 250px;
        box-shadow: 0 0px 10px rgba(0, 0, 0, 0.7);
        overflow: hidden;
    }

    .cover-play-img {
        position: absolute;
        top: 5px;
        left: 120px;
        z-index: 1;
        width: 100px;
        height: 100px;
        padding: 70px;
        // margin-left: 5px;
        font-size: 0;
        background: url('@/assets/img/disc.png') no-repeat;
        background-size: contain;
        cursor: pointer;
        box-shadow: 0 0px 10px rgb(0 0 0 / 50%);
        border-radius: 100%;

        .el-image {
            border-radius: 100%;
            animation: soundPaying 15s linear infinite;
            animation-play-state: paused;
        }

        &.active {
            .cover-stylus {
                transform: rotateZ(0);
            }

            .el-image {
                animation-play-state: running;
            }
        }
    }
}

@keyframes soundPaying {
    from {
        -webkit-transform: rotate(10deg);
        transform: rotate(10deg)
    }

    to {
        -webkit-transform: rotate(370deg);
        transform: rotate(370deg)
    }
}

.song-oper {
    display: flex;
    justify-content: space-between;
    font-size: 0;

    .play-btn {
        display: flex;
        line-height: 16px;
        align-items: center;
        justify-content: center;
        border-radius: var(--border-radius);
        padding: 7px 16px 7px 12px;
        cursor: pointer;
        transition: all 0.4s;
        background: var(--btn-background);
        color: var(--t-light-color);
        font-size: 12px;

        .iconfont {
            margin-right: 5px;
        }
    }

    .play-all {
        color: var(--white-color);
        background: var(--t-highlight-color);

        .iconfont {
            color: var(--white-color);
        }
    }
}

.simi-song {

    .simi-song-title {
        color: var(--t-muted-color);
        padding: 30px 0 5px;
        font-weight: 400;
    }
    .simi-name {
        line-height: 20px;
        font-size: 12px;
        font-weight: 400;
        color: var(--t-text-color);
    }

    .simi-author {
        font-size: 0;

        a {
            font-weight: 300;
            font-size: 12px;
            color: var(--t-muted-color);
        }
    }

    .simi-item {
        display: flex;
        border-bottom: 1px solid #f2f2f2;

        &:last-child {
            border: 0;
        }
    }

    .simi-info {
        flex: 1;
        padding-top: 5px;
    }

    .simi-song-status {
        line-height: 48px;

        i {
            margin-left: 10px;
            cursor: pointer;
        }
    }
}

.sidebar-box {
    padding: 20px 20px 0;
    margin-bottom: 20px;
    border-radius: var(--border-radius);
    box-shadow: var(--t-modal-shadow);
}

.aside-title {
    font-size: 16px;
    line-height: 16px;
    padding: 0 0 20px;
    color: var(--t-text-color);

    &::before {
        display: inline-block;
        content: '';
        width: 3px;
        height: 16px;
        margin-right: 5px;
        background: var(--t-muted-color);
        vertical-align: top;
        border-radius: var(--border-radius);
    }
}

.aside-main {
    .el-image {
        width: 60px;
        height: 60px;
        border-radius: var(--border-radius);
        overflow: hidden;
    }

    .playlist-item {
        display: flex;
        padding-bottom: 20px;
    }

    .playlist-info {
        flex: 1;
        padding-left: 10px;
    }

    .playlist-name {
        width: 100%;
        height: 20px;
        line-height: 20px;
        font-size: 14px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        word-break: break-all;
        cursor: pointer;
    }

    .playlist-author {
        height: 20px;
        line-height: 20px;
        margin-top: 20px;
        font-size: 12px;
        color: #999;

        a {
            color: #666;
        }
    }
}

.simi-artists {
    .aside-main {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
    }

    .artists-item {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .artists-name {
        display: block;
        padding: 5px 0 10px;
        font-weight: 300;
    }
}

.mlog-item {
    position: relative;
    display: block;
    font-size: 0;

    .mlog-img {
        position: relative;
        height: 190px;
        border-radius: var(--border-radius);
        overflow: hidden;

        .icon-mvlist {
            position: absolute;
            top: 45%;
            right: 0;
            bottom: 0;
            left: 0;
            z-index: 3;
            margin-top: -30px;
            font-size: 60px;
            text-align: center;
            color: #fff;
            opacity: 0;
            transform: scale(0.5);
            transition: all 0.4s linear;
        }
    }

    .mlog-cover {
        display: flex;
        align-items: center;
        width: 100%;
        height: 190px;
        transition: all 0.4s linear;

        :deep(.el-image__inner) {
            height: auto;
        }
    }

    .mlog-time {
        position: absolute;
        right: 10px;
        top: 150px;
        display: flex;
        font-size: 12px;
        height: 28px;
        align-items: center;
        font-weight: 300;
        padding: 0 8px;
        border-radius: var(--border-radius);
        box-shadow: var(--t-modal-shadow);
        background: var(--box-background);

        .icon-time {
            margin-right: 5px;
        }
    }

    .mlog-name {
        width: 100%;
        height: 20px;
        font-size: 14px;
        line-height: 20px;
        margin-top: 10px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        word-break: break-all;
        color: var(--t-text-color);
    }

    .mlog-footer {
        display: flex;
        justify-content: space-between;
    }

    .mlog-author, .mlog-pubTime {
        font-size: 14px;
        line-height: 24px;
        padding-bottom: 20px;
        font-weight: 300;
        color: var(--t-muted-color);
    }

    &:hover {
        .icon-mvlist {
            opacity: 1;
            transform: scale(1);
        }

        .mlog-cover {
            transform: scale(1.1);
        }
    }
}
</style>