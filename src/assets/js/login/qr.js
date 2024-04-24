import { getCurrentInstance, reactive, watchEffect, toRefs, watch } from 'vue';
import store from '@/store/index';

export default function qr(type) {
    const { proxy } = getCurrentInstance();
    const accountInfo = store.accountInfoStore();
    const loginDialogStore = store.loginDialogStore();
    const info = reactive({
        unikey: '',       // 二维码登录生成的key
        oSrc: '',         // 生成的二维码图片
        isShowExpired: true, // 二维码是否过期
        timer: null       // 定时器，轮询扫码状态
    })

    // 1、获取二维码登录需要 key
    const getQRkey = async() => {
        const { data: res } = await proxy.$http.getQRkey();

        if (res.code !== 200) {
            proxy.$msg.error(res.message)
        } else {
            info.unikey = res.data.unikey;
        }
    };
    // 2、根据获取的key，生成二维码图片
    const createQR = async() => {
        const { data: res } = await proxy.$http.createQR({ key: info.unikey});
    
        if (res.code !== 200) {
            proxy.$msg.error(res.message)
        } else {
            info.isShowExpired = false;
            info.oSrc = res.data.qrimg;
        }
    };
    // 3、轮询检测扫码状态接口
    const checkQR = async() => {
        const { data: res } = await proxy.$http.checkQR({ key: info.unikey });
    
        return res;
    };

    // 4、获取登录状态及用户信息
    const getQRLogin = async(cookie) => {
        const { data: res } = await proxy.$http.getQRLogin({ cookie });
    
        if (res.data.code !== 200) {
            proxy.$msg.error(res.message)
        } else {
            const info = Object.assign({}, res.data.account, res.data.profile);

            window.localStorage.setItem('isLogin', true);
            window.localStorage.setItem('accountInfo', JSON.stringify(info));
            window.localStorage.setItem('cookie', cookie)
            accountInfo.$patch({
                isLogin: true,
                accountInfo: info
            });
            loginDialogStore.loginDialogVisible = false;
        }
    }

    const login = () => {
        clearInterval(info.timer);
        info.timer = setInterval(async () => {
            const statusRes = await checkQR();
            
            // 二维码过期
            if (statusRes.code === 800) {
                clearInterval(info.timer);
                info.isShowExpired = true;
            }

            // 扫码授权成功，这一步会返回cookie
            if (statusRes.code === 803) {
                clearInterval(info.timer);
                getQRLogin(statusRes.cookie);
            }
        }, 3000)
    }

    watchEffect(() => {
        if(info.unikey) {
            createQR();
            login();
        }
    });

    // 检测是否显示登录框，此时请求二维码数据
    // 为什么不用watchEffect去检测呢？
    // watch- 显式指定依赖源，依赖源更新时执行回调函数
    // watchEffect - 自动收集依赖源，依赖源更新时重新执行自身
    // 挖个坑，觉得这块儿登录请求的逻辑还需进一步优化
    watch(() => loginDialogStore.loginDialogVisible, (newFlag) => {
        if (type == 'qr' && newFlag) {
            getQRkey();
        }
    })

    return {
        ...toRefs(info),
        login,
        getQRkey
    }
}