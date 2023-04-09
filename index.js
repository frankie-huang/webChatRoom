var doing = document.createElement('div');
doing.className = 'item item-left';
doing.innerHTML = `<div class="item item-left"><div class="avatar"><img src="images/chatgpt-icon.png" /></div><div class="bubble bubble-left">正在输入中...</div></div>`;

avatarList = [
    'images/bluecat.webp',
]
// 随机选择头像
const avatarIndex = Math.floor(Math.random() * (avatarList.length));

var messages = []
var waitResponse = false

function send() {
    if (waitResponse) {
        alert('当前消息回复中');
        return;
    }

    let text = document.querySelector('#textarea').value.trim();
    if (!text) {
        alert('请输入内容');
        return;
    }
    let sendDiv = document.createElement('div');
    sendDiv.className = 'item item-right';
    sendDiv.innerHTML = `<div class="bubble bubble-left">${text}</div><div class="avatar"><img src="${avatarList[avatarIndex]}" /></div>`;
    document.querySelector('.content').appendChild(sendDiv);
    document.querySelector('#textarea').value = '';
    document.querySelector('#textarea').focus();

    response(sendDiv, text)
}

function response(sendDiv, content) {
    waitResponse = true
    // 显示正在输入中
    document.querySelector('.content').appendChild(doing);
    //滚动条置底
    let height = document.querySelector('.content').scrollHeight;
    document.querySelector(".content").scrollTop = height;
    $.ajax({
        url: '../api/chatV2',
        xhrFields: {
            withCredentials: true
        },
        type: 'POST',
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        data: JSON.stringify({
            messages: messages.concat({
                role: 'user',
                content
            })
        }),
        success: function (data) {
            // 删除“正在输入中”
            document.querySelector('.content').removeChild(doing);
            // 根据状态码判断是否请求成功
            if (data.code == 0) {
                responseText = data.text
                console.log(responseText)
                if (responseText.indexOf("\n") != -1) {
                    responseText = responseText.slice(responseText.indexOf("\n") + 1)
                }
                let responseDiv = document.createElement('div');
                responseDiv.className = 'item item-left';
                responseDiv.innerHTML = `<div class="item item-left"><div class="avatar"><img src="images/chatgpt-icon.png" /></div><div class="bubble bubble-left">${responseText}</div></div>`;
                document.querySelector('.content').appendChild(responseDiv);
                document.querySelector('#textarea').focus();
                //滚动条置底
                let height = document.querySelector('.content').scrollHeight;
                document.querySelector(".content").scrollTop = height;

                // 消息回复成功，将本次对话加到全文文本中
                messages.push({
                    role: 'user',
                    content
                })
                messages.push({
                    role: 'assistant',
                    content: responseText
                })
                waitResponse = false
            } else {
                retry(sendDiv, content, data.msg);
            }
        },
        error: function (xhr) {
            document.querySelector('.content').removeChild(doing);
            retry(sendDiv, content, "请求失败，HTTP状态码为" + xhr.status);
        }
    })
}

function retry(sendDiv, content, errorMsg) {
    var confirm_retry = confirm("错误信息：" + errorMsg + "。是否重试？");
    if (confirm_retry == false) {
        document.querySelector('.content').removeChild(sendDiv);
        waitResponse = false
        return;
    }
    response(sendDiv, content);
}

// 回车就发送消息
function enter_btn(keyCode) {
    //如果按下的是enter键
    if (keyCode == 13) {
        send();
    }
}
