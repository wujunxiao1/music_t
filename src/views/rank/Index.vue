<script setup>
import { getCurrentInstance, onMounted, reactive, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Loading from '@components/Loading.vue';
const { proxy } = getCurrentInstance();
const route = useRoute();
const router = useRouter();

const RANKTYPE = [{
    name: 'TOP榜',
    type: 'Top'
}, {
    name: '特色榜',
    type: 'Feature'
}, {
    name: '场景榜',
    type: 'Other'
}];

const info = reactive({
    category: [],   // 右侧分类导航列表
    isLoading: true,
    rankInfo: {},
    songList: [],
    total: 0,
    loading: true
})

// 获取排行榜场景列表
const getRankTypeList = async() => {
    const { data: res } = await proxy.$http.topListDetail()

    if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败')
    }

    RANKTYPE.forEach(rankinfo => {
        let obj = {};

        obj['title'] = rankinfo.name;
        obj['list'] = res.list.filter(item => {
            let flag = false;

            switch(rankinfo.type) {
                case 'Top':  // 云音乐TOP榜
                    flag = item.ToplistType;
                    break;
                case 'Feature':  // 云音乐特色榜
                    flag = !item.ToplistType && item.name.indexOf('云音乐') >= 0;
                    break;
                case 'Other':  // 其他场景榜
                    flag = !item.ToplistType && item.name.indexOf('云音乐') < 0;
                    break;
            }
            return flag;
        });

        info['category'].push(obj);
        info['rId'] = info.rId ? info.rId : info.category[0].list[0].id;
    })
};
// 切换排行榜
const selectItem = (item) => {
    info.rId = item.id
    router.push({ path: 'rank', query: { rId: info.rId } })
};

const getListDetail = async() => {
    info['isLoading'] = true;
    const { data: res } = await proxy.$http.playListDetail({ id: info.rId, s: -1 })

    if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败')
    }

    info['rankInfo'] = res.playlist
    info['songList'] = proxy.$utils.formatSongs(res.playlist.tracks, res.privileges)
    info['total'] = info.songList.length
    info['isLoading'] = false;
    info['loading'] = false;
};

onMounted(() => {
    info.rId = route.query.rId;
    getRankTypeList();
});

watchEffect(() => {
    if (info.rId) {
        info.loading = true;
        getListDetail();
    }
})
</script>

<template>
    <div class="rank">
        <div class="rank-container">
            <div class="rank-main">
                <el-skeleton
                    class="cover"
                    :loading="info.loading"
                    animated
                    :throttle="500"
                    >
                    <template #template>
                        <el-skeleton-item variant="image" class="cover-img" />
                        <div class="cover-info">
                            <el-skeleton-item variant="h3" class="skeleton-title" />
                            <div class="cover-author">
                                <el-skeleton-item variant="image" class="cover-avatar" />
                                <el-skeleton-item variant="p" class="cover-name" style="width: 10%" />
                                <el-skeleton-item variant="p" class="cover-date" style="width: 10%" />
                            </div>
                            <div class="cover-digital">
                                <el-skeleton-item variant="p" class="cover-playCount" style="width: 25%" />
                                <el-skeleton-item variant="p" class="cover-collect" style="width: 25%" />
                                <el-skeleton-item variant="p" class="cover-comment" style="width: 25%" />
                            </div>
                            <div class="cover-desc">
                                <el-skeleton-item variant="p" class="cover-desc-title" style="width: 10%" />
                                <el-skeleton-item variant="text" class="skeleton-desc-text" style="width: 100%" />
                                <el-skeleton-item variant="text" class="skeleton-desc-text" style="width: 70%" />
                            </div>
                        </div>
                    </template>
                    <template #default>
                        <div class="cover">
                            <div class="cover-img">
                                <el-image :src="info.rankInfo.coverImgUrl">
                                    <div slot="placeholder" class="image-slot">
                                        <i class="iconfont icon-placeholder"></i>
                                    </div>
                                </el-image>
                            </div>
                            <div class="cover-info">
                                <div class="cover-header">
                                    <div class="cover-title">
                                        {{info.rankInfo.name}} <span>({{$utils.formartDate(info.rankInfo.updateTime, 'MM月dd日')}} 更新)</span>
                                    </div>
                                </div>
                                <div class="cover-author" v-if="info.rankInfo.creator">
                                    <el-image :src="info.rankInfo.creator.avatarUrl" class="cover-avatar">
                                        <div slot="placeholder" class="image-slot">
                                            <i class="iconfont icon-placeholder"></i>
                                        </div>
                                    </el-image>
                                    <div class="cover-name">{{info.rankInfo.creator.nickname}}</div>
                                    <div class="cover-date">{{$utils.formartDate(info.rankInfo.createTime, 'yyyy-MM-dd')}}</div>
                                </div>
                                <div class="cover-digital">
                                    <span class="cover-playCount"><i class="iconfont icon-playnum"></i> {{$utils.formartNum(info.rankInfo.playCount)}}次</span>
                                    <span class="cover-collect"><i class="iconfont icon-collect"></i> {{$utils.formartNum(info.rankInfo.subscribedCount)}}</span>
                                    <span class="cover-comment"><i class="iconfont icon-comment"></i> {{$utils.formartNum(info.rankInfo.commentCount)}}</span>
                                </div>
                                <div class="cover-desc">
                                    <h5 class="cover-desc-title">歌单简介</h5>
                                    <p class="cover-desc-text" v-html="info.rankInfo.description"></p>
                                </div>
                            </div>
                        </div>
                    </template>
                </el-skeleton>
                <div class="song-main">
                    <div class="song-header">
                        <h4>歌曲列表 <em>{{info.total + '首歌'}}</em></h4>
                        <span class="play-all"><i class="iconfont icon-audio-play"></i> 播放全部</span>
                        <span :class="['collect', info.rankInfo.subscribed ? 'active' : '']" ><i :class="['iconfont', 'icon-collect' + (info.rankInfo.subscribed ? '-active' : '')]"></i> {{ info.rankInfo.subscribed ? '已收藏' : '收藏'}}</span>
                    </div>
                    <template v-if="info.isLoading">
                        <Loading />
                    </template>
                    <template v-else>
                        <song-list :songList="info.songList"></song-list>
                    </template>
                </div>
            </div>
            <div class="rank-aside">
                <div class="rank-aside-nav" v-for="item in info.category" :key="item.title">
                    <div class="rank-aside-title">
                        {{item.title}}
                    </div>
                    <div class="rank-aside-main">
                        <div class="rank-aside-item" :class="{active: info.rId == list.id}" v-for="(list, index) in item.list" :key="index" @click="selectItem(list)">
                            <el-image class="item-img" :src="list.coverImgUrl">
                                <div slot="placeholder" class="image-slot">
                                    <i class="iconfont icon-placeholder"></i>
                                </div>
                            </el-image>
                            <div class="item-info">
                                <div class="item-title">
                                    {{list.name}}
                                </div>
                                <div class="item-time">
                                    {{list.updateFrequency}}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang='less' scoped>
