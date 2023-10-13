<style scoped>

</style>
<template>
    <main class="app" id="app">
        <div class="login" v-if="config.token == null || config.token == ''">
            <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form"
                style="width:90%;text-align: center;margin-left:10px;">
                <h3 class="title">黄推杀手工具</h3>
                <el-form-item prop="username">
                    <el-input v-model="loginForm.username" type="text" auto-complete="off" placeholder="账号">
                        <template #prefix>
                            <svg xmlns="http://www.w3.org/2000/svg" height="1em"
                                viewBox="0 0 448 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
                                <path
                                    d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z" />
                            </svg>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input v-model="loginForm.password" type="password" auto-complete="off" placeholder="密码"
                        @keyup.enter.native="handleLogin">

                        <template #prefix>
                            <svg xmlns="http://www.w3.org/2000/svg" height="1em"
                                viewBox="0 0 448 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
                                <path
                                    d="M144 144v48H304V144c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192V144C80 64.5 144.5 0 224 0s144 64.5 144 144v48h16c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V256c0-35.3 28.7-64 64-64H80z" />
                            </svg>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="code" v-if="captchaEnabled">
                    <el-input v-model="loginForm.code" auto-complete="off" placeholder="验证码" style="width: 50%"
                        @keyup.enter.native="handleLogin">
                        <template #prefix>
                            <svg xmlns="http://www.w3.org/2000/svg" height="1em"
                                viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
                                <path
                                    d="M269.4 2.9C265.2 1 260.7 0 256 0s-9.2 1-13.4 2.9L54.3 82.8c-22 9.3-38.4 31-38.3 57.2c.5 99.2 41.3 280.7 213.6 363.2c16.7 8 36.1 8 52.8 0C454.7 420.7 495.5 239.2 496 140c.1-26.2-16.3-47.9-38.3-57.2L269.4 2.9zM144 221.3c0-33.8 27.4-61.3 61.3-61.3c16.2 0 31.8 6.5 43.3 17.9l7.4 7.4 7.4-7.4c11.5-11.5 27.1-17.9 43.3-17.9c33.8 0 61.3 27.4 61.3 61.3c0 16.2-6.5 31.8-17.9 43.3l-82.7 82.7c-6.2 6.2-16.4 6.2-22.6 0l-82.7-82.7c-11.5-11.5-17.9-27.1-17.9-43.3z" />
                            </svg>
                        </template>
                    </el-input>
                    <div class="login-code">
                        <img :src="codeUrl" @click="getCode" class="login-code-img" />
                    </div>
                </el-form-item>
                <el-form-item style="width: 100%">
                    <el-checkbox v-model="loginForm.isAgreedPrivacy" style="margin: 0px 0px 0px 0px">请先同意<a
                            href="https://twitter.cyberworld.win/web/privacy">隐私政策</a></el-checkbox>
                </el-form-item>

                <el-form-item style="width: 100%">
                    <el-button :loading="loading" size="medium" type="primary" style="width: 100%"
                        @click.native.prevent="handleLogin">
                        <span v-if="!loading">登 录</span>
                        <span v-else>登 录 中...</span>
                    </el-button>
                </el-form-item>

                <el-form-item style="width: 100%">
                    <el-button size="medium" type="info" style="width: 100%" @click="handleRegister">
                        <span>立即注册</span>
                    </el-button>
                </el-form-item>
            </el-form>
            <!--  底部  -->


            <div style="background-color:#f0f0f0;width:100%;">
                <el-row style="padding-top:10px;padding-bottom: 10px;" justify="center">
                    <el-col :span="8" style="text-align:center">
                        <el-link type="primary" style="font-size:12px" @click="openTelegramUrl">社群</el-link>
                    </el-col>
                    <el-col :span="8" style="text-align:center">
                        <el-link type="primary" style="font-size:12px" @click="openTwitterUrl">推特</el-link>
                    </el-col>
                    <el-col :span="8" style="text-align:center">
                        <el-link type="primary" style="font-size:12px" @click="openTwitterPoster">转推</el-link>
                    </el-col>
                </el-row>
            </div>
        </div>
        <div v-else>

            <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" style="margin-top:20px;">
                <el-form :model="loginForm" label-width="150px">

                    <!-- <el-form-item label="后台自动清除黄推">
                        <el-switch v-model="config.backgroundRun" />
                    </el-form-item> -->

                    <el-tooltip
                    class="box-item"
                    effect="light"
                    content="建议设置数量为300个，运行结束后可再次点击启动"
                    placement="bottom-end"
                    >
                        <el-form-item label="屏蔽数量限制">
                            <el-input-number v-model="config.limitNum" :min="1" :max="500" :step="50"  size="small" style="height:27px;max-height: 27px;line-height:27px;" />
                        </el-form-item>
                    </el-tooltip>
                    <!-- <el-tooltip
                    class="box-item"
                    effect="light"
                    content="建议最大数量300个，运行结束后可再次点击启动"
                    placement="bottom-end"
                    >
                        <el-form-item label="屏蔽数量限制">
                            <el-input-number v-model="config.limitNum" :min="1" :max="500" :step="50" @change="handleChange" size="small" style="height:27px;max-height: 27px;line-height:27px;" />
                        </el-form-item>
                    </el-tooltip> -->
                    <el-tooltip
                    class="box-item"
                    effect="light"
                    content="开启后，仅完成任务后提示被禁黄推数量"
                    placement="bottom-end"
                    >
                    <el-form-item :label="'是否静默运行'">
                        <div style="width:40px;"/>
                        <!-- <el-link type="warning" style="font-size:14px; font-weight:normal;margin-left:-20px;width:60px;"
                            @click="openWaitPage('robot')" :underline="false">（{{ robotNum }}）</el-link> -->

                        <el-switch v-model="config.quietMode" />
                    </el-form-item>
                    </el-tooltip>
                    <el-form-item :label="'禁机器人引流黄推'">
                        <el-link type="warning" style="font-size:14px; font-weight:normal;margin-left:-20px;width:60px;"
                            @click="openWaitPage('robot')" :underline="false">（{{ robotNum }}）</el-link>

                        <el-switch v-model="config.blockRobotTweeter" />
                    </el-form-item>
                    <el-form-item label="禁疑似诈骗黄推">
                        <el-link type="warning" style="font-size:14px; font-weight:normal;margin-left:-20px;width:60px;"
                            @click="openWaitPage('scam')" :underline="false">（{{ scamNum }}）</el-link>

                        <el-switch v-model="config.blockScamTweeter" />
                    </el-form-item>
                    <el-form-item label="禁普通黄推">
                        <el-link type="success" style="font-size:14px; font-weight:normal;margin-left:-20px;width:60px;"
                            @click="openWaitPage('common')" :underline="false">（{{ commonNum }}）</el-link>

                        <el-switch v-model="config.blockPornTweeter" />
                    </el-form-item>
                    <el-form-item label="恢复误删人员">
                        <el-link type="success" style="font-size:14px; font-weight:normal;margin-left:-20px;width:60px;"
                            @click="openWaitPage('resume')" :underline="false">（{{ resumeNum }}）</el-link>

                        <el-switch v-model="config.resumeTweeter" />
                    </el-form-item>

                    <!-- <el-button type="warning">启动</el-button> -->

                </el-form>

                <!-- <el-row>
                    <el-col :span="12">
                        <el-form-item label="禁疑似诈骗黄推">
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-switch v-model="config.hiddenAIBotTweet" />
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="禁所有黄推">
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-switch v-model="config.hiddenAIBotTweet" />
                    </el-col>
                </el-row> -->
            </el-form>

            <el-form-item style="width: 100%">
                <el-button size="medium" type="primary"
                    style="width:100%;margin-left:20px;margin-right:20px;text-align:center;" @click="runKiller(config.run)">
                    <span v-if="config.run != true">启动</span>
                    <span v-else>暂停</span>
                </el-button>

                <!-- <el-button :loading="loading" size="medium" type="primary"
                    style="width:100%;margin-left:20px;margin-right:20px;text-align:center;" @click="runKiller(config.run)">
                    <span>退出登录</span>
                </el-button> -->
            </el-form-item>
            <div style="background-color:#f0f0f0;">
                <el-row style="padding-top:10px;padding-bottom: 10px;" justify="center">
                    <el-col :span="8" style="text-align:center">
                        <el-link type="primary" style="font-size:12px" @click="openTelegramUrl">社群</el-link>
                    </el-col>
                    <el-col :span="8" style="text-align:center">
                        <el-link type="primary" style="font-size:12px" @click="openTwitterUrl">推特</el-link>
                    </el-col>
                    <el-col :span="8" style="text-align:center">
                        <el-link type="primary" style="font-size:12px" @click="logoutSystem">退出</el-link>
                    </el-col>
                </el-row>
            </div>

        </div>
    </main>
