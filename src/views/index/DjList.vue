<script setup>
import { getCurrentInstance, onMounted, reactive, ref } from 'vue';

const { proxy } = getCurrentInstance();
const lists = ref([]);
const params = reactive({ limit: 6 });
const loading = ref(true);

// 获取私人电台
const getHotDj = async(param) => {
    const { data: res } = await proxy.$http.getHotDj(param)

    if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败')
    }

    lists.value = res.djRadios;
    loading.value = false;
}

onMounted(() => {
    getHotDj(params);
})
</script>
<template>
    <el-skeleton
        :loading="loading"
        animated
        :throttle="500"
        :count="params.limit"
        >
        <template #template>
            <div class="ske-item">
                <el-skeleton-item class="ske-img" variant="image" />
                <div class="ske-info">
                    <el-skeleton-item variant="h3" class="ske-name" />
                    <el-skeleton-item variant="h3" class="ske-rcmdtext" style="width:50%" />
                    <el-skeleton-item variant="text" class="ske-count" />
                </div>
            </div>
        </template>
        <template #default>
            <div class='dj'>
                <router-link :to="{ path: '/dj', query: { id: item.id }}" class="item" :key="item.id" v-for="item in lists">
                    <div class="faceImg">
                        <el-image :src="item.picUrl + '?param=120y120'">
                            <div slot="placeholder" class="image-slot">
                                <i class="iconfont icon-placeholder"></i>
                            </div>
                        </el-image>
                    </div>
                    <div class="info">
                        <div class="dj-name" v-if="item.name"><i class="iconfont icon-dj"></i>{{item.name}}</div>
                        <div class="dj-rcmdtext" v-if="item.rcmdtext">{{item.rcmdtext}}</div>
                        <div class="dj-count"><span>共{{$utils.formartNum(item.programCount)}}期</span> <span>订阅{{$utils.formartNum(item.subCount)}}次</span></div>
                    </div>
                </router-link>
            </div>
        </template>
    </el-skeleton>
</template>
<style lang="less" scoped>
.dj {
    display: block;
    flex-wrap: wrap;
    font-size: 0;
    padding-top: 20px;
    margin-right: -20px;

    .item {
        display: inline-flex;
        width: 50%;
        margin-bottom: 20px;
    }

    .faceImg {
        width: 100px;
        height: 100px;
        border-radius: var(--border-radius);
        flex-shrink: 0;
        overflow: hidden;
    }

    .info {
        flex: 1;
        padding-bottom: 10px;
        margin: 0 20px;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        flex-direction: column;
    }

    .icon-dj {
        padding-right: 10px;
        font-size: 18px;
    }

    .dj-name {
        height: 18px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        word-break: break-all;
        font-size: 16px;
        color: var(--t-muted-color);
    }

    .dj-rcmdtext {
        font-size: 14px;
        font-weight: 300;
        color: var(--t-muted-color);
    }

    .dj-count {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        font-weight: 300;
        color: var(--t-light-color);
    }
}

.el-skeleton {
    width: auto;
    display: block;
    flex-wrap: wrap;
    font-size: 0;

    .ske-item {
        display: inline-flex;
        width: 50%;
        margin-bottom: 20px;
    }

    .ske-img {
        width: 120px;
        height: 120px;
        border-radius: 4px;
        overflow: hidden;
    }

    .ske-info {
        flex: 1;
        padding: 10px 0;
        margin: 0 15px;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-around;
        flex-direction: column;
    }

}
</style>