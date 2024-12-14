// ==UserScript==
// @name         Galxe自动化任务
// @namespace    http://tampermonkey.net/
// @version      2024-09-04
// @description  Galxe自动化任务
// @author       You
// @match        https://app.galxe.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=galxe.com
// @grant        none
// @tag          Galxe
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

function findButtonElementByIncludeText(text) {
    let tweetButtonList = document.querySelectorAll('button');
    for (let tweetButtonIndex of tweetButtonList) {
        let tweetButtonText = tweetButtonIndex.innerText;
        if (tweetButtonText.indexOf(text) >= 0) {
            return tweetButtonIndex;
        }
    }
    return null;
}

function checkClaim() {
    console.log('Galxe自动化任务交互脚本领取结果');
    let claimButton = findButtonElementByIncludeText('Claim');
    if (claimButton) {
        console.log('Galxe自动化任务交互脚本领取结果中');
        claimButton.click();
    }
    console.log('Galxe自动化任务交互脚本结束');
}

async function checkAllTaskState() {
    let currentURL = window.location.href;

    if (currentURL.startsWith('https://app.galxe.com/quest/')) {
        console.log('Galxe自动化任务检查所有结果中');
        let taskButtonList = document.querySelectorAll('div[type="button"]');

        for (let taskButtonIndex of taskButtonList) {
            //  任务完成后自动点击刷新状态
            console.log(taskButtonIndex.querySelectorAll('button'));
            try {
                let subButtonList = taskButtonIndex.querySelectorAll('button');
                let refreshTaskState = subButtonList[subButtonList.length - 1];
                refreshTaskState.click();
                await delay(500);
            } catch(e) {}
        }
    }
}

