<script setup>
import {onMounted, reactive, getCurrentInstance, ref } from 'vue';
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router';
import { formatSongInfo } from '@utils/song';
import store from '@store/index';

import AlbumList  from '@views/singer/Album.vue';

const playListInfoStore = store.playListInfoStore();
const { proxy } = getCurrentInstance();
const route = useRoute();
const router = useRouter();
const info = reactive({
    id: '',
    briefDesc: '',
    introduction: [],
    topicData: [],
    artist: {},
    user: {},
    hotSongs: [],
    hotAlbums: [],
    hotMvs: [],
    fans: [],
    simiArtists: [],
    fansCount: {},
    albumSize: 0,
    mvSize: 0,
    pageSize: 0,
    type: route.query.type || 'hot',
    limit: 20,
    offset: 0,
    isLoading: false
});
const currentPage = ref(1);

// 歌手简介
const getArtistDesc = async () => {
    const { data: res } = await proxy.$http.artistDesc({ id: info.id })

    if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败')
    }
    info.briefDesc = res.briefDesc;
    info.introduction = res.introduction;
    info['isLoading'] = false;
};

// 歌手热门作品
const getArtists = async() => {
    const { data: res } = await proxy.$http.artists({ id: info.id, timestamp: new Date().valueOf() })

    if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败')
    }

    info['hotSongs'] = res.hotSongs.map(item => formatSongInfo(item));
    info['isLoading'] = false;
};

// 歌手详情
const getArtistsDetail = async() => {
    const { data: res } = await proxy.$http.artistDetail({ id: info.id, timestamp: new Date().valueOf() })

    if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败')
    }

    info['artist'] = res.data.artist;
    info['albumSize'] = res.data.artist.albumSize;
    info['mvSize'] = res.data.artist.mvSize;
};

const getArtistAlbum = async() => {
    const { data: res } = await proxy.$http.artistAlbum({ id: info.id, limit: info.limit, offset: info.offset })

    if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败')
    }

    info['hotAlbums'] = res.hotAlbums;
    info['isLoading'] = false;
};

const getArtistMv = async() => {
    const { data: res } = await proxy.$http.artistMv({ id: info.id, limit: info.limit, offset: info.offset })

    if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败')
    }

    info['hotMvs'] = res.mvs;
    info['isLoading'] = false;
};

// 关注、取消歌手
const followArtist = async(item) => {
    const { data: res } = await proxy.$http.artistSub({ id: item.id, t: item.followed ? 0 : 1 })

    if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败')
    }
    proxy.$msg.success('操作成功')
    
    item['followed'] = item.followed ? 0 : 1;
}

// 获取歌手粉丝
const getArtistFans = async() => {
    const { data: res } = await proxy.$http.artistFans({ id: info.id })

    if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败')
    }
    
    info['fans'] = res.data;
}
// 获取歌手粉丝数量
const getArtistFansCount = async() => {
    const { data: res } = await proxy.$http.artistFansCount({ id: info.id })

    if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败')
    }
    
    info['fansCount'] = res.data;
}

// 相似歌手
const getSimiArtists = async() => {
    const { data: res } = await proxy.$http.simiArtists({ id: info.id })

    if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败')
    }
    
    info['simiArtists'] = res.artists.slice(0, 8);
}

// 切换TAB
const changeType = (type) => {
    const params = {
        id: info.id,
        type
    };

    info['type'] = type;
    info['pageSize'] = info[type + 'Size'];
    router.push({ path: '/singer/detail', query: params })
};

const playAllList = () => {
    playListInfoStore.selectPlay(info.hotSongs);
};
const addAll = () => {
    playListInfoStore.addToList(info.hotSongs);
};
const collectAll = () => {
};

// 歌曲列表分页功能
const currentChange = (page) => {
    currentPage.value = page;
    info.offset = (page - 1) * info.limit;
    getArtistAlbum();
};

onMounted(() => {
    info['id'] = route.query.id || '';
    _initialize();
});
onBeforeRouteUpdate((to) => {
    info['id'] = to.query.id;
    _initialize();
});

const _initialize = (id) => {
    info['isLoading'] = true;
    getArtistFans();
    getSimiArtists();
    getArtistFansCount();
    getArtistsDetail();

    switch (info.type) {
        case 'album' :
            getArtistAlbum()
        break;
        case 'mv' :
            getArtistMv()
        break;
        case 'brief' :
            getArtistDesc()
        break;
        default:
            getArtists();
    }
}
</script>

