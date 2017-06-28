# Ruff 在线测试

## Quick Start

```sh

> git clone git@github.com:lwdgit/ruff-online-editor.git
> cd ruff-online-editor
> rap deploy -s
> open http://192.168.78.1:8080

```

> 你也可以直接将 https://raw.githubusercontent.com/lwdgit/ruff-online-editor/master/src/index.js 下载到你的工程目录直接测试。
 
> 注意: 测试代码不需要再放在 `$.ready`和`$.end`里面了，直接编写目标代码即可。
> 目前版本用了很多新语法，请使用最新浏览器打开，建议浏览器 > Chrome 58

## TODO

  - [x] 改用ace做为代码编辑器
  - [x] 完善输出
  - [ ] 模块化导出