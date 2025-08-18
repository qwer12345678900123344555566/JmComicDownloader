# JmComic下载器【安卓移动端】

本项目为移动端下载Jm本子的工具，分为油猴脚本+APP版本和PY版本(PY仅供测试)

> **注意**：使用前请确保科学上网(霍尔格兹环境)

## 功能版本

### 油猴脚本+APP版本【推荐】
- 油猴脚本：在JM官网任何一部漫画首页进行下载图片链接文件
- APP：上传链接文件进行下载

### PY版本(仅供测试)
1. 下载Termux
2. 输入以下2个命令安装依赖：
```bash
pkg update && pkg upgrade -y && pkg install python libjpeg-turbo libpng -y && pip install requests pillow concurrent-logging reportlab
pkg install libwebp
```
3. 手动修改两个PY脚本里的文件路径与实际文件路径对应
4. 运行脚本：
```bash
python 文件实际路径
```

## 免责声明
⚠️ **本项目完全开源免费，仅供娱乐交流，不可用作商业用途**

## 问题反馈
有BUG可进[QQ交流群](https://qun.qq.com/universal-share/share?ac=1&authKey=LhCE9iRduLjygt4%2FeNn1VFOOUDCxFkXav2ja%2FzFtJ8WLMOUHpPStreHqQKRH9S83&busi_data=eyJncm91cENvZGUiOiIxMDQ2NzU1NjgxIiwidG9rZW4iOiJDbjA3NFVPSm0wSUp0cWpoWkZBTzh1NGVMVDRBYXduODBFN3FlVG1LUlZPWkJsZlNpZjFvM1A2KzgwY2VQWGVvIiwidWluIjoiMjkwMTI1NjQzNSJ9&data=KtHaRQiNH8BmFdwgWNzt1Ix_69v_64y3BdDJbs44XSyg-9ZaGP8ENakQN7UV1v4MtZS_ighoPxGU465_qWjxHQ&svctype=4&tempid=h5_group_info)反馈: `1046755681`