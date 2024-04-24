<script setup>
import SongList from '@components/SongList.vue';
import { getCurrentInstance, onMounted, reactive } from 'vue';
import { useRoute, onBeforeRouteUpdate } from 'vue-router';
import store from '@store/index';

const { proxy } = getCurrentInstance();
const accountInfo = store.accountInfoStore();
const loginDialog = store.loginDialogStore();
const playListInfo = store.playListInfoStore();
const route = useRoute();
const info = reactive({
    id: '',
    details: {},
    isLoading: true,
    songList: [],
    playlists: [],
    comments: [],
    total: 0,
    loading: true
});

const getDetail =  async(params) => {
    info['isLoading'] = true;
    const { data: res } = await proxy.$http.playListDetail(params)

    if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败')
    }
    info['details'] = res.playlist;

    if (accountInfo.getLogin) {
        getAllSongs(res.playlist.trackIds);
    } else {
        info['songList'] = proxy.$utils.formatSongs(res.playlist.tracks, res.privileges);
        info['total'] = info['songList'].length;
        info['isLoading'] = false;
    }
};

// 登录后根据ids获取所有歌曲列表
const getAllSongs = async(ids) => {
    const sliceArr = []
    const num = 500
    let idsArr = []

    // 数组过长 每500份一组
    for (let index = 0; index < ids.length; index += num) {
        sliceArr.push(ids.slice(index, index + num))
    }

    for (let i = 0; i < sliceArr.length; i++) {
        const arrs = []
        sliceArr[i].map(d => {
            arrs.push(d.id)
        });
        info['isLoading'] = true;
        const { data: res } = await proxy.$http.songDetail({ ids: arrs.join(','), timestamp: new Date().valueOf() + i })

        idsArr = idsArr.concat(proxy.$utils.formatSongs(res.songs, res.privileges))
    }

    info['songList'] = idsArr;
    info['total'] = idsArr.length;
    info['isLoading'] = false;
};

// 相关歌单推荐
const getRecom = async(params) => {
    const { data: res } = await proxy.$http.playlistRelated(params)

    if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败')
    }
    info.playlists = res.playlists
};

// 歌单精彩评论
const getComment = async(params) => {
    const { data: res } = await proxy.$http.playlistComment(params)

    if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败')
    }
    info.comments = res.comments
};

const _initialize = (id) => {
    // 歌单详情
    getDetail({ id: id, s: 8 });
    // 相关歌单推荐
    getRecom({ id: id });
    // 歌单评论
    getComment({ id: id, limit: 8 });
};

// 未登录状态，点击登录按钮，显示登录框
const loginHanlder = () => {
    loginDialog.loginDialogVisible = true;
};

// 播放列表为当前歌单的全部歌曲
const playAllSongs = () => {
    playListInfo.playAll(info.songList);
};

// 收藏、取消歌单
const subPlayList = async() => {
    const { data: res } = await proxy.$http.subPlayList({ id: info.details.id, t: (info.details.subscribed ? 2 : 1) })

    if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败')
    }
    info.details.subscribed = !info.details.subscribed
};

onMounted(() => {
    info.id = route.query.id || '';
    _initialize(info.id);
});

onBeforeRouteUpdate((to) => {
    info.songList = [];
    info.total = 0;
    info.id = to.query.id;
    _initialize(info.id);
});

</script>