async function mainLogic() {
    console.log("Galxe自动化插件加载");

    let currentURL = window.location.href;

    if (currentURL == 'https://app.galxe.com/accountSetting/social') {
        let connectButton = document.querySelectorAll('button.text-text-linkBase');

        console.log('Galxe自动化社交设置脚本启动');

        for (let connectButtonIndex of connectButton) {
            let connectButtonText = connectButtonIndex.innerText;
            //console.log('Galxe自动化社交设置脚本 == 发现按钮',connectButtonText);
            if (connectButtonText.indexOf('Connect Twitter') >= 0) {
                console.log('Galxe自动化社交设置脚本 == 连接推特准备');

                setTimeout(() => {
                    connectButtonIndex.click();
                }, 2000);
                break;
            } else if (connectButtonText.indexOf('Connect Discord') >= 0) {
                console.log('Galxe自动化社交设置脚本 == 连接DC准备');

                setTimeout(() => {
                    connectButtonIndex.click();
                }, 2000);
                break;
            }
        }

        console.log('Galxe自动化社交设置脚本结束');
    } else if (currentURL == 'https://app.galxe.com/TwitterConnect') {
        let tweetButtonList = document.querySelectorAll('button.text-foreground');

        console.log('Galxe自动化社交设置推特脚本启动');

        for (let tweetButtonIndex of tweetButtonList) {
            let tweetButtonText = tweetButtonIndex.innerText;
            //console.log('Galxe自动化社交设置推特脚本 == 发现按钮',tweetButtonText);
            if (tweetButtonText.indexOf('Tweet') >= 0) {
                console.log('Galxe自动化社交设置推特脚本 == 点击准备');

                setTimeout(() => {
                    tweetButtonIndex.click();
                }, 2000);

                await delay(3000);
                let retweetURL = await window.getFirstTweet();

                if (retweetURL !== null) {
                    console.log('Galxe自动化社交设置推特脚本 == 推特URL',retweetURL);
                    let inputList = document.querySelectorAll('input');
                    inputList[0].value = retweetURL;
                    var event = new Event('input', { bubbles: true });
                    inputList[0].dispatchEvent(event);
                    await delay(500);

                    let buttonList = document.querySelectorAll('button');
                    for (let buttonIndex of buttonList) {
                        let buttonText = buttonIndex.innerText;
                        if (buttonText.startsWith('Verify')) {
                            buttonIndex.click();
                            break;
                        }
                    }
                } else {
                    console.log('Galxe自动化社交设置推特脚本 == 找不到发布推特URL');
                }
            }
        }

        console.log('Galxe自动化社交设置推特脚本结束');
    } else if (currentURL.startsWith('https://app.galxe.com/quest/')) {
        //  一直判断是否可以Claim
        setInterval(() => {
            checkClaim();
        }, 2000);

        await delay(5000);

        console.log('Galxe自动化任务交互脚本启动');
        let taskButtonList = document.querySelectorAll('div[type="button"]');

        for (let taskButtonIndex of taskButtonList) {
            let taskButtonText = taskButtonIndex.innerText.toLowerCase();
            //  任务已完成就退出
            if (taskButtonIndex.querySelectorAll('div.text-success').length > 0) {
                console.log('Galxe自动化任务交互脚本(已完成) == ',taskButtonText);
                continue;
            }
            //  推特系列任务
            if (taskButtonText.indexOf('twitter') >= 0 || taskButtonText.indexOf('tweet') >= 0) {
                console.log('Galxe自动化任务交互脚本(开始) == 推特交互',taskButtonText);
                //  2024/9/4
                taskButtonIndex.click();
                await delay(1000);

            }
            //  DC系列任务
            if (taskButtonText.indexOf('discord') >= 0) {
                console.log('Galxe自动化任务交互脚本(开始) == DC交互',taskButtonText);
                taskButtonIndex.click();
                await delay(1000);
                //  有概率是假验证,反正先点一遍
                window.focus();
            }
            //  查看官网
            else if (taskButtonText.indexOf('visit') >= 0) {
                console.log('Galxe自动化任务交互脚本(开始) == 查看官网',taskButtonText);
                taskButtonIndex.click();
                await delay(500);
                //  银河弹窗二次确认
                let continueButtonList = document.querySelectorAll('div.cursor-pointer.text-black');
                continueButtonList[0].click();
            }
            //  查看视频
            else if (taskButtonText.indexOf('watch') >= 0) {
                console.log('Galxe自动化任务交互脚本(开始) == 查看视频',taskButtonText);
                taskButtonIndex.click();
                await delay(3000);
                let closeButton = findButtonElementByText('Close');
                closeButton.close();
            }
            //  关注银河频道
            else if (taskButtonText.indexOf('space user') >= 0) {
                console.log('Galxe自动化任务交互脚本(开始) == 关注银河频道',taskButtonText);
                let currentURL = window.location.href;
                let projectRootURL = currentURL.substring(0,currentURL.lastIndexOf("/"));
                let popup = window.open(
                    projectRootURL,
                    "_blank"
                );
            }
        }
        console.log('Galxe自动化任务交互脚本关注频道启动');
        let followButton = findButtonElementByIncludeText('Follow');
        if (followButton) {  //  只有出现的项目主页里面
            console.log('Galxe自动化任务交互脚本关注频道中');
            followButton.click();
            await delay(3000);
            window.close();
        } else {  //  出现在任务页里面
            await checkAllTaskState();
        }
    }
}


(function() {
    'use strict';

    let timerID = setInterval(async () => {
        let userLink = document.querySelector('button>a').href;

        if (userLink) {
            if (userLink.startsWith('https://app.galxe.com/id/') || userLink.startsWith('https://app.galxe.com/quest/')) {   //  2024/12/14
                let lastPath = userLink.split('/');
                if (lastPath[lastPath.length - 1] !== "undefined") {  //  2024/9/9  当账号加载完成之后,链接URL就会更新
                    mainLogic();
                    clearInterval(timerID);
                }
            }
        }
    }, 1000);
    
    //  window.addEventListener('load',mainLogic);  
    //    ^ 2024/9/9  旧版启动代码,但是银河是Load之后异步加载的,高配置机器执行没有问题
    //       但是低配置云主机有问题,未成功加载用户信息就去点任务会弹出连接钱包,实际上已经
    //       连接上了.所以需要判断加载完成账号才可以操作
})();
