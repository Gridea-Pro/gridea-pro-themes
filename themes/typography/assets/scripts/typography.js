var stage;
var siteNavShown = true;

function triggerSiteNav() {
    return;
    if (siteNavShown) {
        document.getElementById('site-nav').style.display = 'none';
        siteNavShown = false;
    } else {
        document.getElementById('site-nav').style.display = 'block';
        siteNavShown = true;
    }
}

function updateSidebar() {
    var sideBar = document.getElementById('side-bar');
    var mainContainer = document.getElementById('main-container');
    var stageEl = document.getElementById('stage');
    
    if (window.innerWidth <= 768 || window.innerHeight <= 600) {
        sideBar.style.width = stageEl.offsetWidth + 'px';
        mainContainer.classList.remove('col-sm-9');
    } else {
        var sidebarW = stageEl.offsetWidth - mainContainer.offsetWidth + (window.innerWidth - stageEl.offsetWidth) / 2;
        sideBar.style.width = sidebarW + 'px';
        mainContainer.classList.add('col-sm-9');
    }
}// Firefox 正常，但 Edge 存在兼容性问题

document.addEventListener('DOMContentLoaded', function() {
    stage = document.getElementById('stage');
    
    window.addEventListener('resize', function() {
        updateSidebar();
    });
    
    updateSidebar();
    
    var mainContainer = document.getElementById('main-container');
    var sideBar = document.getElementById('side-bar');
    
    mainContainer.classList.remove('invisible');
    mainContainer.classList.add('fadeInTop');
    
    if (window.innerWidth <= 768) {
        sideBar.classList.remove('invisible');
        sideBar.classList.add('fadeInTop');
    } else {
        sideBar.classList.remove('invisible');
        sideBar.classList.add('fadeInRight');
    }
    
    var siteTitle = document.querySelector('.site-title');
    if (siteTitle) {
        siteTitle.addEventListener('click', function() {
            var firstLink = document.querySelector('.site-title a');
            if (firstLink) {
                firstLink.click();
            }
        });
    }
});
