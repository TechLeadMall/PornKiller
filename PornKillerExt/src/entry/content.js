
import { getSharedConfig } from "@/shared";
import { getToken, setToken, removeToken } from '@/utils/auth'
import { getCodeImg } from "@/api/login";
import Cookies from "js-cookie";
import { getPornList, updateUserBlock,updateUserResume} from "@/api/twitter/porn";
import $ from 'jquery';
import { createApp } from 'vue'
import App from './content.vue'
// 1. 引入你需要的组件
// 2. 引入组件样式

// import store from '../store'
// import router from './router'

import 'element-plus/dist/index.css'
import { ElNotification } from 'element-plus'
import axios from 'axios'

createApp(App).mount('#app')

var config = {};
chrome.storage.sync.get(getSharedConfig(), (storageData) => {
    setToken(storageData.token);
    Object.assign(config, storageData);
    if (storageData.run == true) {
        fireEvent();
        console.log("running");
    }
});

chrome.storage.onChanged.addListener((changes) => {
    if (changes.run != undefined) {
        if (changes.run.newValue == true) {
            // chrome.storage.sync.set({ running: true });
            config.run = true;
            fireEvent();
            console.log("running");
        }else{
            config.run = false;
        }
    }
    if (changes.token != undefined) {
        setToken(changes.token.newValue);
        config.token = changes.token.newValue;
    }    
    if (changes.blockRobotTweeter != undefined) {
        config.blockRobotTweeter = changes.blockRobotTweeter.newValue;
    }
    if (changes.blockScamTweeter != undefined) {
        config.blockScamTweeter = changes.blockScamTweeter.newValue;
    }
    if (changes.blockPornTweeter != undefined) {
        config.blockPornTweeter = changes.blockPornTweeter.newValue;
    }    
    if (changes.backgroundRun != undefined) {
        config.backgroundRun = changes.backgroundRun.newValue;
    }
    if (changes.limitNum != undefined) {
        config.limitNum = changes.limitNum.newValue;
    }
    if (changes.quietMode != undefined) {
        config.quietMode = changes.quietMode.newValue;
    }
    if (changes.resumeTweeter != undefined) {
        config.resumeTweeter = changes.resumeTweeter.newValue;
    }
    // helperKit.updateConfig(changes as { [p in IDefaultStaticConfigKeys]: chrome.storage.StorageChange } )
})

async function delay(time) {
    return new Promise((resolve,) => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}

async function requestList(kind) {
    return new Promise((resolve, reject) => {
        getPornList(kind).then(res => {
            if (res.data != null) {
                if (kind == 'resume'){
                    localStorage.setItem("resumeList", JSON.stringify(res.data));
                }else{
                    localStorage.setItem("list", JSON.stringify(res.data));
                }
            }
            resolve(res);
        }).catch((err) => {
            reject(err);
        });
    });
}
async function updateUserBlockSync(data) {
    return new Promise((resolve, reject) => {
        updateUserBlock(data).then(res => {
            resolve(res);
        }).catch((err) => {
            reject(err);
        });
    });
}
async function updateUserResumeSync(data) {
    return new Promise((resolve, reject) => {
        updateUserResume(data).then(res => {
            resolve(res);
        }).catch((err) => {
            reject(err);
        });
    });
}

function gotoUrlByUserName(userName, forse = false) {
    var userNameWithoutSym = userName.substring(1);

    // localStorage.setItem("requestCount",0);
    var url = "https://twitter.com/" + userNameWithoutSym
    if (window.location.href != url || forse == true) {
        location.href = url;
    }
}
async function simulateHumanDelay() {
    var requestCount = localStorage.getItem("requestCount");
    requestCount++;
    localStorage.setItem("requestCount", requestCount);
    if (requestCount % 3 == 0) {
        // localStorage.setItem("requestCount",0);
        // await delay(Math.ceil(Math.floor(Math.random() * 200)));

    }
    if (requestCount > 50) {
        // localStorage.setItem("requestCount", 0);
        // ElNotification({
        //     title: '提示',
        //     message: '请求次数过多，先等待30s',
        //     duration: 0,
        //     type: 'warnning',
        // })
        // await delay(30000);
    }
    await delay(100 + Math.ceil(Math.floor(Math.random() * 100)));
}


function get_cookie(cname) {
    const name = cname + '='
    const ca = document.cookie.split(';')
    for (let i = 0; i < ca.length; ++i) {
        const c = ca[i].trim()
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length)
        }
    }
    return ''
}