</template>

<script>
import { defineComponent, reactive, watch, createApp } from "vue";
import {toRaw} from '@vue/reactivity';
import { getSharedConfig } from "@/shared.js";
import manifest from "@/manifest.production.json";
import { getCodeImg } from "@/api/login";
import Cookies from "js-cookie";
import { encrypt, decrypt } from "@/utils/jsencrypt";
import SvgIcon from "@/components/SvgIcon"; // svg component
import { login, logout, getInfo, getCount } from "@/api/login";
import { getToken, setToken, removeToken } from '@/utils/auth'
import { ElMessage } from 'element-plus'

// const config = reactive(getSharedConfig());

const cookie = JSON.parse(Cookies.get("num") ?? "{}")

export default defineComponent({
    name: "PopupView",
    components: {
        "svg-icon": SvgIcon,
    },
    data() {
        return {
            robotNum: cookie.robotNum ?? 0,
            scamNum: cookie.scamNum ?? 0,
            commonNum: cookie.commonNum ?? 0,
            resumeNum: cookie.resumeNum ?? 0,
            config:{
                backgroundRun: false,    
                token: "",
                blockRobotTweeter: true,
                blockScamTweeter: false,
                blockPornTweeter: false,
                run: false,
                overTime: "",
                running: false,
                limitNum:300,
                quietMode: false,
                resumeTweeter: false,
            },
            manifest,
            user_i18n: chrome.i18n.getMessage("user_i18n"),
            i18n_hiddenAIRobotReply: chrome.i18n.getMessage("hiddenAIRobotReply"),
            i18n_hiddenPromotedInfo: chrome.i18n.getMessage("hiddenPromotedInfo"),
            i18n_foldScamImages: chrome.i18n.getMessage("foldScamImages"),
            i18n_switchLogoToBlueBird: chrome.i18n.getMessage("switchLogoToBlueBird"),
            codeUrl: "",
            loginForm: {
                username: "",
                password: "",
                rememberMe: true,
                code: "",
                uuid: "",
                isAgreedPrivacy: true
            },
            loginRules: {
                username: [
                    { required: true, trigger: "blur", message: "请输入您的邮箱账号" },
                ],
                password: [
                    { required: true, trigger: "blur", message: "请输入您的密码" },
                ],
                code: [{ required: true, trigger: "change", message: "请输入验证码" }],
            },
            loading: false,
            // 验证码开关
            captchaEnabled: false,
            // 注册开关
            register: false,
            redirect: undefined,
            loadingRegister: false,
        };
    },
    watch: {
        config:{
            handler:function(val,oldVal){
                debugger;
                var that = this;
                let value = toRaw(val);
                console.log("watch:");
                console.log(value);
                chrome.storage.sync.set(value);
            },
            deep:true
        },
        
        'config.run' : function (newQuestion, oldQuestion) {
            getCount().then((res) => {
                this.robotNum = res.data.robotNum
                this.scamNum = res.data.scamNum
                this.commonNum = res.data.commonNum
                this.resumeNum = res.data.resumeNum
                Cookies.set("num", JSON.stringify({
                    robotNum: res.data.robotNum,
                    scamNum: res.data.scamNum,
                    commonNum: res.data.commonNum,
                    resumeNum: res.data.resumeNum
                }))
            })
            .catch((error) => {
                console.log(error);
            });
        }
    },
    async created() {
        var that = this;
        async function initConfig() {
            return new Promise((resolve, reject) => {
                try{
                chrome.storage.sync.get(getSharedConfig(), (res) => {
                    console.log("get");
                    console.log(res);
                    setToken(res.token);
                    Object.assign(that.config, res);
                    resolve(res);
                });
                }catch (e) {
                    reject(e);
                }
                
            });
        }
        await initConfig();
        chrome.storage.onChanged.addListener((changes) => {
            if (changes.run != undefined) {
                this.config.run = changes.run.newValue
            }
        })
        var token = getToken();
        // if (this.config.token == undefined || this.config.token == "") {
        //     this.getCode();
        // }
        if (token == undefined || token == "") {
        } else {
            getCount().then((res) => {
                this.robotNum = res.data.robotNum
                this.scamNum = res.data.scamNum
                this.commonNum = res.data.commonNum
                this.resumeNum = res.data.resumeNum
                Cookies.set("num", JSON.stringify({
                    robotNum: res.data.robotNum,
                    scamNum: res.data.scamNum,
                    commonNum: res.data.commonNum,
                    resumeNum: res.data.resumeNum
                }))
            })
            .catch((error) => {
                console.log(error);
            });
        }
        this.getCookie();



    },
    methods: {
        handleRegister() {

            chrome.tabs.create({
                url: "https://twitter.cyberworld.win/web/register",
            });
        },
        getCode() {


            getCodeImg().then((res) => {
                this.captchaEnabled =
                    res.captchaEnabled === undefined ? true : res.captchaEnabled;
                if (this.captchaEnabled) {
                    this.codeUrl = "data:image/gif;base64," + res.img;
                    this.loginForm.uuid = res.uuid;
                }
            });
        },
        getCookie() {
            const username = Cookies.get("username");
            const password = Cookies.get("password");
            const rememberMe = Cookies.get("rememberMe");

            this.loginForm = {
                username: username === undefined ? this.loginForm.username : username,
                password:
                    password === undefined ? this.loginForm.password : decrypt(password),
                rememberMe: rememberMe === undefined ? false : Boolean(rememberMe),
                isAgreedPrivacy: this.loginForm.isAgreedPrivacy,
            };
        },
        handleLogin() {
            var that = this;
            if (this.loginForm.isAgreedPrivacy) {
                this.$refs.loginForm.validate((valid) => {
                    if (valid) {
                        this.loading = true;
                        if (this.loginForm.rememberMe) {
                            Cookies.set("username", this.loginForm.username, { expires: 30 });
                            Cookies.set("password", encrypt(this.loginForm.password), {
                                expires: 30,
                            });
                            Cookies.set("rememberMe", this.loginForm.rememberMe, {
                                expires: 30,
                            });
                        } else {
                            Cookies.remove("username");
                            Cookies.remove("password");
                            Cookies.remove("rememberMe");
                        }
                        var userInfo = this.loginForm;
                        const username = userInfo.username.trim();
                        const password = userInfo.password;
                        const code = userInfo.code;
                        const uuid = userInfo.uuid;

                        login(username, password, code, uuid)
                            .then((res) => {
                                setToken(res.token);
                                // this.$router.push({ path: this.redirect || "/" }).catch(() => {});
                                that.config.token = getToken();
                                console.log(that.config.token);
                                // localStorage.setItem("app_token",res.token);
                                // commit("SET_TOKEN", res.token);
                                that.loading = false;
                                getCount().then((res) => {
                                    that.robotNum = res.data.robotNum
                                    that.scamNum = res.data.scamNum
                                    that.commonNum = res.data.commonNum
                                    that.resumeNum = res.data.resumeNum
                                    Cookies.set("num", JSON.stringify({
                                        robotNum: res.data.robotNum,
                                        scamNum: res.data.scamNum,
                                        commonNum: res.data.commonNum,
                                        resumeNum: res.data.resumeNum
                                    }))
                                })
                                .catch((error) => {
                                    console.log(error);
                                });
                            })
                            .catch((error) => {
                                this.loading = false;
                                if (this.captchaEnabled) {
                                    this.getCode();
                                }
                            });
                    }
                });

            }
        },
        runKiller(run) {
            this.config.run = !run;
            if (this.config.run) {
                var query = { active: true, currentWindow: true };
                chrome.tabs.query(query, function callback(tabs) {
                    var currentTab = tabs[0]; // there will be only one in this array
                    if (currentTab.url.indexOf("twitter.com") < 0) {
                        chrome.tabs.create({
                            url: "https://twitter.com/home",
                        });
                    }
                    // console.log(currentTab); // also has properties like currentTab.id
                });
            }

        },
        openTelegramUrl() {
            chrome.tabs.create({
                url: "https://t.me/PornTwitterKiller",
            });
        },
        openTwitterUrl() {
            chrome.tabs.create({
                url: "https://twitter.com/PornKiller2023",
            });
        },
        openTwitterPoster() {
            chrome.tabs.create({
                url: "https://twitter.com/PornKiller2023",
            });
        },
        openWaitPage(kind) {
            chrome.tabs.create({
                url: "https://twitter.cyberworld.win/web/twitter/pornWait?kind="+kind,
            });
        },
        logoutSystem() {
            setToken("");
            this.config.token = "";
            this.config.run = false;
        },

    },
});
</script>

