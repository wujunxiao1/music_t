<script setup>
import { reactive, watch } from 'vue';
const props = defineProps({ params: Object });
const emit = defineEmits(['replyMsg']);
const info = reactive({
    msg: '',
    maxLen: 140
});

const subReplyComment = () => {
    emit('replyMsg', info['msg']);
};


watch(() => info['msg'], () => {
    info['msg'] = info['maxLen'] >= info['msg'] ? info['msg'] : info['msg'].substring(0, info['maxLen'])
});
</script>

<template>
    <div class='reply-comment'>
        <h3>我回复@{{params.user.nickname}}:</h3>
        <div class="comment_textarea">
            <div class="pre">{{info.msg}}</div>
            <textarea class="J_inpBox inp-paragraph" name="leave_msg" id="leave_msg" placeholder="期待你的神评论……" v-model="info.msg"></textarea>
        </div>
        <div class="comment_box_footer">
            <span class="comment_limit"><em class="num">{{info.msg.length}}</em>/{{info.maxLen}}</span>
            <el-button type="primary" @click="subReplyComment">评论</el-button>
        </div>
    </div>
</template>

<style scoped lang="less">
.reply-comment {
    padding: 10px 15px;
    margin-top: 5px;
    background: var(--t-container-background);
    border-radius: var(--border-radius);

    h3 {
        line-height: 14px;
        padding-bottom: 10px;
        font-size: 14px;
        font-weight: 300;
        color: var(--t-light-color);
    }
}
.comment_textarea {
    position: relative;
    border: 1px solid #e9e9e9;
    border-radius: var(--border-radius);
    background: #fff;
}

.pre {
    visibility: hidden;
}

.inp-paragraph {
    position: absolute;
    top: 0;
    left: 0;
    height: calc(100% - 20px);
    resize: none;
    width: auto;
    padding: 0;
    border: 0;
    margin: 0;
    font-family: inherit;
    border-radius: 0;
    box-shadow: none;
    overflow: hidden;
}

.inp-paragraph, .pre {
    width: calc(100% - 30px);
    padding: 10px 15px;
    line-height: 24px;
    min-height: 24px;
    font-size: 14px;
    color: var(--t-text-color);
    border-radius: var(--border-radius);
    white-space: pre-wrap;
    word-wrap: break-word
}
.comment_box_footer {
    padding: 15px 0 0;
    text-align: right;
}

.comment_limit {
    display: inline-block;
    line-height: 28px;
    padding: 0 20px;
    font-size: 14px;
    color: var(--t-muted-color);
    font-weight: 300;

    em {
        font-style: normal;
    }
}
</style>