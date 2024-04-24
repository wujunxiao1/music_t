<script setup>
import { getCurrentInstance, reactive, onMounted } from 'vue';
import { onBeforeRouteUpdate, useRoute } from 'vue-router';
import store from '@store/index';
import CommentList from '@components/Comments.vue';

const { proxy } = getCurrentInstance();
const playListInfo = store.playListInfoStore();
const route = useRoute();
const info = reactive({
    albumId: '',
    albumInfo: null,
    songList: [],
    dynamic: null,
    hotAlbums: [],
    commentType: 3, // 0: 歌曲 1: mv 2: 歌单 3: 专辑  4: 电台 5: 视频 6: 动态
});


// 获取专辑相关信息
const getAlbum = async() => {
    const { data: res } = await proxy.$http.album({ id: info.albumId})

    if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败')
    }

    info.albumInfo = res.album;
    const privileges = [];

    res.songs.forEach(item => {
        privileges.push(item.privilege);
    })
    info.songList = proxy.$utils.formatSongs(res.songs, privileges);

    getArtistAlbum();
};

// 获取专辑相关订阅信息
const getAlbumDynamic = async() => {
    const { data: res } = await proxy.$http.albumDynamic({ id: info.albumId})

    if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败')
    }
    info.dynamic = res
};

// 歌手的其他专辑
const getArtistAlbum = async() => {
    const { data: res } = await proxy.$http.artistAlbum({ id: info.albumInfo.artists[0].id, limit: 5 })

    if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败')
    }
    info.hotAlbums = res.hotAlbums
};

// 播放列表为当前歌单的全部歌曲
const playAllSongs = () => {
    playListInfo.playAll(info.songList);
};

const subAlbum = async() => {
    const { data: res } = await proxy.$http.albumSub({ id: info.albumId, t: Number(!info.dynamic.isSub) })

    if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败')
    }
    info.dynamic.isSub = Number(!info.dynamic.isSub)
};

onBeforeRouteUpdate((to) => {
    info['albumId'] = to.query.id;
    _initialize(); 
});

onMounted(() => {
    info['albumId'] = route.query.id;
    _initialize(); 
});

const _initialize = () => {
    if (info['albumId']) {
        getAlbum();
        getAlbumDynamic();
    }
};
</script>

<template>
    <div class="album">
        <div class="album-container" v-if="info.albumInfo">
            <div class="album-main">
                <div class="album-cover">
                    <div class="album-img">
                        <el-image :src="info.albumInfo.picUrl">
                            <div slot="placeholder" class="image-slot">
                                <i class="iconfont icon-placeholder"></i>
                            </div>
                        </el-image>
                    </div>
                    <div class="album-info">
                        <div class="album-title">{{info.albumInfo.name}}<span>{{'#' + info.albumInfo.type}}</span></div>
                        <div class="album-singer">歌手：<router-link :to="{ path: '/singer/detail', query: { id: author.id }}" class="song_name" v-for="(author, k) in info.albumInfo.artists" :key="author.name">{{ k !== 0 ? ' / ' + author.name : author.name }}</router-link></div>
                        <div class="album-time">发行时间：{{$utils.formartDate(info.albumInfo.publishTime, 'yyyy-MM-dd')}}</div>
                        <div class="album-company" v-if="info.albumInfo.company">发行公司：{{info.albumInfo.company}}</div>
                        <div class="album-digital" v-if="info.dynamic">
                            <span class="album-share"> <i class="iconfont icon-share"></i> {{$utils.formartNum(info.dynamic.shareCount)}}次分享</span>
                            <span class="album-collect"> <i class="iconfont icon-collect"></i> {{$utils.formartNum(info.dynamic.subCount)}}次订阅</span>
                            <span class="album-comment"> <i class="iconfont icon-comment"></i> {{$utils.formartNum(info.dynamic.commentCount)}}条留言</span>
                        </div>
                    </div>
                </div>

                <div class="album-box">
                    <div class="album-desc" v-if="info.albumInfo.description">
                        <h4>专辑介绍</h4>
                        <pre class="album-desc-all">
                            {{info.albumInfo.description}}
                        </pre>
                    </div>
                    <div class="song-comments">
                        <div class="song-main">
                            <div class="song-header">
                                <h4>专辑歌曲列表 <em>共 {{info.albumInfo.size + ' 首歌'}}</em></h4>
                                <span class="play-all" @click="playAllSongs"><i class="iconfont icon-audio-play"></i> 播放全部</span>
                                <span :class="['collect', info.albumInfo.subscribed ? 'active' : '']" @click="subAlbum"><i :class="['iconfont', 'icon-collect' + (info.albumInfo.subscribed ? '-active' : '')]"></i> {{ info.albumInfo.subscribed ? '已收藏' : '收藏'}}</span>
                            </div>
                            <song-list :songList="info.songList" :stripe="true"></song-list>
                        </div>
                        <div class="comments-main" ref='cBox'>
                            <comment-list :type="info.commentType" :sId="info.albumId"></comment-list>
                        </div>
                    </div>
                </div>
            </div>
            <div class="album-aside">
                <div class="album-other">
                    <h3 class="aside-title">{{info.albumInfo.artists[0].name}}的其他专辑<router-link :to="{ path: '/singer/detail', query: { id: info.albumInfo.artists[0].id, type: 'album' }}" class="album-more">全部>></router-link></h3>
                    <div class="aside-main aside-album-main">
                        <router-link class="aside-album-item" :to="{ path: '/album', query: { id: item.id }}" v-for="item in info.hotAlbums" :key="item.id">
                            <el-image :src="item.picUrl">
                                <div slot="placeholder" class="image-slot">
                                    <i class="iconfont icon-placeholder"></i>
                                </div>
                            </el-image>
                            <div class="aside-album-info">
                                <div class="aside-album-name">{{item.name}}</div>
                                <div class="aside-album-time">
                                    {{$utils.formartDate(info.albumInfo.publishTime, 'yyyy-MM-dd')}}
                                </div>
                            </div>
                        </router-link>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang='less' scoped>

