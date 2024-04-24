import { getCurrentInstance, onMounted, reactive } from 'vue';

export function newMvList() {
    const { proxy } = getCurrentInstance();

    const mv_info = reactive({
        tags: proxy.$AREA.MV_AREA,  // 新碟上架标签列表
        lists: [], // 歌单列表
        index: 0,  // 当前选中标签
        loading: true,
        params: { limit:10, offset: 0 }
    });

    // 最新MV
    const getMvList = async(params) => {
        const { data: res } = await proxy.$http.mv(params)

        if (res.code !== 200) {
            return proxy.$msg.error('数据请求失败')
        }

        mv_info['lists'] = res.data;
        mv_info['loading'] = false;
    }

    // 切换MV类别
    const chooseMvTag = (index) => {
        mv_info['index'] = index;
        mv_info['params']['area'] = index !== 0 ? mv_info['area'][index] : '';
        mv_info['loading'] = true;
        getMvList(mv_info['params']);
    }

    onMounted(() => {
        getMvList(mv_info['params']);
    });

    return {
        mv_info,
        chooseMvTag
    }
}