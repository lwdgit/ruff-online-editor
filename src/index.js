'use strict';
var url = require('url')
var querystring = require('querystring')
require('http').createServer(function(request, response) {
    response.writeHead(200, {
        'Content-Type': 'text/html'
    })
    var query = {}
    var uri = url.parse(request.url)
    
    var script = ''
    if (request.method === 'POST') {
        var data = ''
        request.on('data', function(chunk) {
            data += chunk
        })
        request.on('end', function() {
            script = JSON.parse(data || {}).script
            run.call(response, script)
        })
    } else {
        script = querystring.parse(uri.query || '').script
        run.call(response, script)
    }
})
.listen(8080, '0.0.0.0')

function run(script) {
    try {
        end.call(this, eval(script), script || 'console.log("请输入script参数")')
    } catch (e) {
        end.call(this, e.message, script || 'console.log("请输入script参数")')
    }
}

process.on('uncaughtException', function (e) {
    console.log(e);
})

function end(msg, script) {
    this.end(htmlTemplate(msg, script))
}

function htmlTemplate(msg) {
    return "<!DOCTYPE html>\
<html lang=en>\
<head>\
    <meta charset=UTF-8>\
    <meta name=viewport content=\"width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no\">\
    <title>Ruff开发面版</title>\
    <style>\
        button {\
            color: #fff;\
            background-color: #ff4949;\
            border-color: #ff4949;\
            border-radius: 4px;\
            border: none;\
            font-size: 16px;\
            line-height: 24px;\
            outline: none;\
            cursor: pointer;\
        }\
        button:active {\
            background: #e64242;\
            border-color: #e64242;\
        }\
        button:hover {\
            background: #ff6d6d;\
            border-color: #ff6d6d;\
        }\
        textarea#output {\
            height: 100px;\
            overflow: scroll;\
            background-color: #222;\
            color: #defcfc;\
            padding: 6px 12px;\
            font-size: 13px;\
            width: 100%;\
            box-sizing: border-box;\
            outline: none;\
        }\
    </style>\
    <script src=https://cdn.jsdelivr.net/ace/1.2.6/min/ace.js></script>\
</head>\
<body>\
输出信息:<textarea id=output readOnly>{outputInfo}</textarea><br />\
<form id=editor-form method=POST>\
    <div style=\"min-height: 300px;width:100%;position:relative;\"><textarea name=script style=\"width:inherit;min-height: inherit\" placeholder=请输入测试代码></textarea>\
    <div id=editor style=\"top:0;width:inherit;position:absolute\"></div>\
    <div id=highlighter></div></div>\
    <br />\
    <button type=button onclick=run()>执行代码</button>\
    <button type=button onclick=restartAndRun()>重启并执行代码</button>\
    <button type=button onclick=restart()>复位</button>\
</form>\
<script>\
    function request(url='//192.168.78.1/api/call', payload) {\
        return fetch(url, {\
            method: 'POST',\
            headers: {\
                'Content-Type': 'application/json'\
            },\
            body: JSON.stringify(payload)\
        });\
    }\
    if ('localStorage' in window) {\
        var script = document.forms['editor-form'].script;\
        script.value = localStorage.getItem('script') || script.value;\
        window.onunload = window.onbeforeunload = function() {\
            localStorage.setItem('script', script.value);\
        }\
    }\
    function run() {\
        var form = document.forms['editor-form'];\
        var el = form.script;\
        if (window.editor) el.value = editor.getValue();\
        el.value < 2048 && history.replaceState({}, null, location.protocol + '//' + location.host + '?script' + encodeURIComponent(el.value));\
        request('/', {script: el.value});\
    }\
    var sleep = (ms) => {return new Promise(resolve => setTimeout(resolve, ms))};\
    function restart() {\
        return request(undefined, {type: 'app.stop'})\
        .then(() => sleep(4000))\
        .then(function() {\
            return request(undefined, {type: 'app.start'})\
        })\
    }\
    function restartAndRun() {\
        restart()\
        .then(() => sleep(4000))\
        .then(run)\
    }\
    var output = document.getElementById('output');\
    function showLog() {\
        request(undefined, {after:Date.now(),type:'app.getLog'}).then(res => res.json())\
        .then(function({result}) { if(result != null && result.length) output.value += result.map(log => (new Date(log[0])).toLocaleString() + ':\\n' + log[1]).join('');output.scrollTop=output.scrollHeight;})\
        .then(() => sleep(2000)).then(msg => showLog((msg || {}).result))\
    }\
    showLog();\
    function initEditor() {\
        if (!window.ace) return;\
        var editor = window.editor = ace.edit('editor');\
        document.getElementById('editor').style.height = document.forms['editor-form'].script.offsetHeight + 'px';\
        var highlighter = ace.edit('highlighter');\
        editor.session.setOptions({\
            mode: 'ace/mode/javascript',\
            useSoftTabs: true\
        });\
        editor.setTheme('ace/theme/monokai');\
        highlighter.setTheme('ace/theme/monokai');\
        highlighter.getSession().setMode('ace/mode/javascript');\
        highlighter.setReadOnly(true);\
        var initCode;\
        if (localStorage.code) {\
            initCode = localStorage.code;\
        } else {\
            initCode = \`var flag = 0;\n\
setInterval(function() {\n\
    console.log(flag);\n\
    if (flag) {\n\
        $('#led-r').turnOn();\n\
    } else {\n\
        $('#led-r').turnOff();\n\
    }\n\
    flag = !flag;\n\
}, 1000);\`;\
        }\
        editor.setValue(initCode, -1);\
    }\
    initEditor();\
    </script>\
</body>\
</html>".replace('{outputInfo}', msg || '');
}

function exec(command, args, resolve, reject) {
    console.log('command:', command, args)
    if(!command) {
        command = '/ruff/sdk/bin/ruff'
    }
    if (!args) {
        args = ['-v']
    }

    var out = ''
    var du = require('child_process').spawn(command, args)
    du.stdout.on('data', function (data) {
        out += data
    });
    du.stderr.on('data', function (data) {
        out += data
    });
    du.on('exit', function () {
        setTimeout(function() { //ruff和on exit有点问题，增加延时修复
            console.log(out)
            resolve(out)
        }, 500)
    });
    du.on('error', function(e) {
        reject(e)
    })
}
