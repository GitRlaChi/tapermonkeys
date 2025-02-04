// ==UserScript==
// @name         치지직-트위치 채팅연동
// @namespace    http://nokduro.com/
// @version      2023-12-29-02
// @description  트위치 채팅을 치지직에서도!
// @author       귀챠니즘
// @match        https://chzzk.naver.com/live/*?twitch=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=naver.com
// @grant        none
// ==/UserScript==

function launchWS(){
    let params = new URLSearchParams(window.location.search);
    let channelId = params.get('twitch');
    let ws = new WebSocket('wss://irc-ws.chat.twitch.tv/');
    ws.addEventListener('open', ()=>{
        console.log('Twitch WS opened to:'+channelId);
        ws.send('CAP REQ :twitch.tv/tags twitch.tv/commands');ws.send('PASS SCHMOOPIIE');ws.send('NICK justinfan'+Math.floor(10000 + Math.random() * 90000));ws.send('JOIN #'+channelId);
    });
    ws.addEventListener('message', (e)=>{
        let message = e.data.trim();
        if(message.startsWith("PING")) ws.send('PONG');
        else if(message.startsWith("PONG")) ws.send('PING');
        else if(!message.startsWith(':tmi.twitch.tv') && message.startsWith("@badge-info=")){
            let a = message.split(';display-name=');
            let b = message.match(/emotes=([^;]+)/);
            let nick = a[1].split(';')[0];
            let usermessage = a[1].split('PRIVMSG #'+channelId+' :')[1];
            let extra = b?b[1]:null
            appendMessage({nick: nick, message: usermessage, extra: extra});
        }
    });
    ws.addEventListener('close', ()=>{
        setTimeout(launchWS, 2e3);
    });
    return ws;
}

const randColor = () => `rgb(${Math.floor(Math.random() * 100) + 100}, ${Math.floor(Math.random() * 50)}, ${Math.floor(Math.random() * 150) + 100})`;

const imageStyle = 'height:24px;margin:-2px 0 -2px 1px; width:24px;';
const wrapperStyle = 'color: #dfe2ea;line-height: 20px;padding: 4px 8px 4px 6px;text-align:left;overflow-wrap:anywhere;word-break:break-all;';
const containerStyle = 'color: #fff;font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", Helvetica, Arial, NanumGothic, 나눔고딕, "Malgun Gothic", "맑은 고딕", Dotum, 굴림, gulim, 새굴림, "noto sans", 돋움, sans-serif;font-size: 14px;text-rendering: auto; color: buttontext; letter-spacing: normal;word-spacing: normal;line-height: normal;text-transform: none;text-indent: 0px;text-shadow: none;text-align: center;cursor: default;';
const usernameContainerStyle = 'line-height: 18px;margin: -2px 0;padding: 2px 4px 2px 2px;position: relative;display: inline-block;line-break: anywhere;font-weight: 500;'

function removeElementsOverLimit(parentElement, query) {
  const childrenToRemove = document.querySelectorAll(query);
  childrenToRemove.forEach(child => {
    if (child.parentElement === parentElement) {
      parentElement.removeChild(child);
    }
  });
}

function appendMessage(messageDict){
    let message = messageDict.message;
    let chatboxdiv = document.querySelector('aside').children[1].children[0];
    let list_item = document.createElement('div');
    let message_container = document.createElement('div');
    let message_wrapper = document.createElement('div');
    let username_container_span = document.createElement('span');
    let username_span = document.createElement('span');
    let message_span = document.createElement('span');
    if(messageDict.extra){
        let a = messageDict.extra.split('/'), b={};
        a.forEach(c=>{
            let [d,e]=c.split(':');
            d=`https://static-cdn.jtvnw.net/emoticons/v2/${d}/default/dark/1.0`;
            e.split(',').forEach(f=>{
                let [g,h]=f.split('-'), i = message.substring(parseInt(g),parseInt(h)+1);
                b[i]||(b[i]=`<img src="${d}" alt="${i}" style="${imageStyle}" />`);
            });
        });
        Object.keys(b).forEach(c=>{
            let d=RegExp(c,"g");
            message = message.replace(d,b[c]);
        });
    }
    message_span.innerHTML = message;
    username_container_span.style.cssText = usernameContainerStyle;
    username_span.innerText = messageDict.nick;
    username_span.style.cssText = `color: ${randColor()}`;
    username_container_span.appendChild(username_span);
    message_wrapper.style.cssText = wrapperStyle;
    message_wrapper.appendChild(username_container_span);message_wrapper.appendChild(message_span);
    message_container.style.cssText = containerStyle;
    message_container.appendChild(message_wrapper);
    list_item.appendChild(message_container);
    list_item.classList.add('twitchChat');
    let lastChild = chatboxdiv.lastElementChild;
    chatboxdiv.insertBefore(list_item, lastChild);
    chatboxdiv.addEventListener('DOMNodeInserted', ()=>{
       if(document.querySelectorAll('.twitchChat').length > 200){
           removeElementsOverLimit(chatboxdiv, '.twitchChat');
       }
    });
}

(async function() {
    'use strict';
    const interval = setInterval(() => {
        if (document.querySelector('aside')){
            clearInterval(interval);
            let params = new URLSearchParams(window.location.search);
            if(params.get('twitch')){
                launchWS()
            }
        }
    }, 100)
})();
