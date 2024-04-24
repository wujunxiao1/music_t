import { getCurrentInstance, reactive, ref } from 'vue';
import store from '@/store/index';

export default function pwd() {
    const { proxy } = getCurrentInstance();
    const accountInfo = store.accountInfoStore();
    const loginDialogStore = store.loginDialogStore();
    
    // 表单输入的邮箱与密码
    const loginForm = reactive({
        email: '',
        password: ''
    });
    // 邮箱的正则验证
    const emailVerify = (rule, value, callback) => {
        const reg = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;

        if (value === '') {
            callback(new Error('请输入登录邮箱'));
        } else if (!reg.test(value)) {
            callback(new Error('登录邮箱格式错误，请重新输入'));
        } else {
            callback();
        }
    };
    // 表单校验规则的验证
    const loginFormRules = {
        email: [{ required: true, validator:emailVerify, trigger: 'blur' }],
        password: [{ required: true, message: '请输入网易密码', trigger: 'blur' }]
    };
    // 获取表单ref
    const loginFormRef = ref();

    // 提交表单
    const submitForm = () => {
        if (!loginFormRef.value) return;
        loginFormRef.value.validate(async (valid) => {
            if (valid) {
                const { data: res } = await proxy.$http.loginPwd(loginForm);
    
                if (res.code !== 200) {
                    proxy.$msg.error(res.message)
                } else {
                    const info = Object.assign({}, res.data.account, res.data.profile);
        
                    window.localStorage.setItem('isLogin', true);
                    window.localStorage.setItem('accountInfo', JSON.stringify(info));
                    window.localStorage.setItem('cookie', res.data.cookie)
                    accountInfo.$patch({
                        isLogin: true,
                        accountInfo: info
                    });
                    loginDialogStore.loginDialogVisible = false;
                }
            }
        })
    }

    return {
        loginForm,
        loginFormRef,
        loginFormRules,
        submitForm
    }
}