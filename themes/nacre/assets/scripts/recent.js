var neoUrl = recentData.url;
var neoFetchUrl = recentData.fetchUrl;
var neodbList = [
  {neoName:'观影',category:'movie'},
  {neoName:'追剧',category:'tv'},
  {neoName:'阅读',category:'book'},
  {neoName:'音乐',category:'music'}
];

var recentDom = document.querySelector(recentData.dom);
var recentList = document.querySelector(recentData.listdom);

var skeleton = `<div class="el-loading"><div class="el-skeleton mb-3"></div><div class="el-skeleton mb-3"></div><div class="el-skeleton width-50 mb-3"></div><div class="el-skeleton mb-3"></div><div class="el-skeleton mb-3"></div><div class="el-skeleton width-50 mb-3"></div></div>`;
var load = `<div class="load"><button class="load-btn button-load d-none flex-fill mb-3 p-3">加载更多</button></div>`;
recentList.insertAdjacentHTML('afterend', load);
var loadBtn = document.querySelector(".button-load");

var neoData = {},nextNeoData = [],neoListData = [],neoTabData=[];
var page = 1,category='movie';

document.addEventListener("DOMContentLoaded", () => {
  getRecent();
});

function getRecent() {
  getNeoDb();
  loadBtn.addEventListener("click", function () {
    loadBtn.textContent = '加载中';
    if (nextNeoData.length >= 20) {
      page++;
      getNextNeodb(category)
    }else{
      loadBtn.classList.add("d-none");
    }
    updateList(nextNeoData)
  });

  async function getNeoDb() {
    recentList.innerHTML = skeleton;
    await Promise.all(neodbList.map(async (u) => {
      let response = await fetch(`${neoFetchUrl}/api?type=complete&category=${u.category}&page=${page}`);
      let res = await response.json();
      neoListData.push({ name: u.neoName, category: u.category, data: res });
    }));
  
    neoTabData = neoListData.map((item) => {
      let data = item.data[0];
      return {
        name: item.name,
        category: item.category,
        data: data
      };
    });
    recentList.innerHTML = "";
    updateTab(neoTabData);
    updateData(category);
  }

  async function getNextNeodb(c) {
    const response = await fetch(`${neoFetchUrl}/api?type=complete&category=${c}&page=${page}`);
    const resdata = await response.json();
    nextNeoData = resdata;
    if (nextNeoData.length < 1) {
      loadBtn.classList.add("d-none");
      return;
    }
  }

  function updateData(d) {
    neoListData.map(r => {
      if (r.category == d) {
        neoData = r;
      };
    });
    page++;
    if(neoData.data.length == 20){
      loadBtn.classList.remove("d-none");
      getNextNeodb(d);
    }
    updateListTitle(neoData);
    
  }
  this.updateData = updateData;

  // 插入 Tab
  function updateTab(data){
    let result = "",resultAll = "";
    for (var i = 0; i < data.length; i++) {
      let name = data[i].name,category = data[i].category,cover = data[i].data.item.cover_image_url;
      result += `<div class="col-6 col-md-3 mb-3"><a class="feature shadow" onclick="getCategoryData('${category}')"><div class="feature-title"><span class="title text-sm weight-600">${name}</span></div><div class="feature-link" style="background-image:url(${cover})"><div class="feature-hover"></div></div></a></div>`;
    }
    let before = '<div class="recent-tab animate__animated"><div class="row mb-3">'
    let after = '</div></div>'
    resultAll = before+result+after
    recentDom.insertAdjacentHTML('afterbegin', resultAll);
  }

  // 插入 title 
  function updateListTitle(data) {
    let title = '',resultAll='';
    let name = data.name,res = data.data;
    title += `<div class="d-flex mb-5 animate__animated"><div class="title-line text-md">${name}</div></div>`;
    let resource = `<div class="resource-wrapper"><div class="images-wrapper images-card images-scale mb-3"></div></div>`;
    resultAll = title + resource
    recentList.insertAdjacentHTML('afterbegin', resultAll);
    updateList(res)
  }

  // 插入 list 
  function updateList(res) {
    let result = "";
    for (var i = 0; i < res.length; i++) {
      let title = res[i].item.display_title;
      let url = recentData.url + res[i].item.url;
      let rating = res[i].item.rating != null ? res[i].item.rating : 0;
      let image = res[i].item.cover_image_url;
      result +=  `<div class="memo-resource card-item width-100 animate__animated"><img class="lozad" src="${recentData.loadUrl}" data-src="${image}" referrerpolicy="no-referrer" alt=""><div class="item-content is-feature pos-a width-100 height-100 p-2"><div class="item-fadein d-flex flex-column"><a class="item-title mb-1 text-sm c-light weight-600" href="${url}" target="_blank">${title}</a><div class="item-rating"><span class="text-xs line-md c-light">评分：${rating}</span></div></div></div></div>`;
    }  
    let resourceDom = document.querySelector(".images-wrapper");
    resourceDom.insertAdjacentHTML('beforeend', result);

    loadBtn.textContent = "加载更多";

    animation();
    //延迟加载
    var observer = lozad('.lozad');
    observer.observe();
  }
}

function getCategoryData(e) {
  page = 1,category = e;
  loadBtn.classList.add("d-none");
  recentList.innerHTML = "";
  this.updateData(category)
}