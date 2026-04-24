var skeleton = '<div class="el-loading">' + Array(6).fill(0).map((_, i) => `<div class="el-skeleton${i === 2 || i === 5 ? ' width-50' : ''} mb-3"></div>`).join('') + '</div>';

//滚动动画
function animation() {
	var animate = document.getElementsByClassName("animate__animated");
	Array.prototype.slice.call(animate,0).forEach(function(i,index){
		const top = i.getBoundingClientRect().top; // 目标元素dom距离顶部的高度
		if (top <= window.innerHeight) { // 当top小于等于文档显示区域的高时，就进入可视区域了
			i.classList.contains('animate__fadeIn"') ? '' : i.classList.add("animate__fadeIn")
		}
	})
}
animation()
window.addEventListener('scroll', animation);

document.addEventListener("DOMContentLoaded", () => {
	//图片灯箱
	window.ViewImage && ViewImage.init('img.lozad,.post-content img:not(.cf-avatar)');
	//相对时间
	window.Lately && Lately.init({ target: '.date'});
	//延迟加载
	var observer = lozad('.lozad');
	observer.observe();
	//toc
	let mainNavLinks = document.querySelectorAll(".post-toc a");
	window.addEventListener("scroll", event => {
		let fromTop = window.scrollY;
		mainNavLinks.forEach((link, index) => {
			let section = document.getElementById(decodeURI(link.hash).substring(1));
			let nextSection = null
			if (mainNavLinks[index + 1]) {
				nextSection = document.getElementById(decodeURI(mainNavLinks[index + 1].hash).substring(1));
			}
			if (section.offsetTop <= fromTop) {
				if (nextSection) {
					if (nextSection.offsetTop > fromTop) {
						link.classList.add("current");
					} else {
						link.classList.remove("current");
					}
				} else {
					link.classList.add("current");
				}
			} else {
				link.classList.remove("current");
			}
		});
	});
	//切换主题
	var headerIcon = document.querySelector('.header-toggle i')
	var sidebarIcon = document.querySelector('.sidebar-toggle i')
	var getTheme = window.localStorage && window.localStorage.getItem("theme");
	var isDark = getTheme === "dark";
	var isLight = getTheme === "light";
	if (getTheme !== null) {
		document.body.classList.toggle("dark-theme",isDark);
		headerIcon.classList.toggle("iconnight-mode",isDark);
		sidebarIcon.classList.toggle("iconnight-mode",isDark);
		headerIcon.classList.toggle("icondaytime-mode",isLight);
		sidebarIcon.classList.toggle("icondaytime-mode",isLight);
	}
	Array.prototype.forEach.call(document.querySelectorAll('.theme-toggle'), function(el){
    el.addEventListener('click', function() {
			document.body.classList.toggle("dark-theme"); 
			headerIcon.className = headerIcon.classList.contains("iconnight-mode") ? "iconfont icondaytime-mode" : "iconfont iconnight-mode"
			sidebarIcon.className = sidebarIcon.classList.contains("iconnight-mode") ? "iconfont icondaytime-mode" : "iconfont iconnight-mode"
			window.localStorage && window.localStorage.setItem("theme", document.body.classList.contains("dark-theme") ? "dark" : "light");
		});
	});
	//切换目录
	var menuToggle=document.querySelector('.menu-trigger'); 
	menuToggle.addEventListener('click',function() {
		toggleMenu()
	})
	function toggleMenu() { 
		var menu = document.getElementById('sidebar-menus');
		var mask = document.getElementById('mask');
		menu.classList.toggle("open");
		mask.classList.toggle("d-flex");
	}
	// 解除
	document.addEventListener('click', function(e) {
		var e = e || window.event; //浏览器兼容性 
		var elem = e.target || e.srcElement;
		while (elem) { //循环判断至跟节点，防止点击的是div子元素 
			if (elem.id && elem.id == 'header') {
				return;
			}
			elem = elem.parentNode;
		}
		var sidebarMenus = document.getElementById('sidebar-menus');
		var mask = document.getElementById('mask');
		sidebarMenus.classList.remove('open');
		if(mask.classList.contains('d-flex')) {
			mask.classList.remove('d-flex');
		}
	});
	// 回到顶部
	var BackTop = document.querySelector(".backtop")
	document.onscroll = function() {
		var iRollingLength = document.documentElement.scrollTop
		if(iRollingLength !== 0){
			BackTop.classList.add("d-md-flex")
		}else{
			BackTop.classList.remove("d-md-flex")
		}
	}
	BackTop.onclick=function(){
		document.body.scrollIntoView({behavior: 'smooth'})
	};
	//滚动动画
	
	//下拉菜单
	let dropdowns = document.querySelectorAll(".dropdown");
	Array.from(dropdowns).forEach(function(dropdown) {
		let lis = Array.from(dropdown.children).slice(1);
		dropdown.addEventListener("mouseenter", function() {
			lis.forEach(function(item) {
				item.classList.remove("d-none");
			});
		});
		dropdown.addEventListener("mouseleave", function() {
			lis.forEach(function(item) {
				item.classList.add("d-none");
			});
		});
	});
	// 获取评论数
	var checkComments = setInterval(function () { // 获取评论数元素 
		var commentsCount = document.querySelector(".tk-comments-count"); // 如果存在评论数元素，就获取它的文本内容 
		var countDom = document.getElementById("twikoo_count");
		if (commentsCount && countDom) {
			var countCont = commentsCount.textContent; // 把评论数显示在另一个元素上 
			var counts = countCont.match(/\d+/g);
			countDom.textContent = counts; // 清除定时器 
			clearInterval(checkComments);
		}
	}, 1000);
	// 滚动到#
	if (window.location.hash) { // 创建另一个定时器，每隔 0.1 秒检查元素是否存在 
		var checkExist = setInterval(function () { // 获取哈希值对应的元素 
			var hashElement = document.querySelector(window.location.hash); // 如果存在这个元素，就滚动到它的位置
			if (hashElement) {
				window.scrollTo({
					top: hashElement.offsetTop - 90,
					behavior: "smooth"
				}); // 清除定时器 
				clearInterval(checkExist); 
			}
		}, 100);
	};
  // 固定TOC
	var nav = document.querySelector(".post-toc");
	if (nav) {
		nav.classList.remove("hide");
		var navTop = nav.offsetTop;
		var w = document.querySelector(".post-sidebar").offsetWidth;
		window.addEventListener("scroll", function () {
			var scrolls = window.pageYOffset;
			if (scrolls > navTop) {
				nav.style.top = "24px";
				nav.style.width = w + "px";
				nav.style.position = "fixed";
			} else {
				nav.style.top = "0px";
				nav.style.position = "relative";
			}
		});
	}
});