<template>
    <div class="detail">
        <div class="detail-container" v-if="info">
            <div class="detail-main">
                <div class="detail-headImg">
                    <el-image :src="info.artist.cover">
                        <div slot="placeholder" class="image-slot">
                            <i class="iconfont icon-placeholder"></i>
                        </div>
                    </el-image>
                </div>
                <div class="detail-info">
                    <div class="cover">
                        <div class="cover-img">
                            <el-image :src="info.artist.avatar">
                                <div slot="placeholder" class="image-slot">
                                    <i class="iconfont icon-placeholder"></i>
                                </div>
                            </el-image>
                        </div>
                    </div>
                    <div class="singer-info">
                        <!-- <div class="singer-actor">Artist</div> -->
                        <div class="singer-name">{{info.artist.name}}</div>
                        <div class="singer-alias">
                            <span v-for="(item, index) in info.artist.alias" :key="index">{{item}}</span>
                        </div>
                        <div class="singer-digital">
                            <template v-if="info.artist.musicSize">
                                <span class="singer-track">{{$utils.formartNum(info.artist.musicSize)}}单曲</span>
                            </template>
                            <template v-if="info.artist.albumSize">
                                · <span class="singer-album">{{$utils.formartNum(info.artist.albumSize)}}专辑</span>
                            </template>
                            <template v-if="info.artist.mvSize">
                                · <span class="singer-mv">{{$utils.formartNum(info.artist.mvSize)}}MV</span>
                            </template>
                        </div>
                    </div>
                    <div class="singer-oper">
                        <span :class="['singer-btn singer-collect', info.artist.followed ? 'active' : '']" @click="followArtist(info.artist)">
                            <i :class="['iconfont', 'icon-collect' + (info.artist.followed ? '-active' : '')]"></i>{{ info.artist.followed ? '已关注' : '关注'}}
                        </span>
                    </div>
                </div>

                <div class="singer-main">
                    <div class="singer-hd">
                        <em>作品集</em>
                        <div class="singer-tab">
                            <span :class="[ info.type === 'hot' ? 'active' : '']" @click="changeType('hot')">热门作品</span>
                            <span :class="[ info.type === 'album' ? 'active' : '']" @click="changeType('album')">所有专辑</span>
                            <span :class="[ info.type === 'mv' ? 'active' : '']" @click="changeType('mv')">相关MV</span>
                            <span :class="[ info.type === 'brief' ? 'active' : '']" @click="changeType('brief')">艺人介绍</span>
                        </div>
                        <div class="song-oper" v-if="info.type === 'hot'">
                            <span @click="playAllList" class="singer-btn playAll"><i class="iconfont icon-audio-play"></i> 播放全部</span>
                            <span @click="addAll" class="singer-btn addAll"><i class="iconfont icon-add"></i> 添加到播放列表</span>
                            <span @click="collectAll" class="singer-btn collectAll"><i class="iconfont icon-collect"></i> 收藏热门</span>
                        </div>
                    </div>
                    <template v-if="info.isLoading">
                        <Loading />
                    </template>
                    <div class="singer-list" v-else>
                        <song-list :songList="info.hotSongs" :stripe="true" v-if="info.type === 'hot'"></song-list>
                        <album-list :albumList="info.hotAlbums" v-if="info.type === 'album'" :loading="info.isLoading"></album-list>
                        <mv-list :mvList="info.hotMvs" v-if="info.type === 'mv'" :loading="info.isLoading"></mv-list>
                        <div class="brief" v-if="info.type === 'brief'">
                            <div class="artist-desc-main">
                                <dl class="introduction">
                                    <dt>艺人介绍</dt>
                                    <dd>{{info.briefDesc}}</dd>
                                </dl>
                                <dl v-for="(item, index) in info.introduction" :key="index" class="introduction">
                                    <dt>{{item.ti}}</dt>
                                    <dd>{{item.txt}}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div class="pagination" v-if="info.type !== 'hot' && info.type !== 'brief'">
                        <el-pagination
                            v-model:currentPage="currentPage"
                            :page-size="info.limit"
                            layout="prev, pager, next"
                            :total="info.pageSize"
                            @current-change="currentChange"
                        />
                    </div>
                </div>
            </div>
            <div class="detail-aside">
                <div class="singer-box singer-fans">
                    <div class="aside-title">Fans · 粉丝</div>
                    <div class="aside-main fans-main">
                        <div class="fans-list">
                            <router-link class="fans-item" :to="{ path: '/home', query: { id: item.userProfile.userId }}" v-for="item in info.fans" :key="item.userProfile.userId">
                                <el-image :src="item.userProfile.avatarUrl">
                                    <div slot="placeholder" class="image-slot">
                                        <i class="iconfont icon-placeholder"></i>
                                    </div>
                                </el-image>
                                <!-- <div class="fans-name">{{item.userProfile.nickname}}</div> -->
                            </router-link>
                        </div>

                        <div class="fans-num">{{$utils.formartNum(info.fansCount.fansCnt)}}<span>人已关注</span></div>
                        <div class="fans-tips">点击关注，聆听更多美好音乐</div>
                    </div>
                </div>
                <div class="singer-box singer-simi">
                    <div class="aside-title">相似歌手</div>
                    <div class="aside-main simi-main">
                        <div class="simi-item" v-for="item in info.simiArtists" :key="item.id">
                            <router-link class="simi-l" :to="{ path: '/singer/detail', query: { id: item.id }}">
                                <el-image :src="item.picUrl">
                                    <div slot="placeholder" class="image-slot">
                                        <i class="iconfont icon-placeholder"></i>
                                    </div>
                                </el-image>
                                <div class="simi-info">
                                    <div class="simi-name">{{item.name}}</div>
                                    <div class="singer-digital">
                                        <template v-if="item.musicSize">
                                            <span class="singer-track">{{$utils.formartNum(item.musicSize)}}单曲</span>
                                        </template>
                                        <template v-if="item.albumSize">
                                            · <span class="singer-album">{{$utils.formartNum(item.albumSize)}}专辑</span>
                                        </template>
                                        <template v-if="item.mvSize">
                                            · <span class="singer-mv">{{$utils.formartNum(item.mvSize)}}MV</span>
                                        </template>
                                    </div>
                                </div>
                            </router-link>
                            <div class="simi-oper">
                                <span :class="['singer-btn singer-collect', item.followed ? 'active' : '']" @click="followArtist(item)">
                                    <i :class="['iconfont', 'icon-collect' + (item.followed ? '-active' : '')]"></i>{{ item.followed ? '已关注' : '关注'}}
                                </span>
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

    // &::after {
    //     display: block;
    //     content: '';
    //     position: absolute;
    //     top: 140px;
    //     z-index: 1;
    //     width: 100%;
    //     height: calc(100% - 140px);
    //     box-shadow: var(--t-modal-shadow);
    //     background: var(--box-background);
    //     border-radius: var(--border-radius);
    // }
}
.detail-container {
    position: relative;
    z-index: 9;
    display: flex;
    margin: 35px 0 0 0;

    .detail-main {
        flex: 1;
        box-shadow: var(--t-modal-shadow);
        background: var(--box-background);
    }

    .detail-aside {
        width: @sideWidth;
        margin-left: @paddingW;
    }
}

