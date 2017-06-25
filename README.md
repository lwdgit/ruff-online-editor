# Ruff 在线测试

## Quick Start

```sh

> git clone git@github.com:lwdgit/ruff-online-editor.git
> cd ruff-online-editor
> rap deploy -s
> open http://192.168.78.1:8081/eval?script=%24(%27%23led-r%27).turnOn()

```

> 你也可以直接将 https://raw.githubusercontent.com/lwdgit/ruff-online-editor/master/src/index.js 下载到你的工程目录直接测试。
 
> 注意: 测试代码不需要再放在 `$.ready`和`$.end`里面了，直接编写目标代码即可。

## TODO

  - [ ] 改用ace做为代码编辑器
  - [ ] 完善输出