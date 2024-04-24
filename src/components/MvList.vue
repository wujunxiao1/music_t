<script setup>
    const props = defineProps({
        mvList: Array,
        num: Number,
        loading: Boolean
    });
</script>
<template>
    <el-skeleton
        :loading="props.loading"
        animated
        :count="props.num"
        :throttle="500"
        >
        <template #template>
            <div class="item">
                <el-skeleton-item class="ske-img" variant="h3" />
                <div class="ske-info">
                    <el-skeleton-item variant="h3" class="ske-name" />
                    <el-skeleton-item variant="text" class="ske-txt" style="width:50%" />
                    <el-skeleton-item variant="text" class="ske-txt" />
                </div>
            </div>
        </template>
        <template #default>
            <div class='mv'>
                <template v-for="item in props.mvList" key="id">
                    <mv-main :info="item"></mv-main>
                </template>
            </div>
        </template>
    </el-skeleton>
</template>

<style scoped lang="less">
.mv {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: left;
    padding-bottom: 20px;
    margin: 0 -10px;
    font-size: 0;
}

.el-skeleton {
    display: flex;
    width: auto;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: left;
    margin: 0 -10px;
    font-size: 0;

    .item {
        flex: 30%;
        max-width: calc(100% / 5 - 20px);
        margin: 20px 10px 0;
        border-radius: 4px;
    }

    .ske-img {
        display: block;
        position: relative;
        width: 100%;
        height: 123px;
        overflow: hidden;
    }

    .ske-info {
        position: relative;
        padding: 15px 0;
    }

    .ske-name {
        display: block;
        margin: 0 0 6px;
        line-height: 14px;
        height: 14px;
    }

    .ske-txt {
        display: block;
        margin: 0 0 8px 0;
        line-height: 16px;
        width: 10%;
    }
}
</style>