.rank-container {
    display: flex;
    padding: 35px 0 0 0;
}
.rank-main {
    flex: 1;
    padding-bottom: 45px;
}

.cover {
    display: flex;
    box-shadow: var(--t-modal-shadow);
    background: var(--box-background);
    border-radius: var(--border-radius);
}

.cover-img {
    display: flex;
    align-items: center;
    width: 200px;
    height: 200px;
    border-radius: var(--border-radius) 0 0 var(--border-radius);
    overflow: hidden;
    flex-shrink: 0;

    .el-image {
        width: 100%;
        height: 100%;
    }
}

.cover-info {
    flex: 1;
    padding: 20px 20px 10px;
    font-size: 0;
    border-radius: var(--border-radius);

    .cover-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .cover-title {
        flex: 1;
        font-size: 24px;
        height: 24px;
        line-height: 24px;
        color: var(--t-muted-color);

        span {
            display: inline-block;
            padding-left: 10px;
            font-weight: normal;
            line-height: 22px;
            font-size: 14px;
            font-weight: 300;
            color: var(--t-light-color);
        }
    }
}
.cover-author-tags {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.cover-author {
    display: flex;
    align-items: center;
    padding: 15px 0 5px;

    .cover-avatar {
        display: inline-block;
        width: 24px;
        height: 24px;
        border-radius: 100%;
        vertical-align: top;
        flex-shrink: 0;
    }

    .cover-name, .cover-date {
        display: inline-block;
        margin: 0 5px;
        font-size: 14px;
        font-weight: 300;
        color: var(--t-muted-color);
    }

    .cover-date {
        color: var(--t-light-color);
    }
}
.cover-playCount, .cover-collect, .cover-comment {
    display: inline-block;
    margin-right: 20px;
    line-height: 16px;
    font-size: 14px;
    font-weight: 300;
    color: var(--t-light-color);

    i {
        vertical-align: top;
        color: var(--t-light-color);
    }
}
.cover-desc {
    position: relative;

    .cover-desc-title {
        margin: 20px 0 5px;
        line-height: 14px;
        font-size: 14px;
        font-weight: 400;
        color: var(--t-light-color);
    }

    .cover-desc-text {
        line-height: 22px;
        font-size: 14px;
        color: var(--t-light-color);
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        word-break: break-all;
        font-weight: 300;
    }
}

.song-main {
    position: relative;
    // padding: 0 20px;
    margin-top: 25px;
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
        color: var(--color-text-height);
    }
}

.rank-aside {
    width: @sideWidth;
    padding-bottom: 25px;
    flex-shrink: 0;
    padding-left: @paddingW;
}

.rank-aside-nav {
    font-size: 0;

    .rank-aside-title {
        font-size: 16px;
        line-height: 16px;
        padding: 0 10px 20px;
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

    .rank-aside-main {
        display: flex;
        flex-wrap: wrap;
    }

    .rank-aside-item {
        display: flex;
        width: calc(50% - 20px);
        padding: 10px;
        cursor: pointer;

        &.active {
            background: var(--t-highlight-color);
            border-radius: var(--border-radius);

            .item-title, .item-time {
                color: var(--white-color);
            }
        }
    }

    .item-img {
        flex-shrink: 0;
        width: 29px;
        height: 29px;
        border-radius: var(--border-radius);
    }

    .item-info {
        width: calc(100% - 50px);
        padding-left: 5px;
    }

    .item-title {
        font-size: 12px;
        line-height: 12px;
        padding-bottom: 5px;
        color: var(--t-muted-color);
        width: 100%;
        font-weight: 400;
        display: inline-block;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        vertical-align: top;
    }

    .item-time {
        font-size: 12px;
        line-height: 12px;
        font-weight: 300;
        color: var(--t-light-color);
    }
}

.rank-aside-nav {
    padding: 0 10px 10px;
    margin-bottom: 20px;
    // box-shadow: var(--t-modal-shadow);
    // background: var(--box-background);
    border-radius: var(--border-radius);
}

.skeleton-title {
    width: 50%;
    height: 24px;
}
.skeleton-desc-text {
    line-height: 22px;
    margin: 8px 0 0;
}
</style>