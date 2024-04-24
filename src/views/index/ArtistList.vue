<script setup>
import { getCurrentInstance, onMounted, reactive, ref } from 'vue';

const { proxy } = getCurrentInstance();
const lists = ref([]);
const params = reactive({ limit: 36 });
const count = 12;
const loading = ref(true);

// 热门歌手
const getArtists = async(param) => {
    const { data: res } = await proxy.$http.topArtists(param)

    if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败')
    }

    lists.value = splitGroup(res.artists, count);
    loading.value = false;
}

const splitGroup = (array, subGroupLength) => {
    let index = 0;
    let newArray = [];
    while(index < array.length) {
        newArray.push(array.slice(index, index += subGroupLength));
    }
    return newArray;
}

onMounted(() => {
    getArtists(params);
})
</script>
<template>
    <el-skeleton
        :loading="loading"
        animated
        :throttle="500"
        :count="count"
        >
        <template #template>
            <el-skeleton-item class="ske-img" variant="image" />
        </template>
        <template #default>
            <el-carousel class='artist' height="330px" :interval="8000" arrow="never" indicator-position="outside">
                <el-carousel-item class="box" :key="index" v-for="(list, index) in lists">
                    <router-link :to="{ path: '/artist', query: { id: item.id }}" :key="item.id" v-for="item in list" class="item">
                        <div class="faceImg">
                            <el-image :src="item.picUrl + '?param=100y100'">
                                <div slot="placeholder" class="image-slot">
                                    <i class="iconfont icon-placeholder"></i>
                                </div>
                            </el-image>
                        </div>
                        <div class="info">
                            <div class="artist-name" v-if="item.name">{{item.name}}</div>
                        </div>
                    </router-link>
                </el-carousel-item>
            </el-carousel>
        </template>
    </el-skeleton>
</template>
<style lang="less" scoped>
.artist {
    display: block;
    height: 350px;
    padding-top: 20px;
    font-size: 0;

    .box {
        display: flex;
        flex-wrap: wrap;
        align-content: space-between;
        justify-content: space-between;
    }

    .item {
        // width: 100px;
        // height: 100px;
        border-radius: var(--border-radius);
        overflow: hidden;
    }
}

.el-skeleton {
    display: flex;
    flex-wrap: wrap;
    align-content: space-between;
    justify-content: space-around;
    height: 340px;

    .ske-img {
        width: 100px;
        height: 100px;
    }
}
</style>