<template>
<div class="detail">
    <div class="detail-container">
        <div class="detail-main">
            <div class="cover">
                <div class="cover-img">
                    <el-image :src="info.details.coverImgUrl">
                        <div slot="placeholder" class="image-slot">
                            <i class="iconfont icon-placeholder"></i>
                        </div>
                    </el-image>
                </div>
                <div class="cover-desc">
                    <template v-if="info.details.tags && info.details.tags.length">
                        <h4>标签</h4>
                        <div class="cover-tags" v-if="info.details.tags">
                            <router-link :to="{ path: '/playlist', query: { cat: tag }}" class="tag" v-for="(tag, index) in info.details.tags" :key="index">#{{tag}}</router-link>
                        </div>
                    </template>
                    <template v-if="info.details.trackNumberUpdateTime">
                        <h4>更新时间<em>{{info.details.updateFrequency}}</em></h4>
                        <p>{{$utils.formartDate(info.details.trackNumberUpdateTime, 'yyyy-MM-dd HH:mm:ss')}}</p>
                    </template>
                    <template v-if="info.details.subscribers">
                        <h4>喜欢这个歌单的人</h4>
                        <div class="sub-playlist">
                            <router-link :to="{ path: '/home', query: { id: author.userId }}" class="author-home" v-for="(author, k) in info.details.subscribers" :key="author.name">
                                <el-image :src="author.avatarUrl" class="cover-avatarIcon">
                                    <div slot="placeholder" class="image-slot">
                                        <i class="iconfont icon-placeholder"></i>
                                    </div>
                                </el-image>
                            </router-link>
                        </div>
                    </template>
                    <template v-if="info.details.description">
                        <h4>介绍</h4>
                        <pre class="cover-desc-all">
                            {{info.details.description}}
                        </pre>
                    </template>

                </div>
            </div>
            <div class="detail-info">
                <div class="cover-info">
                    <div class="cover-header">
                        {{info.details.name}}
                    </div>
                    <div class="cover-author">
                        <template v-if="info.details.creator">
                            <router-link :to="{ path: '/home', query: { id: info.details.creator.userId }}" class="author-home">
                                <el-image :src="info.details.creator.avatarUrl" class="cover-avatar">
                                    <div slot="placeholder" class="image-slot">
                                        <i class="iconfont icon-placeholder"></i>
                                    </div>
                                </el-image>
                            </router-link>
                            <div class="cover-name">
                                <router-link :to="{ path: '/home', query: { id: info.details.creator.userId }}" class="author-home">{{info.details.creator.nickname}}</router-link>
                                <el-image v-if="info.details.creator.avatarDetail" :src="info.details.creator.avatarDetail.identityIconUrl" class="cover-avatarIcon">
                                    <div slot="placeholder" class="image-slot">
                                        <i class="iconfont icon-placeholder"></i>
                                    </div>
                                </el-image>
                            </div>
                            <div class="cover-date">{{$utils.formartDate(info.details.createTime, 'yyyy-MM-dd')}} 创建</div>
                        </template>
                    </div>
                    <div class="cover-digital">
                        <span class="cover-playCount"> <i class="iconfont icon-playnum"></i> {{$utils.formartNum(info.details.playCount)}}次播放</span>
                        <span class="cover-collect"> <i class="iconfont icon-collect"></i> {{$utils.formartNum(info.details.subscribedCount)}}次收藏</span>
                        <span class="cover-comment"> <i class="iconfont icon-comment"></i> {{$utils.formartNum(info.details.commentCount)}}条留言</span>
                    </div>
                </div>
                <div class="song-main">
                    <div class="song-header">
                        <h4>歌曲列表 <em>共 {{info.total + ' 首歌'}}</em></h4>
                        <span class="play-all" @click="playAllSongs"><i class="iconfont icon-audio-play"></i> 播放全部</span>
                        <span :class="['collect', info.details.subscribed ? 'active' : '']" @click="subPlayList"><i :class="['iconfont', 'icon-collect' + (info.details.subscribed ? '-active' : '')]"></i> {{ info.details.subscribed ? '已收藏' : '收藏'}}</span>
                    </div>
                    <template v-if="info.isLoading">
                        <Loading />
                    </template>
                    <template v-else>
                        <song-list :songList="info.songList" :stripe="true"></song-list>
                        <div class="showAllSongsTips" v-if="!accountInfo.getLogin">
                            <span @click="loginHanlder">登录后查看全部歌曲</span>
                        </div>
                    </template>
                </div>
            </div>
        </div>
        <div class="detail-aside">
            <template v-if="info.playlists.length">
                <div class="aside-title">相关歌单推荐</div>
                <div class="aside-main recom-main">
                    <router-link class="recom-item" :to="{ path: '/playlist/detail', query: { id: item.id }}" v-for="item in info.playlists" :key="item.id">
                        <el-image :src="item.coverImgUrl">
                            <div slot="placeholder" class="image-slot">
                                <i class="iconfont icon-placeholder"></i>
                            </div>
                        </el-image>
                        <div class="recom-info">
                            <div class="recom-name">{{item.name}}</div>
                            <div class="recom-author">
                                By. <router-link :to="{ path: '/home', query: { id: item.creator.userId }}">{{ item.creator.nickname }}</router-link>
                            </div>
                        </div>
                    </router-link>
                </div>
            </template>
            <div class="playlist-comment" v-if="info.comments.length">
                <div class="aside-title">歌单评论</div>
                <div class="aside-main comment-main">
                    <div class="comment-item" v-for="item in info.comments" :key="item.commentId">
                        <router-link :to="{ path: '/home', query: { id: item.commentId }}">
                            <el-image :src="item.user.avatarUrl">
                                <div slot="placeholder" class="image-slot">
                                    <i class="iconfont icon-placeholder"></i>
                                </div>
                            </el-image>
                        </router-link>
                        <div class="comment-info">
                            <div class="comment-userInfo"><router-link :to="{ path: '/home', query: { id: item.commentId }}" class="comment-name">{{item.user.nickname}}</router-link><span class="comment-date">{{$utils.formatMsgTime(item.time)}}</span></div>
                            <div class="comment-desc">{{item.content}}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<style lang='less' scoped>
