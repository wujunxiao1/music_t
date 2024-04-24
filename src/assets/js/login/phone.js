import { getCurrentInstance, reactive, ref, nextTick } from 'vue';
import store from '@/store/index';

export default function phone() {
    const { proxy } = getCurrentInstance();
    const accountInfo = store.accountInfoStore();
    const loginDialogStore = store.loginDialogStore();

    // 表单输入的手机号与验证码
    const loginFormPhone = reactive({
        phone: '',       // 登录的手机号
        ctcode: '+86',   // 国家码，用于手机号登录，例如中国：86
        captcha: '',     // 验证码
    });
    const phoneVerify = (rule, value, callback) => {
        const reg = /^1[3456789]\d{9}$/;

        if (value === '') {
            callback(new Error('请输入手机号'));
        } else if (!reg.test(value)) {
            callback(new Error('手机号格式错误，请重新输入'));
        } else {
            callback();
        }
    };
    const loginFormPhoneRules = {
        phone: [{ required: true, validator: phoneVerify, trigger: 'blur' }],
        captcha: [{ required: true, message: '验证码不能为空', trigger: 'blur' }]
    };
    const loginFormPhoneRef = ref();
    let countdown = ref(-1); // 验证码倒计时
    let timer = ref(); // 定时器
    let errorMsg = ref(); // 返回的错误信息

    // 获取验证码
    const getCaptcha = () => {
        if (countdown.value >=0) return;
        // 获取验证码
        loginFormPhoneRef.value.validateField('phone', async (valid) => {
            if (valid) {
                countHandler();
                const { data: res } = await proxy.$http.sentCode(loginFormPhone);

                if (res.code !== 200) {
                    proxy.$msg.error(res.message)
                }
            }
        });
    };

    // 倒计时
    const countHandler = () => {
        countdown.value = 10;
        clearInterval(timer.value);

        timer.value = setInterval(() => {
            if (countdown.value) {
                --countdown.value;
            } else {
                clearInterval(timer.value);
                countdown.value = -1;
            }
            
        }, 1000);
    };

    // 登录
    const submitPhoneForm = () => {
        loginFormPhoneRef.value.validate(async (valid) => {
            if (valid) {
                const { data: res } = await proxy.$http.verifyCode(loginFormPhone);
    
                if (res.code !== 200) {
                    nextTick(() => {
                        errorMsg.value = res.message;
                    });
                } else {
                    // 手机号与验证码验收成功，请求登录
                    if (res.data) {
                        const { data: r } = await proxy.$http.loginPhone(loginFormPhone);

                        if (r.code !== 200) {
                            proxy.$msg.error(r.message)
                        } else {
                            const info = Object.assign({}, r.account, r.profile);
                
                            window.localStorage.setItem('isLogin', true);
                            window.localStorage.setItem('accountInfo', JSON.stringify(info));
                            window.localStorage.setItem('cookie', r.cookie)
                            accountInfo.$patch({
                                isLogin: true,
                                accountInfo: info
                            });
                            loginDialogStore.loginDialogVisible = false;
                        }
                    }
                }
            }
        })
    }

    return {
        loginFormPhone,
        loginFormPhoneRef,
        loginFormPhoneRules,
        countdown,
        getCaptcha,
        errorMsg,
        submitPhoneForm
    }
}