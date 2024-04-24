import { unref } from 'vue';

const clickOutside = {
    beforeMount(target, binding){
        function clickHandler(e) {
            const plain = unref(target);
            const el = plain ?.$el ?? plain;
            const composedPath = e.composedPath();

            //先判断点击的元素是否是本身，如果是本身，则返回
            if (!el || el === e.target || composedPath.includes(el)) return;
            //判断指令中是否绑定了函数
            if (typeof binding.value === 'function') {
                //如果绑定了函数，则调用函数，此处value就是clickImgOut方法
                binding.value(e)
            }
        }
        
        // 给当前元素绑定个私有变量，方便在unbind中可以解除事件监听
        target.handler = clickHandler;
        //添加事件监听
        setTimeout(() => {
            document.addEventListener('click', target.handler);
        }, 0);
    },
    unmounted(el){
        //解除事件监听
        document.removeEventListener('click',el.handler);
    }
};

export default clickOutside;