.album-container {
    display: flex;
    padding: 35px 0 0 0;

    .album-main {
        flex: 1;
    }

    .album-aside {
        width: @sideWidth;
        padding-bottom: 25px;
        flex-shrink: 0;
        padding-left: @paddingW;
    }
}

.album-cover {
    display: flex;
    .album-img {
        position: relative;
        width: 260px;
        height: 260px;

        .el-image {
            z-index: 2;
            border-radius: var(--border-radius);
            box-shadow: var(--t-modal-shadow);
        }

        &::after {
            display: inline-block;
            content: '';
            position: absolute;
            top: 0;
            right: -40px;
            width: 100%;
            height: 100%;
            background: url('../../assets/img/disc.png') no-repeat;
            background-size: contain;
            transition: all 0.4s linear;
            box-shadow: var(--t-modal-shadow);
            border-radius: 100%;
        }
    }

    .album-info {
        flex: 1;
        padding: 20px;
        margin-left: 70px;
        background: var(--box-background);
        border-radius: var(--border-radius);
        box-shadow: var(--t-modal-shadow);

        .album-title {
            padding: 10px 0 30px;
            font-size: 30px;
            font-weight: bold;

            span {
                display: inline-block;
                padding-left: 10px;
                font-size: 14px;
                font-weight: normal;
                color: var(--t-highlight-color);
            }
        }
        .album-singer, .album-time, .album-company {
            line-height: 22px;
            font-size: 14px;
            color: var(--t-light-color);
            font-weight: 300;
            margin-bottom: 5px;
        }

        .song_name {
            color: var(--t-text-color);
        }

        .album-desc {
            position: relative;

            h5 {
                padding: 30px 0 5px;
                line-height: 20px;
                font-size: 14px;
                color: #333;
            }
            .album-desc-all {
                padding: 10px 0;
                line-height: 22px;
                font-size: 14px;
                white-space: pre-line;
                color: #999;
            }
        }
    }

    .album-digital {
        line-height: 0;
        padding-top: 20px;

        span {
            display: inline-flex;
            line-height: 18px;
            padding-right: 20px;
            color: var(--t-light-color);
            font-weight: 300;

            .iconfont {
                font-size: 18px;
                padding-right: 5px;
                vertical-align: top;
            }
        }
    }
}

.album-box {
    display: flex;

    .album-desc {
        width: 260px;
        padding-right: 70px;

        h4 {
            color: var(--t-muted-color);
            line-height: 14px;
            padding: 20px 0 5px;
            font-weight: 400;
        }

        .album-desc-all {
            line-height: 22px;
            font-size: 14px;
            white-space: pre-line;
            font-family: inherit;
            font-weight: 300;
            word-break: break-all;
            color: var(--t-muted-color);
            max-height: 800px;
            overflow-y: auto;
        }
    }
}

.song-comments {
    flex: 1;
}

.song-header {
    display: flex;
    padding: 20px 0 10px;

    h4 {
        flex: 1;
        font-size: 20px;
        line-height: 30px;
        font-weight: 400;
        color: var(--t-muted-color);

        em {
            display: inline-block;
            padding-left: 10px;
            font-size: 12px;
            line-height: 12px;
            font-style: normal;
            font-weight: 300;
            color: var(--t-light-color);
            vertical-align: baseline;
        }
    }

    span {
        display: flex;
        line-height: 16px;
        align-items: center;
        justify-content: center;
        border-radius: var(--border-radius);
        padding: 7px 20px 7px 16px;
        cursor: pointer;
        margin: 0 0 0 15px;
        transition: all .4s;
        background: var(--btn-background);
        color: var(--t-light-color);
        font-weight: 300;

        i {
            margin-right: 5px;
            color: var(--t-light-color);
        }
    }

    .play-all {
        color: var(--white-color);
        background: var(--t-highlight-color);

        i {
            color: var(--white-color);
        }
    }

    .collect.active, .collect.active i {
        color: var(--t-highlight-color);
    }
}

.album-other {
    padding: 20px;
    margin-bottom: 20px;
    background: var(--box-background);
    border-radius: var(--border-radius);
    box-shadow: var(--t-modal-shadow);
}

.aside-title {
    position: relative;
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

    .album-more {
        display: inline-block;
        position: absolute;
        right: 0;
        top: 0;
        font-weight: 300;
        font-size: 12px;
        color: var(--t-muted-color);
    }
}

.aside-album-item {
    display: flex;
    padding: 10px 0;

    .el-image {
        width: 60px;
        height: 60px;
        border-radius: var(--border-radius);
        overflow: hidden;
    }

    .aside-album-info {
        flex: 1;
        padding-left: 10px;
    }

    .aside-album-name {
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

    .aside-album-time {
        height: 20px;
        line-height: 20px;
        margin-top: 20px;
        font-size: 12px;
        color: var(--t-muted-color);
        font-weight: 300;
    }
}
</style>