// ==UserScript==
// @name         推特自动化
// @namespace    http://tampermonkey.net/
// @version      2024-09-04
// @description  推特自动化
// @author       You
// @match        https://x.com/*
// @match        https://twitter.com/*
// @match        https://app.galxe.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=x.com
// @grant        unsafeWindow
// @tag          Twitter
// ==/UserScript==

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function findButtonElementByText(text) {
    let tweetButtonList = document.querySelectorAll('button');
    for (let tweetButtonIndex of tweetButtonList) {
        let tweetButtonText = tweetButtonIndex.innerText;
        if (tweetButtonText.startsWith(text)) {
            return tweetButtonIndex;
        }
    }
    return null;
}

function setCookie(name, value, days, domain) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    let cookieString = name + "=" + (value || "") + expires + "; path=/";
    
    if (domain) {
        cookieString += "; domain=" + domain;
    }

    document.cookie = cookieString;
}

(function() {
    'use strict';

    window.addEventListener('load',async function() {
        console.log("推特自动化插件加载");

        //  模块公开API,方便被其他脚本调用
        unsafeWindow.getFirstTweet = (async () => {
            let popup = window.open(
                "https://x.com/home",
                "_blank"
            );

            if (popup) {
                popup.focus();

                setTimeout(() => {
                    popup.postMessage({type:'getFirstTweet'},'*');
                },2000);

                let recvTwitterResult = null;
                //  接收推特域的返回
                window.addEventListener("message", function(event) {
                    console.log("收到来自推特页面的消息:", event.data,event.origin);
                    if (event.origin.startsWith('https://x.com') || event.origin.startsWith('https://twitter.com')) {
                        if (event.data.type === 'getFirstTweet') {
                            recvTwitterResult = event.data.data;
                        }
                    }
                }, false);

                for (let tick = 0;tick < 30;tick++) {
                    if (recvTwitterResult !== null) {
                        popup.close();
                        return recvTwitterResult;
                    }
                    await delay(1000);
                }
            }
            popup.close();
            return null;
        });

        let currentURL = window.location.href;
        if (currentURL.startsWith('https://x.com/') || currentURL.startsWith('https://twitter.com/') ) {
            console.log("推特自动化插件启动");
            //  模块消息处理,遇到相同模块但是不同域的时候使用
            console.log("推特自动化插件注册跨模块回调");
            window.addEventListener("message",async function(event) {
                if (event.origin === 'https://app.galxe.com') {
                    /// console.log("收到来自银河的消息:", event.data);
                    if (event.data.type === 'getFirstTweet') {
                        let profileButton = document.querySelectorAll('a[aria-label="Profile"]');
                        profileButton[0].click();
                        await delay(3000);
                        let tweetList = document.querySelectorAll('article');
                        tweetList[0].click();
                        await delay(3000);
                        event.source.postMessage({type:'getFirstTweet',data:window.location.href},event.origin);
                    } else {
                        event.source.postMessage({type:'unsupport'},event.origin);
                    }
                }
            }, false);

            //  推特自动化逻辑
            if (currentURL.startsWith('https://x.com/intent/post')) {
                console.log("推特自动化插件处理转发");
                await delay(5000);
                const postButton = findButtonElementByText('Post');
                postButton.click();
                await delay(1000);
                window.close();
            } else if (currentURL.startsWith('https://x.com/intent/follow') ||
                    currentURL.startsWith('https://x.com/intent/like') ||
                    currentURL.startsWith('https://x.com/intent/retweet')) {
                console.log("推特自动化插件处理关注/点赞/转推");
                await delay(5000);
                const followButton = document.querySelectorAll('button[data-testid="confirmationSheetConfirm"]');
                followButton[0].click();
                await delay(1000);
                window.close();
            } else if (currentURL.startsWith('https://x.com/i/flow/login') ||
                    currentURL.startsWith('https://twitter.com/i/flow/login')) {
                console.log("推特自动化插件处理推特Token登录");
                fetch('http://127.0.0.1:10086/getTwitter?auth=123321ASD')
                    .then(response => {
                        if (response.ok) {
                            console.log("推特自动化插件处理从ctrlPad中读取Token成功");
                            const respData = response.json();
                            const twitterToken = respData.data.token;

                            if (currentURL.startsWith('https://x.com')) {
                                setCookie('auth_token',twitterToken,7,'.x.com');
                            } else {
                                setCookie('auth_token',twitterToken,7,'.twitter.com');
                            }
                            console.log("推特自动化插件处理刷新页面");
                            window.location.reload();
                        }
                    })
            }
            console.log("推特自动化插件结束");
        }
    });
})();
