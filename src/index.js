'use strict';
var url = require('url')
var querystring = require('querystring')

require('http').createServer(function(request, response) {
    response.writeHead(200, {
        'Content-Type': 'text/html'
    })
    var query = {}
    var uri = url.parse(request.url)
    if (uri.pathname === '/exec') {
        if (query = querystring.parse(uri.query)) {
            var command = query.command
            var commandArgs = (query.args || '').split(' ')
            if (command || commandArgs.length) {
                exec(command, commandArgs, function(stdout) {
                    end.call(response, stdout)
                }, function(err) {
                    end.call(response, err)
                })
            }
        }
    } else if (uri.pathname === '/eval') {
        var script = ''
        if (request.method === 'POST') {
            var data = ''
            request.on('data', function(chunk) {
                data += chunk
            })
            request.on('end', function() {
                script = querystring.parse(data || '').script
                run.call(response, script)
            })
        } else {
            script = querystring.parse(uri.query || '').script
            run.call(response, script)
        }
    } else {
        response.end()
    } 
})
.listen(8081, '0.0.0.0')

function run(script) {
    try {
        end.call(this, eval(script), script || 'console.log("请输入script参数")')
    } catch (e) {
        end.call(this, e, script || 'console.log("请输入script参数")')
    }
}

function end(msg, script) {
    msg = '执行输出:<hr /><pre>' + msg + '</pre><br />'
    if (script) {
        msg += '<form method="POST" action="/eval" onsubmit="this.script.value > 2048 ? this.method = \'POST\' : this.method = \'GET\'"><textarea name="script" style="width:100%;min-height: 300px" placeholder="请输入测试代码">' + script + '</textarea><br /><input type="submit"></form><script>if (\'localStorage\' in window) {var script = document.getElementsByName(\'script\')[0]; script.value = localStorage.getItem(\'script\') || script.value; window.onunload=window.onbeforeunload=function() {localStorage.setItem(\'script\', script.value)}}</script>'
    }
    this.end(msg)
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
