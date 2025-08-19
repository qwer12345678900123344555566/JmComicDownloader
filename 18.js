// ==UserScript==
// @name         18comic 图片链接下载器(多线程+话数选择)
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  自动抓取18comic漫画图片链接并保存TXT，支持多线程和话数选择，保留原面板和取消逻辑
// @author       Ymz
// @match        https://18comic.vip/album/*
// @grant        GM_setClipboard
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    let cancelled = false;

    // 悬浮按钮
    const btn = document.createElement('div');
    btn.innerHTML = '⬇️';
    Object.assign(btn.style, {
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        width: '50px',
        height: '50px',
        background: 'linear-gradient(135deg,#ff5722,#ff9800)',
        color: '#fff',
        fontSize: '24px',
        textAlign: 'center',
        lineHeight: '50px',
        borderRadius: '50%',
        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
        zIndex: 999999,
        userSelect: 'none',
        cursor: 'pointer'
    });
    document.body.appendChild(btn);

    // 面板
    const panel = document.createElement('div');
    panel.id = 'jmDownloadPanel';
    Object.assign(panel.style, {
        position: 'fixed',
        bottom: '80px',
        left: '20px',
        width: '350px',
        background: '#fff',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
        zIndex: 999999,
        padding: '15px',
        maxHeight: '70vh',
        overflowY: 'auto'
    });
    panel.innerHTML = `
        <h3 style="margin-top:0;color:#ff5722;">18comic图片链接抓取</h3>
        <div>线程数: <input type="number" id="jmThreads" value="5" style="width:50px"></div>
        <div>下载话数（例如1-3,5,7）: <input type="text" id="jmEpisodes" style="width:150px" placeholder="留空默认全部"></div>
        <div id="jmStatus" style="margin-top:10px;color:#333;">准备就绪</div>
        <div id="jmProgress" style="margin-top:10px;"></div>
        <button id="jmCancelBtn" style="margin-top:15px;background:#f44336;color:#fff;border:none;padding:5px 10px;border-radius:4px;">取消下载</button>
    `;
    document.body.appendChild(panel);



function getEpisodeLinks() {
    const links = [];
    const seen = new Set();
    const episodeElements = document.querySelectorAll('.episode a[href^="/photo/"]');

    // 如果找不到章节列表元素（.episode a[href^="/photo/"]），则假设只有一章，且链接为 photo/{albumId}
    if (episodeElements.length === 0) {
        const pathParts = window.location.pathname.split('/');
        const albumId = pathParts[pathParts.indexOf('album') + 1]; // 提取 'album' 后面的部分（如 1207092）
        const singleEpisodeUrl = `https://18comic.vip/photo/${albumId}`; // 构建单章链接（photo/1207092）
        const title = '第1话'; // 假设的章节标题
        links.push({ url: singleEpisodeUrl, title: title, id: albumId });
    } else {
        // 如果找到了章节列表元素，则按原逻辑处理
        episodeElements.forEach(a => {
            const href = a.getAttribute('href');
            if (seen.has(href)) return;
            seen.add(href);
            const title = a.querySelector('.h2_series')?.textContent.trim() || '未知话数';
            links.push({ url: 'https://18comic.vip' + href, title: title.replace(/\s+/g, ' '), id: href.split('/')[2] });
        });
    }

    return links;
}




    async function fetchHtml(url) {
        const resp = await fetch(url);
        return resp.text();
    }

    function getImageUrls(html) {
        const scriptMatch = html.match(/var page_arr = (\[.*?\])/);
        if (!scriptMatch) return [];
        try {
            const pageArr = JSON.parse(scriptMatch[1]);
            const aidMatch = html.match(/var aid = (\d+)/);
            const aid = aidMatch ? aidMatch[1] : null;
            if (!aid) return [];
            return pageArr.map(page => `https://cdn-msp.jm18c-sha.org/media/photos/${aid}/${page}`);
        } catch (e) {
            console.error('解析失败', e);
            return [];
        }
    }

    function updateStatus(msg, isError = false) {
        const el = document.getElementById('jmStatus');
        el.textContent = msg;
        el.style.color = isError ? '#f44336' : '#333';
    }

    function updateProgress(current, total) {
        const el = document.getElementById('jmProgress');
        const percent = Math.round((current/total)*100);
        el.innerHTML = `<div style="width:100%;height:20px;background:#eee;border-radius:10px;">
                            <div style="width:${percent}%;height:100%;background:#4caf50;border-radius:10px;"></div>
                        </div>
                        <div style="text-align:center;margin-top:5px;">${percent}% (${current}/${total})</div>`;
    }

    async function startDownload() {
        cancelled = false;
        const threads = parseInt(document.getElementById('jmThreads').value) || 5;
        let episodes = getEpisodeLinks();
        if (episodes.length === 0) {
            updateStatus('未找到任何话数', true);
            return;
        }

        // 选择话数
        const epInput = document.getElementById('jmEpisodes').value.trim();
        if (epInput) {
            const selected = new Set();
            for (let part of epInput.split(',')) {
                if (part.includes('-')) {
                    let [start,end] = part.split('-').map(n=>parseInt(n)-1);
                    for(let i=start;i<=end;i++) selected.add(i);
                } else {
                    selected.add(parseInt(part)-1);
                }
            }
            episodes = episodes.filter((_, idx)=>selected.has(idx));
        }

        updateStatus(`准备抓取 ${episodes.length} 话图片链接...`);
        let output = '';
        let index = 0;

        async function worker() {
            while(index < episodes.length && !cancelled){
                const current = index++;
                const ep = episodes[current];
                updateStatus(`抓取: ${ep.title} (${current+1}/${episodes.length})`);
                updateProgress(current+1, episodes.length);
                try {
                    const html = await fetchHtml(ep.url);
                    const urls = getImageUrls(html);
                    output += `### ${ep.title}\n` + urls.join('\n') + '\n\n';
                } catch(e){
                    console.error(ep.title,e);
                }
            }
        }

        const workers = [];
        for(let i=0;i<threads;i++) workers.push(worker());
        await Promise.all(workers);

        if(cancelled){
            const savePartial = confirm("已取消下载，是否保存已抓取的部分到TXT？");
            if(!savePartial) return;
        }

        const blob = new Blob([output], {type:'text/plain;charset=utf-8'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `图片链接.txt`;
        a.click();
        URL.revokeObjectURL(a.href);

        updateStatus('图片链接抓取完成！');
    }

    btn.addEventListener('click', startDownload);
    document.getElementById('jmCancelBtn').addEventListener('click', ()=>{
        cancelled = true;
        updateStatus('已取消抓取', true);
    });

})();