.detail-headImg {
    display: flex;
    align-items: center;
    height: 230px;
    border-radius: var(--border-radius) var(--border-radius) 0 0;
    overflow: hidden;

    .el-image {
        height: auto;
        min-height: 250px;
        filter: blur(20px);
    }
}

.detail-info {
    position: relative;
    z-index: 9;
    display: flex;
    padding: 0 30px;
    margin-top: -110px;
}

.cover-img {
    width: 250px;
    height: 250px;
    border-radius: 100%;
    overflow: hidden;
    border: 10px solid var(--white-color);
}

.singer-info {
    flex: 1;
    padding: 120px 40px 10px;
    color: var(--t-text-color);
    .singer-actor {
        font-weight: 300;
        line-height: 14px;
        height: 14px;
        font-size: 14px;
    }

    .singer-name {
        padding: 10px 0 10px;
        font-size: 34px;
        font-weight: bold;
        height: 34px;
        line-height: 34px;
    }

    .singer-alias {
        font-size: 0;
        height: 12px;

        span {
            font-size: 12px;
            display: inline-block;
            line-height: 12px;
            height: 12px;
            padding-right: 5px;
            color: var(--t-light-color);
        }
    }
    
    .singer-digital {
        display: flex;
        align-items: center;
        color: var(--t-light-color);
        font-weight: 300;
        padding-top: 20px;
        margin-left: -10px;
        line-height: 14px;

        span {
            display: inline-block;
            line-height: 14px;
            padding: 0 10px;
        }
    }
}

.singer-oper {
    width: 100px;
    padding-top: 66px;
    

    .singer-btn {
        display: inline-flex;
        width: 100px;
        line-height: 20px;
        align-items: center;
        justify-content: center;
        padding: 7px 0;
        cursor: pointer;
        color: var(--white-color);
        border-radius: var(--border-radius);
        box-shadow: var(--t-modal-shadow);
        background: var(--t-highlight-color);
        font-weight: 300;

        .iconfont {
            margin-right: 5px;
            color: var(--white-color);
        }

        &.active {
            background: var(--t-primary-light-color);
        }
    }
}

