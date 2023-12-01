
import { getSharedConfig } from "@/shared";
import { getToken, setToken, removeToken } from '@/utils/auth'
import { getCodeImg } from "@/api/login";
import Cookies from "js-cookie";
import { getPornList, updateUserBlock,updateUserResume} from "@/api/twitter/porn";
import { getTwitterName} from "@/api/login";
import $ from 'jquery';
import { createApp } from 'vue'
import moment from "moment";
import App from './content.vue'

import { addReplyList,updateHideStatus } from "@/api/twitter/replyRecord";
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
    if (storageData.runHideFunc == true) {
        fireEventInfluencer();
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
    if (changes.runHideFunc != undefined) {
        if (changes.runHideFunc.newValue == true) {
            // chrome.storage.sync.set({ running: true });
            config.runHideFunc = true;
            fireEventInfluencer();
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
    if (changes.tweetNum != undefined) {
        config.tweetNum = changes.tweetNum.newValue;
    }
    if (changes.loopMinute != undefined) {
        config.loopMinute = changes.loopMinute.newValue;
    }
    if (changes.onlyGetTweet != undefined) {
        config.onlyGetTweet = changes.onlyGetTweet.newValue;
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

async function hideReply(tweetId) {
    try {

        var result = await ajax.post('https://twitter.com/i/api/graphql/pjFnHGVqCjTcZol0xcBJjw/ModerateTweet', {
            queryId: "pjFnHGVqCjTcZol0xcBJjw",
            variables: 
            {tweetId: tweetId}
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return result;
        //   console.log(result);

        // Update blocked IDs list in GM storage

    } catch (err) {
        throw (err);
        // Handle errors as needed
    }
}

async function getUserByScreenName(screenName) {
    try {

        var returnData = {};
        var result = await ajax.get('https://twitter.com/i/api/graphql/G3KGOASz96M-Qu0nwmGXNg/UserByScreenName?variables=%7B%22screen_name%22%3A%22'+screenName+'%22%2C%22withSafetyModeUserFields%22%3Atrue%7D&features=%7B%22hidden_profile_likes_enabled%22%3Atrue%2C%22hidden_profile_subscriptions_enabled%22%3Atrue%2C%22responsive_web_graphql_exclude_directive_enabled%22%3Atrue%2C%22verified_phone_label_enabled%22%3Afalse%2C%22subscriptions_verification_info_is_identity_verified_enabled%22%3Atrue%2C%22subscriptions_verification_info_verified_since_enabled%22%3Atrue%2C%22highlights_tweets_tab_ui_enabled%22%3Atrue%2C%22creator_subscriptions_tweet_preview_api_enabled%22%3Atrue%2C%22responsive_web_graphql_skip_user_profile_image_extensions_enabled%22%3Afalse%2C%22responsive_web_graphql_timeline_navigation_enabled%22%3Atrue%7D&fieldToggles=%7B%22withAuxiliaryUserLabels%22%3Afalse%7D',
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
        
        try {
            var userItem = {};
            var user;
            var tweet;
            var result;
            var user = result['data']['data']['user']['result']['legacy'];
            // item.full_text = tweets[i]['content']['itemContent']['tweet_results']['result']['legacy']['full_text'];
            // item.id_str = tweets[i]['content']['itemContent']['tweet_results']['result']['legacy']['id_str'];

            userItem.created_at = moment(new Date(user['created_at'])).format("yyyy-MM-DD hh:mm:ss");
            userItem.description = user['description'];
            userItem.fast_followers_count = user['fast_followers_count'];
            userItem.favourites_count = user['favourites_count'];
            userItem.followers_count = user['followers_count'];
            userItem.friends_count = user['friends_count'];
            userItem.media_count = user['media_count'];
            userItem.name = user['name'];
            userItem.normal_followers_count = user['normal_followers_count'];
            userItem.profile_banner_url = user['profile_banner_url'];
            userItem.profile_image_url_https = user['profile_image_url_https'];
            userItem.screen_name = '@'+user['screen_name'];
            userItem.statuses_count = user['statuses_count'];
            userItem.verified = user['verified'];
            userItem.user_id_str = result['data']['data']['user']['result']['rest_id']

        } catch (err) {
            console.log(err);
            // Handle errors as needed
        }
        
        returnData.userItem =  userItem
        return returnData;
        // Update blocked IDs list in GM storage

    } catch (err) {
        throw (err);
        // Handle errors as needed
    }
}
async function getTweetDetails(id) {
    try {

        var data = { user_id: id }

        var nextPageCursor = "";

        var returnData = {};
        var tweetList = [];
        var userList = [];
        while (true) {
            var result;

            await delay(500);
            if (nextPageCursor == "") {
                result = await ajax.get('https://twitter.com/i/api/graphql/xOhkmRac04YFZmOzU9PJHg/TweetDetail?variables=%7B%22focalTweetId%22%3A%22' + id + '%22%2C%22with_rux_injections%22%3Afalse%2C%22includePromotedContent%22%3Atrue%2C%22withCommunity%22%3Atrue%2C%22withQuickPromoteEligibilityTweetFields%22%3Atrue%2C%22withBirdwatchNotes%22%3Atrue%2C%22withVoice%22%3Atrue%2C%22withV2Timeline%22%3Atrue%7D&features=%7B%22responsive_web_graphql_exclude_directive_enabled%22%3Atrue%2C%22verified_phone_label_enabled%22%3Afalse%2C%22creator_subscriptions_tweet_preview_api_enabled%22%3Atrue%2C%22responsive_web_graphql_timeline_navigation_enabled%22%3Atrue%2C%22responsive_web_graphql_skip_user_profile_image_extensions_enabled%22%3Afalse%2C%22tweetypie_unmention_optimization_enabled%22%3Atrue%2C%22responsive_web_edit_tweet_api_enabled%22%3Atrue%2C%22graphql_is_translatable_rweb_tweet_is_translatable_enabled%22%3Atrue%2C%22view_counts_everywhere_api_enabled%22%3Atrue%2C%22longform_notetweets_consumption_enabled%22%3Atrue%2C%22responsive_web_twitter_article_tweet_consumption_enabled%22%3Afalse%2C%22tweet_awards_web_tipping_enabled%22%3Afalse%2C%22freedom_of_speech_not_reach_fetch_enabled%22%3Atrue%2C%22standardized_nudges_misinfo%22%3Atrue%2C%22tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled%22%3Atrue%2C%22longform_notetweets_rich_text_read_enabled%22%3Atrue%2C%22longform_notetweets_inline_media_enabled%22%3Atrue%2C%22responsive_web_media_download_video_enabled%22%3Afalse%2C%22responsive_web_enhance_cards_enabled%22%3Afalse%7D&fieldToggles=%7B%22withArticleRichContentState%22%3Afalse%7D',
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    });

            } else {

                result = await ajax.get('https://twitter.com/i/api/graphql/xOhkmRac04YFZmOzU9PJHg/TweetDetail?variables=%7B%22focalTweetId%22%3A%22' + id + '%22%2C%22cursor%22%3A%22' +
                    nextPageCursor +
                    '%22%2C%22referrer%22%3A%22messages%22%2C%22controller_data%22%3A%22DAACDAABDAABCgABAAAAAAAAAAAKAAkXdmdFVtuwAQAAAAA%3D%22%2C%22with_rux_injections%22%3Afalse%2C%22includePromotedContent%22%3Atrue%2C%22withCommunity%22%3Atrue%2C%22withQuickPromoteEligibilityTweetFields%22%3Atrue%2C%22withBirdwatchNotes%22%3Atrue%2C%22withVoice%22%3Atrue%2C%22withV2Timeline%22%3Atrue%7D&features=%7B%22responsive_web_graphql_exclude_directive_enabled%22%3Atrue%2C%22verified_phone_label_enabled%22%3Afalse%2C%22creator_subscriptions_tweet_preview_api_enabled%22%3Atrue%2C%22responsive_web_graphql_timeline_navigation_enabled%22%3Atrue%2C%22responsive_web_graphql_skip_user_profile_image_extensions_enabled%22%3Afalse%2C%22tweetypie_unmention_optimization_enabled%22%3Atrue%2C%22responsive_web_edit_tweet_api_enabled%22%3Atrue%2C%22graphql_is_translatable_rweb_tweet_is_translatable_enabled%22%3Atrue%2C%22view_counts_everywhere_api_enabled%22%3Atrue%2C%22longform_notetweets_consumption_enabled%22%3Atrue%2C%22responsive_web_twitter_article_tweet_consumption_enabled%22%3Afalse%2C%22tweet_awards_web_tipping_enabled%22%3Afalse%2C%22freedom_of_speech_not_reach_fetch_enabled%22%3Atrue%2C%22standardized_nudges_misinfo%22%3Atrue%2C%22tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled%22%3Atrue%2C%22longform_notetweets_rich_text_read_enabled%22%3Atrue%2C%22longform_notetweets_inline_media_enabled%22%3Atrue%2C%22responsive_web_media_download_video_enabled%22%3Afalse%2C%22responsive_web_enhance_cards_enabled%22%3Afalse%7D&fieldToggles=%7B%22withArticleRichContentState%22%3Afalse%7D',
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    });
            }
            // if (result['errors'][0]['message']){

            // };
            var replys = result['data']['data']['threaded_conversation_with_injections_v2']['instructions'][0]['entries'];
            for (let i = 0; i < replys.length - 1; i++) {
                try {
                    var item = {};
                    var tweetItem = {};
                    var userItem = {};
                    var user;
                    var tweet;
                    var result;
                    if (replys[i]['entryId'].indexOf('tweet')>=0){
                        user =  replys[i]['content']['itemContent']['tweet_results']['result']['core']['user_results']['result']['legacy'];
                        tweet = replys[i]['content']['itemContent']['tweet_results']['result']['legacy'];
                        result = replys[i]['content']['itemContent']['tweet_results']['result']
                    }else{
                        user = replys[i]['content']['items'][0]['item']['itemContent']['tweet_results']['result']['core']['user_results']['result']['legacy'];
                        tweet = replys[i]['content']['items'][0]['item']['itemContent']['tweet_results']['result']['legacy'];
                        result = replys[i]['content']['items'][0]['item']['itemContent']['tweet_results']['result'];
                    }
                    userItem.created_at = moment(new Date(user['created_at'])).format("yyyy-MM-DD hh:mm:ss");
                    userItem.description = user['description'];
                    userItem.fast_followers_count = user['fast_followers_count'];
                    userItem.favourites_count = user['favourites_count'];
                    userItem.followers_count = user['followers_count'];
                    userItem.friends_count = user['friends_count'];
                    userItem.media_count = user['media_count'];
                    userItem.name = user['name'];
                    userItem.normal_followers_count = user['normal_followers_count'];
                    userItem.profile_banner_url = user['profile_banner_url'];
                    userItem.profile_image_url_https = user['profile_image_url_https'];
                    userItem.screen_name = '@'+user['screen_name'];
                    userItem.statuses_count = user['statuses_count'];
                    userItem.verified = user['verified'];
                    userItem.user_id_str = tweet['user_id_str'];

                    tweetItem.conversation_id_str = tweet['conversation_id_str'];
                    tweetItem.bookmark_count = tweet['bookmark_count'];
                    tweetItem.created_at =  moment(new Date(tweet['created_at'])).format("yyyy-MM-DD hh:mm:ss");;
                    tweetItem.favorite_count = tweet['favorite_count'];
                    tweetItem.full_text = tweet['full_text'];
                    tweetItem.id_str = tweet['id_str'];
                    tweetItem.in_reply_to_screen_name = tweet['in_reply_to_screen_name'];
                    tweetItem.in_reply_to_status_id_str = tweet['in_reply_to_status_id_str'];
                    tweetItem.in_reply_to_user_id_str = tweet['in_reply_to_user_id_str'];
                    tweetItem.quoted_status_id_str = tweet['quoted_status_id_str'];
                    tweetItem.user_id_str = tweet['user_id_str'];
                    tweetItem.reply_count = tweet['reply_count'];
                    tweetItem.retweet_count = tweet['retweet_count'];
                    tweetItem.quote_count = tweet['quote_count'];
                    tweetItem.view_count = result['views']['count'];
                    try{
                        tweetItem['media_url_https1'] = tweet['entities']['media'][0]['media_url_https'];
                        tweetItem['media_url_https2'] = tweet['entities']['media'][1]['media_url_https'];
                        tweetItem['media_url_https3'] = tweet['entities']['media'][3]['media_url_https'];
                        tweetItem['media_url_https4'] = tweet['entities']['media'][4]['media_url_https'];
                    } catch (err) {
                        // Handle errors as needed
                    }

                    tweetItem.source = result['source'];
                    // tweetItem.rest = result['source'];
                    tweetList.push(tweetItem);
                    userList.push(userItem);
                    // item.tweet = tweetItem;
                    // item.user = userItem;
                    // arr.push(item);
                } catch (err) {
                    console.log(err);
                    // Handle errors as needed
                }
            }
            try {
                if (replys[replys.length - 1]['content']['itemContent']['cursorType'] == 'ShowMoreThreads') {
                    break;
                }

                nextPageCursor = replys[replys.length - 1]['content']['itemContent']['value']
            } catch (err) {
                break;
                // Handle errors as needed
            }
        }
        returnData.tweetList =  tweetList
        returnData.userList =  userList
        returnData.inReplyToStatusIdStr =  id
        // console.log(result);
        // console.log(arr);
        return returnData;
        // Update blocked IDs list in GM storage

    } catch (err) {
        throw (err);
        // Handle errors as needed
    }
}


async function getUserTweets(userId) {
    try {

        var tweetList = [];
        var result = await ajax.get('https://twitter.com/i/api/graphql/SX0nRdNbOSuBDiaw0bsPPQ/UserMedia?variables=%7B%22userId%22%3A%22'+userId+'%22%2C%22count%22%3A20%2C%22includePromotedContent%22%3Afalse%2C%22withClientEventToken%22%3Afalse%2C%22withBirdwatchNotes%22%3Afalse%2C%22withVoice%22%3Atrue%2C%22withV2Timeline%22%3Atrue%7D&features=%7B%22responsive_web_graphql_exclude_directive_enabled%22%3Atrue%2C%22verified_phone_label_enabled%22%3Afalse%2C%22responsive_web_home_pinned_timelines_enabled%22%3Atrue%2C%22creator_subscriptions_tweet_preview_api_enabled%22%3Atrue%2C%22responsive_web_graphql_timeline_navigation_enabled%22%3Atrue%2C%22responsive_web_graphql_skip_user_profile_image_extensions_enabled%22%3Afalse%2C%22tweetypie_unmention_optimization_enabled%22%3Atrue%2C%22responsive_web_edit_tweet_api_enabled%22%3Atrue%2C%22graphql_is_translatable_rweb_tweet_is_translatable_enabled%22%3Atrue%2C%22view_counts_everywhere_api_enabled%22%3Atrue%2C%22longform_notetweets_consumption_enabled%22%3Atrue%2C%22responsive_web_twitter_article_tweet_consumption_enabled%22%3Afalse%2C%22tweet_awards_web_tipping_enabled%22%3Afalse%2C%22freedom_of_speech_not_reach_fetch_enabled%22%3Atrue%2C%22standardized_nudges_misinfo%22%3Atrue%2C%22tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled%22%3Atrue%2C%22longform_notetweets_rich_text_read_enabled%22%3Atrue%2C%22longform_notetweets_inline_media_enabled%22%3Atrue%2C%22responsive_web_media_download_video_enabled%22%3Afalse%2C%22responsive_web_enhance_cards_enabled%22%3Afalse%7D',
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
        
        try {
            var replys = result['data']['data']['user']['result']['timeline_v2']['timeline']['instructions'][0]['entries'];
            for (let i = 0; i < replys.length - 1; i++) {
                try {
                    var user;
                    var tweet;
                    var result;
                    if (replys[i]['entryId'].indexOf('tweet')>=0){
                        user =  replys[i]['content']['itemContent']['tweet_results']['result']['core']['user_results']['result']['legacy'];
                        tweet = replys[i]['content']['itemContent']['tweet_results']['result']['legacy'];
                        result = replys[i]['content']['itemContent']['tweet_results']['result'];
                        tweetList.push(tweet['id_str']);
                    }
                    // else{
                    //     user = replys[i]['content']['items'][0]['item']['itemContent']['tweet_results']['result']['core']['user_results']['result']['legacy'];
                    //     tweet = replys[i]['content']['items'][0]['item']['itemContent']['tweet_results']['result']['legacy'];
                    //     result = replys[i]['content']['items'][0]['item']['itemContent']['tweet_results']['result'];
                    // }

                    // tweetItem.conversation_id_str = tweet['conversation_id_str'];
                    // tweetItem.bookmark_count = tweet['bookmark_count'];
                    // tweetItem.created_at =  moment(new Date(tweet['created_at'])).format("yyyy-MM-DD hh:mm:ss");;
                    // tweetItem.favorite_count = tweet['favorite_count'];
                    // tweetItem.full_text = tweet['full_text'];
                    // tweetItem.id_str = tweet['id_str'];
                    // tweetItem.in_reply_to_screen_name = tweet['in_reply_to_screen_name'];
                    // tweetItem.in_reply_to_status_id_str = tweet['in_reply_to_status_id_str'];
                    // tweetItem.in_reply_to_user_id_str = tweet['in_reply_to_user_id_str'];
                    // tweetItem.quoted_status_id_str = tweet['quoted_status_id_str'];
                    // tweetItem.user_id_str = tweet['user_id_str'];
                    // tweetItem.reply_count = tweet['reply_count'];
                    // tweetItem.retweet_count = tweet['retweet_count'];
                    // tweetItem.quote_count = tweet['quote_count'];
                    // tweetItem.view_count = result['views']['count'];
                    // try{
                    //     tweetItem['media_url_https1'] = tweet['entities']['media'][0]['media_url_https'];
                    //     tweetItem['media_url_https2'] = tweet['entities']['media'][1]['media_url_https'];
                    //     tweetItem['media_url_https3'] = tweet['entities']['media'][3]['media_url_https'];
                    //     tweetItem['media_url_https4'] = tweet['entities']['media'][4]['media_url_https'];
                    // } catch (err) {
                    //     // Handle errors as needed
                    // }

                    // tweetItem.source = result['source'];
                    // tweetItem.rest = result['source'];
                    // userList.push(userItem);
                    // item.tweet = tweetItem;
                    // item.user = userItem;
                    // arr.push(item);
                } catch (err) {
                    console.log(err);
                    // Handle errors as needed
                }
            // try {
            //     if (replys[replys.length - 1]['content']['itemContent']['cursorType'] == 'ShowMoreThreads') {
            //         break;
            //     }

            //     nextPageCursor = replys[replys.length - 1]['content']['itemContent']['value']
            // } catch (err) {
            //     break;
            //     // Handle errors as needed
            // }
        }
        } catch (err) {
            console.log(err);
            // Handle errors as needed
        }
        
        return tweetList;
        // Update blocked IDs list in GM storage

    } catch (err) {
        throw (err);
        // Handle errors as needed
    }
}
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
                            type: 'warning',
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
                        type: 'warning',
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

async function fireEventInfluencer() {
    var exceptionNum = 0;
    while(true){
        if (config.runHideFunc) {
            for (let j = 0; j < 1; j++) {
                await delay(800);

                const authenticateHtml = $('iframe[id="arkose_iframe"]');
                if (authenticateHtml != null && authenticateHtml.length > 0) {

                    ElNotification({
                        title: '提示',
                        message: '需先进行机器人校验',
                        duration: 0,
                        type: 'warning',
                    })
                    // alert("需先进行机器人校验");
                    return;
                }
            }


            var text;
            var hideList = [];
            let res = await getTwitterName();
            if (res.twitterName == null){
                ElNotification({
                    title: '提示',
                    message: '请先登录管理系统设置twitter账户名。',
                    duration: 3000,
                    type: 'warning',
                })
            }
            let screenName = res.twitterName.substring(1);
            try{
                let user = await getUserByScreenName(screenName);
                var tweetIdList = await getUserTweets(user.userItem.user_id_str);
                console.log(tweetIdList)
                if (tweetIdList.length == 0){
                    ElNotification({
                        title: '提示',
                        message: '当前账户下未检测到推文，请核实。',
                        duration: 3000,
                        type: 'warning',
                    })
                }
                var tweetNum = tweetIdList.length;
                if (config.tweetNum <tweetIdList.length){
                    tweetNum = config.tweetNum;
                }
                
                for (let i =0;i<tweetNum;i++){
                    var replys = await getTweetDetails(tweetIdList[i]);
                    
                    let needHideResult = await addReplyList(replys);
                    if (!config.onlyGetTweet){
                        let needHideList = needHideResult.data;
                        for (let j=0;j<needHideList.length;j++){
                            await delay(1000);
                            try{
                                let result = await hideReply(needHideList[j])
                                if (result.data.errors== null || result.data.errors.length == 0 )
                                    hideList.push(needHideList[j])
                            }catch(e){
                                
                            }
                        }
                        console.log(needHideResult);
                    }
                    await delay(5000);
                }
                exceptionNum = 0;
            }catch(e){
                exceptionNum++;
                if (exceptionNum>10){
                    ElNotification({
                        title: '提示',
                        message: '出现异常，请刷新检查登录状态或等待一段时间重新启动监控',
                        duration: 3000,
                        type: 'warning',
                    })
                    chrome.storage.sync.set({runHideFunc:false});

                }
            }
            if (hideList.length>0)
                await updateHideStatus({"hideList":hideList});
            await delay(config.loopMinute*60*1000);


        }
    }
    
}