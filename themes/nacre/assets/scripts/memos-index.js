


var memosDom = document.querySelector(memosData.dom);
var loadMemosBtn = document.querySelector(".tab-memo");
var memosListDom = `<div class="memos-list"></div>`;
var envId = memosTwikoo.envId;

loadMemosBtn.addEventListener("click", function () {
  memosDom.innerHTML = skeleton;
  memosDom.insertAdjacentHTML("afterbegin", memosListDom);
  initMemos();
});

function initMemos() {
  var limit = memosData.limit, memosUrl = memosData.memos, page = 1, dataNum = 0;
  var getUrl = `${memosUrl}/api/v1/memo?creatorId=1&rowStatus=NORMAL`;
  var memosMainDom = document.querySelector(".memos-list");
  var getMemosCache = JSON.parse(localStorage.getItem('nacre-memos-album'));
  
  // 动态插入 loadBtn 后再获取
  var loadBtn = `<div class="load load-memos width-100 justify-content-center"><button class="load-btn load-memos-btn button-load flex-fill d-none mb-3 p-3">加载中</button></div>`;
  memosMainDom.insertAdjacentHTML('afterend', loadBtn);
  var btnLoad = document.querySelector(".load-memos-btn");
  
  getMemosData();

  // 添加加载按钮点击事件
  if (btnLoad) {
    btnLoad.addEventListener("click", function () {
      btnLoad.textContent = "加载中";
      if (page < dataNum) {
        page++;
      }
      getMemosCache = JSON.parse(localStorage.getItem('nacre-memos-list'));
      if(getMemosCache){
        updateTiwkoo(getMemosCache)
      }else{
        cocoMessage.error("出错了，请刷新页面后重试！");
      }
    });
  }

  async function getMemosData() {
    try {
      const response = await fetch(getUrl);
      const res = await response.json();
      if(getMemosCache){
        const updateTime = res[0].updatedTs;
        localUpdateTime = getMemosCache[0].updatedTs;
        if(updateTime != localUpdateTime){
          localStorage.setItem('nacre-memos-list', JSON.stringify(res));
          updateTiwkoo(res)
        }else{
          updateTiwkoo(getMemosCache)
        }
      }else{
        localStorage.setItem('nacre-memos-list', JSON.stringify(res));
        updateTiwkoo(res)
      }

    } catch (err) {
      console.error("网络请求错误：", err.message);
    }
  }

  function flatten(arr) {
    return arr.reduce((plane, toBeFlatten) => (plane.concat(Array.isArray(toBeFlatten) ? flatten(toBeFlatten) : toBeFlatten)), []);
  }

  // 加载评论数量
  function updateTiwkoo(data) {
    var twiID = data.map((item) => memos + "/m/" + item.id);
    twikoo.getCommentsCount({
      envId: envId, // 环境 ID
      urls: twiID,
      includeReply: false // 评论数是否包括回复，默认：false
    }).then(function (res) {
      updateCount(res)
    }).catch(function (err) {
      console.error(err);
    });

    function updateCount(res) {
      var twiCount = res.map((item) => {
        return Object.assign({},{'count':item.count})
      });
      var memosTwikoo = data.map((item,index) => {
        return {...item, ...twiCount[index]};
      });
      updateUmami(memosTwikoo)
    }
  }

  //请求Umami数据
  function updateUmami(res) {
    var umiTime = Date.parse(new Date());
    var umiUrl = `${umami.url}/api/websites/${memosData.umiId}/metrics?startAt=0&endAt=${umiTime}&type=url`;
    fetch(umiUrl,{
      method: 'GET',
      mode: 'cors',
      cache: 'default',
      headers: {
        'Authorization': 'Bearer ' + umami.token,
        'Content-Type': 'application/json'
      }
    })
    .then(res => res.json()).then(umidata => { 
      const skeletonDom = document.querySelector(".el-loading");
      if(skeletonDom){
        skeletonDom.remove();
        if (btnLoad) btnLoad.classList.remove("d-none");
      }
      const umiArr = res.map(item => {
        const memoID = `/m/${item.id}`
        const data = umidata.find(i => memoID == i.x)
        return {
          ...item,
          ...data,
          products: data ? data.products : []
        }
      })
      getArrLength(umiArr)
    });
  }

  function getArrLength(i) {
    var res = flatten(i);
    pagination(res);
    dataNum = Math.ceil(res.length/limit);
    nums = dataNum - 1;
    if (page > nums) {
      btnLoad.classList.add("d-none");
      return
    };
  }

  function pagination(data) {
    str = [];
    var last = page * limit - 1;
    last = last >= data.length ? (data.length - 1) : last;
    for (var i = (page * limit - limit); i <= last; i++) { 
      str.push(data[i])
    }
    updateHtml(str)
  }

  function updateHtml(data) {
    var result = "",resultAll = "";
    const TAG_REG = /#(.+?) /g,
      IMG_REG = /\!\[(.*?)\]\((.*?)\)/g,
      LINK_REG = /\[(.*?)\]\((.*?)\)/g,
      BILIBILI_REG = /<a.*?href="https:\/\/www\.bilibili\.com\/video\/((av[\d]{1,10})|(BV([\w]{10})))\/?".*?>.*<\/a>/g,
      NETEASE_MUSIC_REG = /<a.*?href="https:\/\/music\.163\.com\/.*id=([0-9]+)".*?>.*<\/a>/g,
      GITHUB_REG = /<a.*?href="https:\/\/github\.com\/(.*)".*?>.*?<\/a>/g,
      QQMUSIC_REG = /<a.*?href="https\:\/\/y\.qq\.com\/.*(\/[0-9a-zA-Z]+)(\.html)?".*?>.*?<\/a>/g,
      QQVIDEO_REG = /<a.*?href="https:\/\/v\.qq\.com\/.*\/([a-z|A-Z|0-9]+)\.html".*?>.*<\/a>/g,
      YOUKU_REG = /<a.*?href="https:\/\/v\.youku\.com\/.*\/id_([a-z|A-Z|0-9|==]+)\.html".*?>.*<\/a>/g,
      YOUTUBE_REG = /<a.*?href="https:\/\/www\.youtube\.com\/watch\?v\=([a-z|A-Z|0-9]{11})\".*?>.*<\/a>/g;

      // Marked Options
      marked.setOptions({
        breaks: !0,
        smartypants: !0,
        langPrefix: 'language-'
      });

    for (var i = 0; i < data.length; i++) {
      var memoContName = data[i].creatorName
      var memoContLink = `${memosUrl}/m/${data[i].id}`;
      var memoCount = data[i].count
      if ('y' in data[i]) {
        var memoView = data[i].y
      } else {
        var memoView = 0
      }
      var memoContREG = data[i].content
        .replace(TAG_REG, '')
        .replace(IMG_REG, '')
        .replace(LINK_REG, '<a class="primary" href="$2" target="_blank">$1</a>')
        memoContREG = marked.parse(memoContREG)
        .replace(BILIBILI_REG, '<div class="video-wrapper"><iframe src="//player.bilibili.com/player.html?bvid=$1&as_wide=1&high_quality=1&danmaku=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe></div>')
        .replace(NETEASE_MUSIC_REG, '<meting-js auto="https://music.163.com/#/song?id=$1"></meting-js>')
        .replace(GITHUB_REG, '<i class="iconfont icon-github"></i><a href="https://github.com/$1"target="_blank" rel="noopener noreferrer">$1</a> ')
        .replace(QQMUSIC_REG, '<meting-js auto="https://y.qq.com/n/yqq/song$1.html"></meting-js>')
        .replace(QQVIDEO_REG, '<div class="video-wrapper"><iframe src="//v.qq.com/iframe/player.html?vid=$1" allowFullScreen="true" frameborder="no"></iframe></div>')
        .replace(YOUKU_REG, '<div class="video-wrapper"><iframe src="https://player.youku.com/embed/$1" frameborder=0 "allowfullscreen"></iframe></div>')
        .replace(YOUTUBE_REG, '<div class="video-wrapper"><iframe src="https://www.youtube.com/embed/$1" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen title="YouTube Video"></iframe></div>')
      
      //解析 content 内 md 格式图片
      var loadUrl = memosData.loadUrl;
      var IMG_ARR = data[i].content.match(IMG_REG);
      var IMG_STR = String(IMG_ARR).replace(/[,]/g, '');
      if (IMG_ARR) {
        var memoContIMG = IMG_STR.replace(IMG_REG, `<div class="memo-resource width-100"><img class="lozad" src="${loadUrl}" data-src="$2"></div>`);
        memoContREG += `<div class="resource-wrapper"><div class="images-wrapper my-2">${memoContIMG}</div></div>`;
      }

      //标签
      var tagArr = data[i].content.match(TAG_REG);
      var memoContTag = '';
      if (tagArr) {
        memoContTag = String(tagArr[0]).replace(/[#]/g, '');
      }else{
        memoContTag = '动态';
      };

      //解析内置资源文件
      if (data[i].resourceList && data[i].resourceList.length > 0) {
        var resourceList = data[i].resourceList;
        var imgUrl = '',
          resUrl = '',
          resImgLength = 0;
        for (var j = 0; j < resourceList.length; j++) {
          var restype = resourceList[j].type.slice(0, 5);
          if (restype == 'image') {
            imglink = resourceList[j].externalLink
            imgUrl += `<div class="memo-resource w-100"><img class="lozad" src="${loadUrl}" data-src="${imglink}"/></div>`;
            resImgLength = resImgLength + 1
          }
          if (restype !== 'image') {
            resUrl += `<a target="_blank" rel="noreferrer" href="${memos}/o/r/${resourceList[j].id}/${resourceList[j].filename}">${resourceList[j].filename}</a>`;
          }
        }
        if (imgUrl) {
          memoContREG += `<div class="resource-wrapper"><div class="images-wrapper my-2">${imgUrl}</div></div>`;
        }
        if (resUrl) {
          memoContREG += `<p class="datasource">${resUrl}</p>`
        }
      }
      result += `<div class="d-flex animate__animated mb-3"><div class="card-item flex-fill p-3"><div class="item-header d-flex mb-3"><div class="item-avatar mr-3"></div><div class="item-sub d-flex flex-column"><div class="item-creator"><a href="${memosUrl}" target="_blank">${memoContName}</a></div><div class="item-mate mt-2 text-xs">${new Date(data[i].createdTs * 1000).toLocaleString()}</div></div></div><div class="item-content"><div class="item-inner">${memoContREG}</div><div class="item-footer d-flex mt-2"><div class="item-tag d-flex align-items-center text-xs px-2">${memoContTag}</div><div class="d-flex flex-fill justify-content-end"><div class="item d-flex align-items-center mr-3"><a onclick="loadTwikoo(${data[i].id})" title="回复"><i class="iconfont iconmessage"></i><span class="ml-1">${memoCount}</span></a></div><div class="item d-flex align-items-center"><a href="${memoContLink}" target="_blank" title="查看"><i class="iconfont iconfire"></i><span class="ml-1">${memoView}</span></a></div></div></div><div class="item-comment twikoo-${data[i].id} mt-3 d-none"></div></div></div></div>`;
    } // end for
    resultAll = result
    memosMainDom.insertAdjacentHTML('beforeend', resultAll);

    if(btnLoad){
      btnLoad.textContent = "加载更多"
    }

    animation();

    //图片灯箱
    window.ViewImage && ViewImage.init('.images-wrapper img')
    //相对时间
    window.Lately && Lately.init({
      target: '.item-mate'
    });
    //延迟加载
    var observer = lozad('.lozad');
    observer.observe();
  }
}

// 加载评论内容
function loadTwikoo(memo_id) {
  var twikooDom = document.querySelector(`.twikoo-${memo_id}`);
  var twikooCon = "<div id='twikoo'></div>"
  if (twikooDom.classList.contains('d-none')) {
    document.querySelectorAll('.item-comment').forEach((item) => {item.classList.add('d-none');})
    if(document.getElementById("twikoo")){
      document.getElementById("twikoo").remove()
    }
    twikooDom.insertAdjacentHTML('beforeend', twikooCon);
    twikooDom.classList.remove('d-none');
    twikoo.init({
      envId: envId,
      el: '#twikoo',
      path: memos + "/m/" + memo_id 
    });
  }else{
    twikooDom.classList.add('d-none');
    document.getElementById("twikoo").remove()
  }
}