.singer-main {
    padding: 50px 30px 0px;

    .singer-hd {
        display: flex;
        font-size: 0;
        padding-bottom: 10px;

        em {
            display: inline-block;
            width: 90px;
            font-size: 26px;
            line-height: 30px;
            font-style: normal;
        }

        .singer-tab {
            flex: 1;
            padding-top: 5px;
        }

        span {
            display: inline-block;
            font-size: 16px;
            margin-left: 40px;
            color: var(--t-muted-color);
            cursor: pointer;
            font-weight: 300;

            &.active {
                position: relative;
                z-index: 1;
                font-weight: 600;

                &:after {
                    position: absolute;
                    content: "";
                    left: 0;
                    bottom: 1px;
                    width: 100%;
                    height: 6px;
                    background: var(--t-highlight-color);
                    z-index: -1;
                }
            }
        }

        .singer-btn {
            display: inline-flex;
            line-height: 16px;
            align-items: center;
            justify-content: center;
            padding: 7px 20px 7px 16px;
            cursor: pointer;
            border-radius: var(--border-radius);
            font-weight: 300;
            font-size: 12px;
            margin-left: 15px;
            transition: all 0.4s;
            background: var(--btn-background);
            color: var(--t-light-color);
        }

        .iconfont {
            margin-right: 5px;
            color: var(--t-light-color);
        }

        .playAll {
            color: var(--white-color);
            background: var(--t-highlight-color);
            .iconfont {
                color: var(--white-color);
            }
        }
    }
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

.singer-box {
    padding: 20px 20px 0;
    margin-bottom: 20px;
    background: var(--box-background);
    border-radius: var(--border-radius);
    box-shadow: var(--t-modal-shadow);
}

.simi-item {
    display: flex;
    padding: 15px 20px;
    margin: 0 -20px;
    justify-content: space-between;

    .simi-l {
        flex: 1;
        display: inline-flex;
    }

    .el-image {
        width: 40px;
        height: 40px;
        border-radius: 100%;
        overflow: hidden;
    }

    .simi-info {
        flex: 1;
        display: inline-flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 0 20px;
    }

    .singer-digital {
        display: flex;
        align-items: center;
        color: var(--t-light-color);
        font-weight: 300;
        margin-left: -10px;
        line-height: 14px;

        span {
            display: inline-block;
            line-height: 14px;
            padding: 0 10px;
        }
    }

    .simi-name {
        line-height: 14px;
    }

    .simi-oper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 80px;

        &:hover {
            color: var(--t-highlight-color);
        }
    }

    .singer-collect {
        font-size: 12px;
        font-weight: 300;
        cursor: pointer;

        .iconfont {
            margin-right: 5px;
        }

        &.active {
            color: var(--t-highlight-color);
            .iconfont {
                color: var(--t-highlight-color);
            }
        }
    }

    &:hover {

        background: var(--t-muted-background);

        a {
            text-decoration: none;
        }
    }
}

.singer-fans {
    padding-bottom: 20px;
}
.fans-main {
    padding: 20px;
    font-size: 0;
    background: var(--btn-background);

    .fans-list {
        display: flex;
    }

    .fans-item {
        position: relative;
        display: inline-block;
        width: 40px;
        height: 40px;
        margin-right: -15px;
        border-radius: 100%;
        overflow: hidden;
        border: 2px solid #fff;
        vertical-align: top;

        &:hover {
            z-index: 1;
        }
    }

    .fans-num {
        padding: 10px 0;
        font-size: 24px;
        text-align: center;
        font-weight: 300;

        span {
            display: inline-block;
            font-size: 14px;
            color: var(--t-light-color);
        }
    }

    .fans-tips {
        font-size: 12px;
        text-align: center;
        font-weight: 300;
        color: var(--t-light-color);
    }
}

.artist-desc-main {
    padding-top: 20px;
}
.introduction {
    dt {
        position: relative;
        line-height: 14px;
        padding-bottom: 10px;
        color: var(--t-muted-color);
        font-weight: 600;
        font-size: 14px;

        &::before {
            display: inline-block;
            content: '';
            width: 4px;
            height: 14px;
            margin-right: 10px;
            vertical-align: top;
            border-radius: 4px;
            background: var(--t-highlight-color);
        }
    }

    dd {
        padding-bottom: 20px;
        font-size: 12px;
        line-height: 25px;
        white-space: pre-line;
        color: var(--t-text-color);
        font-weight: 300;
    }
}
.pagination {
    display: flex;
    justify-content: center;
    padding: 30px 0;
}
</style>