const ajax = axios.create({
    baseURL: 'https://api.twitter.com',
    withCredentials: true,
    headers: {
        Authorization: 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
        'X-Twitter-Auth-Type': 'OAuth2Session',
        'X-Twitter-Active-User': 'yes',
        'X-Csrf-Token': get_cookie('ct0')
    }
})
async function block_user(id) {
    try {


        var data = { user_id: id }
        var result = await ajax.post('/1.1/blocks/create.json', {
            user_id: id
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        //   console.log(result);

        // Update blocked IDs list in GM storage

    } catch (err) {
        throw (err);
        // Handle errors as needed
    }
}
async function resume_user(id) {
    try {


        var data = { user_id: id }
        var result = await ajax.post('https://twitter.com/i/api/1.1/blocks/destroy.json', {
            user_id: id
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        //   console.log(result);

        // Update blocked IDs list in GM storage

    } catch (err) {
        throw (err);
        // Handle errors as needed
    }
}
async function fireEvent() {
    if (config.run) {
        var requestCount = 0;
        var alreadyBlockNum = 0;
        var exceptionNum = 0;
        var isOver = false;
        if (config.blockRobotTweeter == true || config.blockScamTweeter == true || config.blockPornTweeter == true){
            
            while (!isOver) {
                await simulateHumanDelay();

                for (let j = 0; j < 1; j++) {
                    await delay(800);

                    const authenticateHtml = $('iframe[id="arkose_iframe"]');
                    if (authenticateHtml != null && authenticateHtml.length > 0) {

                        ElNotification({
                            title: '提示',
                            message: '需先进行机器人校验',
                            duration: 0,
                            type: 'warnning',
                        })
                        // alert("需先进行机器人校验");
                        return;
                    }
                }



                var blockListJson = localStorage.getItem("list");

                // console.log(blockListJson);
                var isValidBlockList = false;
                try {
                    if (blockListJson != undefined) {
                        var blockListValid = JSON.parse(blockListJson);
                        if (blockListValid.length > 0 && blockListValid[0].userId != undefined) {
                            isValidBlockList = true;
                        }
                    }
                } catch (e) {

                }
                var ret = { msg: "no more data" };
                if (!isValidBlockList) {
                    if (ret != undefined && ret.msg == "no more data" && config.blockRobotTweeter == true)
                        ret = await requestList("robot");
                    if (ret != undefined && ret.msg == "no more data" && config.blockScamTweeter == true)
                        ret = await requestList("scam");
                    if (ret != undefined && ret.msg == "no more data" && config.blockPornTweeter == true)
                        ret = await requestList("common");

                    if (ret != undefined && ret.msg == "no more data") {
                        if (config.backgroundRun) {
                            await delay(6000);

                            // ElNotification({
                            //     title: '提示',
                            //     message: '完成一次任务，已禁'+alreadyBlockNum+'个黄推，等待下一次任务。',
                            //     duration: 1000,    
                            //     type: 'success',
                            // })
                        } else {
                            if (config.resumeTweeter != true)
                                chrome.storage.sync.set({ run: false });
                            ElNotification({
                                title: '提示',
                                message: '完成任务，已禁' + alreadyBlockNum + '个黄推。',
                                duration: 0,
                                type: 'success',
                            })
                        }
                        // alert("已完成任务")
                        break;
                    }
                }
                blockListJson = localStorage.getItem("list");
                var blockList = JSON.parse(blockListJson);
                var newBlockList = JSON.parse(blockListJson);
                var blockOperData = [];

                if (blockList != undefined) {
                    for (let i = 0; i < blockList.length; i++) {
                        if(requestCount >= config.limitNum){
                            chrome.storage.sync.set({ run: false });
                            ElNotification({
                                title: '提示',
                                message: '完成任务，已完成处理' + requestCount + '次。请稍后再启动程序。',
                                duration: 0,
                                type: 'success',
                            })
                            
                            await updateUserBlockSync(blockOperData)
                            blockOperData = []
                            return;
                        }
                        let porn = blockList[i];
                        var userId = porn.userId;
                        if (userId == undefined) {
                            continue;
                        }
                        var userName = porn.userName;
                        if (userName == undefined) {
                            continue;
                        }
                        try {
                            if (!config.run){
                                await updateUserBlockSync(blockOperData)
                                blockOperData = []
                                isOver = true;
                                return;
                            }
                            requestCount++;
                            await block_user(userId);
                            blockOperData.push({ pornUserId: porn.userId, pornUserName: porn.userName, result: "1" })
                            // await updateUserBlockSync({ pornUserId: porn.userId, pornUserName: porn.userName, result: "1" })
                            alreadyBlockNum++;

                            if (config.backgroundRun) {
                            } else {
                                if (!config.quietMode){
                                    ElNotification({
                                        title: '提示',
                                        message: '已禁黄推"' + porn.displayName+'"。',
                                        duration: 2000,
                                        type: 'success',
                                    })
                                }

                            }
                        } catch (e) {
                            if (exceptionNum>30){
                                ElNotification({
                                    title: '提示',
                                    message: '异常过多，请检查网络或是否有其他异常。重新启动。',
                                    duration: 0,
                                    type: 'success',
                                })
                                chrome.storage.sync.set({run:false});
                                exceptionNum = 0;
                                isOver = true;

                            }
                            if (e.response != undefined && e.response.data != undefined && e.response.data.errors!= undefined && e.response.data.errors[0]!= undefined){
                                if (e.response.data.errors[0].message == "User not found."){
                                    blockOperData.push({ pornUserId: porn.userId, pornUserName: porn.userName, result: "6" })

                                    // await updateUserBlockSync({ pornUserId: porn.userId, pornUserName: porn.userName, result: "6" })
                                    
                                }else{
                                    
                                    exceptionNum ++ ;
                                    if (e.response.data.errors[0].message == "Could not authenticate you."){
                                        ElNotification({
                                            title: '提示',
                                            message: '请求次数过多，建议等待一会再运行系统，刷新页面。重新启动',
                                            duration: 0,
                                            type: 'success',
                                        })
                                        chrome.storage.sync.set({run:false});
                                        isOver = true;
                                        
                                        blockOperData.push({ pornUserId: porn.userId, pornUserName: porn.userName, result: "8" })
                                        // await updateUserBlockSync({ pornUserId: porn.userId, pornUserName: porn.userName, result: "8" })
                                    }else{
                                        blockOperData.push({ pornUserId: porn.userId, pornUserName: porn.userName, result: "9" })
                                        // await updateUserBlockSync({ pornUserId: porn.userId, pornUserName: porn.userName, result: "9" })
                                    }
        
                                }
                            }else{
                                
                                exceptionNum ++ ;
                                blockOperData.push({ pornUserId: porn.userId, pornUserName: porn.userName, result: "7" })
                                // await updateUserBlockSync({ pornUserId: porn.userId, pornUserName: porn.userName, result: "7" })
                            }
                            

                        }
                        newBlockList.shift();
                        localStorage.setItem("list", JSON.stringify(newBlockList));
                        await updateUserBlockSync(blockOperData)
                        blockOperData = [];


                        await delay(200);

                    }
                }
            }
        }
    }
    var alreadyBlockNum = 0;
    isOver = false;
    blockOperData = [];
    if (config.resumeTweeter == true){
        while (!isOver) {
            await simulateHumanDelay();

            for (let j = 0; j < 1; j++) {
                await delay(800);

                const authenticateHtml = $('iframe[id="arkose_iframe"]');
                if (authenticateHtml != null && authenticateHtml.length > 0) {

                    ElNotification({
                        title: '提示',
                        message: '需先进行机器人校验',
                        duration: 0,
                        type: 'warnning',
                    })
                    // alert("需先进行机器人校验");
                    return;
                }
            }



            var blockListJson = localStorage.getItem("resumeList");

            // console.log(blockListJson);
            var isValidBlockList = false;
            try {
                if (blockListJson != undefined) {
                    var blockListValid = JSON.parse(blockListJson);
                    if (blockListValid.length > 0 && blockListValid[0].userId != undefined) {
                        isValidBlockList = true;
                    }
                }
            } catch (e) {

            }
            var ret = { msg: "no more data" };
            if (!isValidBlockList) {
                if (ret != undefined && ret.msg == "no more data" && config.resumeTweeter == true)
                    ret = await requestList("resume");

                if (ret != undefined && ret.msg == "no more data") {
                    if (config.backgroundRun) {
                        await delay(6000);

                        // ElNotification({
                        //     title: '提示',
                        //     message: '完成一次任务，已禁'+alreadyBlockNum+'个黄推，等待下一次任务。',
                        //     duration: 1000,    
                        //     type: 'success',
                        // })
                    } else {
                        chrome.storage.sync.set({ run: false });
                        ElNotification({
                            title: '提示',
                            message: '完成任务，已禁' + alreadyBlockNum + '个黄推。',
                            duration: 0,
                            type: 'success',
                        })
                    }
                    // alert("已完成任务")
                    return;
                }
            }
            blockListJson = localStorage.getItem("resumeList");
            var blockList = JSON.parse(blockListJson);
            var newBlockList = JSON.parse(blockListJson);


            if (blockList != undefined) {
                for (let i = 0; i < blockList.length; i++) {
                    if(requestCount >= config.limitNum){
                        chrome.storage.sync.set({ run: false });
                        ElNotification({
                            title: '提示',
                            message: '完成任务，已完成处理' + requestCount + '次。请稍后再启动程序。',
                            duration: 0,
                            type: 'success',
                        })
                        
                        await updateUserResumeSync(blockOperData)
                        blockOperData = []
                        return;
                    }
                    let porn = blockList[i];
                    var userId = porn.userId;
                    if (userId == undefined) {
                        continue;
                    }
                    var userName = porn.userName;
                    if (userName == undefined) {
                        continue;
                    }
                    try {
                        if (!config.run){

                            isOver = true;
                            
                            await updateUserResumeSync(blockOperData)
                            blockOperData = []
                            return;
                        }
                        requestCount++;
                        await resume_user(userId);

                        blockOperData.push({ pornUserId: porn.userId, pornUserName: porn.userName, result: "1"});
                        // await updateUserResumeSync({ pornUserId: porn.userId, pornUserName: porn.userName, result: "1" })
                        alreadyBlockNum++;

                        if (config.backgroundRun) {
                        } else {
                            if (!config.quietMode){
                                ElNotification({
                                    title: '提示',
                                    message: '已恢复误删名单"' + porn.displayName+'"。',
                                    duration: 2000,
                                    type: 'success',
                                })
                            }

                        }
                    } catch (e) {
                        if (exceptionNum>50){
                            ElNotification({
                                title: '提示',
                                message: '异常过多，请检查网络或是否有其他异常。重新启动。',
                                duration: 0,
                                type: 'success',
                            })
                            chrome.storage.sync.set({run:false});
                            exceptionNum = 0;
                            isOver = true;

                        }
                        exceptionNum ++ ;
                        if (e.response != undefined && e.response.data != undefined && e.response.data.errors!= undefined && e.response.data.errors[0]!= undefined){
                            if (e.response.data.errors[0].message == "User not found."){
                                blockOperData.push({ pornUserId: porn.userId, pornUserName: porn.userName, result: "6"});

                                // await updateUserResumeSync({ pornUserId: porn.userId, pornUserName: porn.userName, result: "6" })
                                
                            }else{
                                if (e.response.data.errors[0].message == "Could not authenticate you."){
                                    ElNotification({
                                        title: '提示',
                                        message: '请求次数过多，建议等待一会再运行系统，刷新页面。重新启动',
                                        duration: 0,
                                        type: 'success',
                                    })
                                    chrome.storage.sync.set({run:false});
                                    isOver = true;
                                    
                                    blockOperData.push({ pornUserId: porn.userId, pornUserName: porn.userName, result: "8"});
                                    // await updateUserResumeSync({ pornUserId: porn.userId, pornUserName: porn.userName, result: "8" })
                                }else{
                                    blockOperData.push({ pornUserId: porn.userId, pornUserName: porn.userName, result: "9"});
                                    // await updateUserResumeSync({ pornUserId: porn.userId, pornUserName: porn.userName, result: "9" })
                                }

                            }
                        }else{
                            
                            blockOperData.push({ pornUserId: porn.userId, pornUserName: porn.userName, result: "7"});
                        }
                        

                    }
                    newBlockList.shift();
                    localStorage.setItem("resumeList", JSON.stringify(newBlockList));

                    await updateUserResumeSync(blockOperData)
                    blockOperData = []

                    await delay(200);

                }
            }
        }
    }
}