<style>
.smallnotice {
    font-size: 10px;
}

.login {
    height: 300px;
    width: 300px;
    text-align: center;
}

.title {
    margin: 20px auto 30px auto;
    text-align: center;
    color: #707070;
}

.login-form .el-input {
    height: 38px;
}

.login-form .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 2px;
}

.login-form {
    border-radius: 6px;
    background: #ffffff;
    width: 300px;
    padding: 0px 0px 0px 0px;
}

.login-tip {
    font-size: 13px;
    text-align: center;
    color: #bfbfbf;
}

.login-code {
    width: 50%;
    height: 38px;
    float: right;
}

.login-code img {
    cursor: pointer;
    vertical-align: middle;
}

/* 
.el-login-footer {
    height: 40px;
    line-height: 40px;
    position: fixed;
    bottom: 0;
    width: 100%;
    text-align: center;
    color: #fff;
    font-family: Arial;
    font-size: 12px;
    letter-spacing: 1px;
} */

.login-code-img {
    height: 38px;
}

.el-input__wrapper{
    height:25px;
    line-height:25px;
}
.el-input-number.is-without-controls .el-input__inner {
  width: 100px;
  line-height: 20px;
  height: 16px;
}

/*组件外盒子 */
.h5bbx7_1{

}

/* 设置输入框的高度 */
.h5bbx7_1 /deep/ .el-input-number--mini {
    width: 80px;
    line-height: 26px;
}
.h5bbx7_1 /deep/ .el-input-number .el-input__inner {
  width: 80px;
  height: 24px;
  padding: 0 28px;

}

.h5bbx7_1 /deep/ .el-input-number__decrease:hover:not(.is-disabled)~.el-input .el-input__inner:not(.is-disabled), .h5bbx7_1 /deep/ .el-input-number__increase:hover:not(.is-disabled)~.el-input .el-input__inner:not(.is-disabled){
  border-color: #eee;

}

.h5bbx7_1 /deep/ .el-input-number__increase {
  height: 24px;
  width: 24px;

}

.h5bbx7_1 /deep/ .el-input-number__decrease {
  width: 24px;
  height: 24px;

}
</style>