.detail {
    position: relative;
    margin-bottom: 40px;

    &::after {
        display: block;
        content: '';
        position: absolute;
        top: 140px;
        z-index: 1;
        width: 100%;
        height: calc(100% - 140px);
        box-shadow: var(--t-modal-shadow);
        background: var(--box-background);
        border-radius: var(--border-radius);
    }
}
.detail-container {
    position: relative;
    z-index: 9;
    display: flex;
    padding: 35px 0 0 0;
}
.detail-main {
    flex: 1;
    display: flex;
}

.cover {
    width: 250px;
    padding-left: 30px;
    padding-right: 40px;
}
.cover-img {
    width: 250px;
    height: 250px;
    border-radius: var(--border-radius);
    overflow: hidden;
    box-shadow: var(--t-modal-shadow);
}
.detail-info {
    flex: 1;
}
.cover-info {
    flex: 1;
    padding: 30px 0 55px;
    border-radius: var(--border-radius);

    .cover-header {
        padding: 10px 0;
        font-size: 34px;
        font-weight: bold;
        height: 34px;
        line-height: 34px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        word-break: break-all;
    }
}
.cover-author {
    padding: 40px 0 20px;
    height: 32px;

    .cover-avatar {
        display: inline-block;
        width: 32px;
        height: 32px;
        border-radius: 100%;
        vertical-align: top;
    }

    .cover-name, .cover-date {
        display: inline-block;
        padding: 0 10px;
        line-height: 32px;
        height: 32px;
    }

    .cover-avatarIcon {
        padding-left: 5px;
        width: 12px;
        height: 12px;
    }

    .cover-date {
        color: var(--t-light-color);
        font-weight: 300;
    }
}

.cover-digital {
    line-height: 0;

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
.cover-desc {
    position: relative;
    padding: 10px 0 5px;

    h4 {
        color: var(--t-muted-color);
        line-height: 14px;
        padding: 20px 0 5px;
        font-weight: 400;

        em {
            display: inline-block;
            padding-left: 10px;
            font-style: normal;
            font-size: 12px;
            font-weight: 300;
            color: var(--t-light-color);
        }
    }

    p {
        font-weight: 300;
        color: var(--t-muted-color);
    }

    .cover-desc-all {
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

.cover-tags {
    .tag {
        display: inline-block;
        margin: 0 5px 5px 0;
        font-size: 12px;
        font-weight: 300;
        color: var(--t-text-color);

        &:hover {
            color: var(--t-highlight-color);
        }
    }
}

.song-main {
    position: relative;
    // padding: 0 20px;
    // margin-top: 25px;
    // background: var(--box-background);
    border-radius: var(--border-radius);
    // box-shadow: var(--t-modal-shadow);
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

.showAllSongsTips {
    text-align: center;
    padding: 40px 0;

    span {
        display: inline-block;
        line-height: 16px;
        align-items: center;
        justify-content: center;
        border-radius: 50px;
        padding: 7px 20px;
        color: #fff;
        background: var(--t-highlight-color);
        cursor: pointer;
    }
}
.detail-aside {
    width: @sideWidth;
    margin-left: @paddingW;
    margin-top: 135px;
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
}

.sub-playlist {
    font-size: 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    .author-home {
        display: inline-block;
        width: 21%;
        font-size: 0;
        border-radius: var(--border-radius);
        margin: 10px 0 0;
        overflow: hidden;
    }
}

.recom-main {
    padding-bottom: 30px;
    .el-image {
        width: 60px;
        height: 60px;
        border-radius: 4px;
        overflow: hidden;
    }

    .recom-item {
        display: flex;
        padding: 0 0 20px;
    }

    .recom-info {
        flex: 1;
        padding-left: 10px;
    }

    .recom-name {
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

    .recom-author {
        height: 20px;
        line-height: 20px;
        margin-top: 20px;
        font-size: 12px;
        color: var(--color-text);

        a {
            color: #666;
        }
    }
}

.comment-main {
    font-size: 0;
    padding-right: 20px;

    .el-image {
        width: 40px;
        height: 40px;
        border-radius: var(--border-radius);
        box-shadow: var(--t-modal-shadow);
        overflow: hidden;
    }

    .comment-item {
        display: flex;
        padding: 10px 0;
    }

    .comment-info {
        flex: 1;
        padding-left: 10px;
    }

    .comment-userInfo {
        width: 100%;
        font-size: 0;
    }

    .comment-name {
        font-size: 14px;
        line-height: 14px;
        font-weight: bold;
    }

    .comment-desc {
        font-size: 12px;
        color: var(--t-muted-color);
        line-height: 1.6;
        padding: 5px 10px;
        background: var(--btn-background);
        margin: 5px 0;
        border-radius: var(--border-radius);
        word-break: break-word;
    }

    .comment-date {
        display: inline-block;
        padding-left: 5px;
        font-size: 12px;
        color: var(--t-light-color);
    }
}
</style>