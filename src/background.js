var webSql = new webStorage.webSql();
webSql.openDatabase();
webSql.createAllTables();


var collect_tabs = [];
var alarm_started = false;
var alarm_name = "scheduleAlarm";

//启动定时器
var StartAlarm = function () {
	if (alarm_started)
		return;
	alarm_started = true;
	//3秒后开始启动定时器
	chrome.alarms.create(alarm_name, {
		when : Date.now() + 3000,
		periodInMinutes : 1
	})
	// console.log("开启定时器");
}

//关闭定时器
var StopAlarm = function() {
	if (!alarm_started)
		return;
	chrome.alarms.clear(alarm_name);
	alarm_started = false;
	// console.log("关闭定时器");
};

//后台向页面发送请求 获取弹幕数据
var getChat = function (tab_id) {
	chrome.tabs.sendMessage(tab_id, { _type : "chat" }, function(data) {
		//内容页面获取到数据之后回调，将数据保存到数据库
		webSql.insert(data);
	});
};

//删除当前tab的收集
var removeTab = function (tab_id) {
	if (collect_tabs.indexOf(tab_id) === -1)
		return;
	collect_tabs.splice(collect_tabs.indexOf(tab_id), 1);
}

//是否还有tab在收集
var hasTabJob = function () {
	return (collect_tabs.length === 0) ? false : true;
}

//点击pageAction按钮  开启或关闭收集
chrome.pageAction.onClicked.addListener(function(tab) {

	if (collect_tabs.indexOf(tab.id) === -1) {
		collect_tabs.push(tab.id);//记录当前tab
		chrome.pageAction.setTitle({
			tabId : tab.id,
			title : "点击关闭收集弹幕"
		});
		chrome.pageAction.setIcon({
			tabId : tab.id,
			path : "icon@16c.png"
		});
		StartAlarm();
	} else {
		collect_tabs.splice(collect_tabs.indexOf(tab.id), 1);//删除当前tab
		chrome.pageAction.setTitle({
			tabId : tab.id,
			title : "点击开始收集弹幕"
		});
		chrome.pageAction.setIcon({
			tabId : tab.id,
			path : "icon@16.png"
		});
		if (!hasTabJob())
			StopAlarm();
	}
});

//tab页面加载完成
chrome.tabs.onUpdated.addListener(function(tab_id, change, tab) {
	if (change.status == "complete") {
		//询问内容页面 是否为主播页面 来显示或隐藏pageAction按钮
		chrome.tabs.sendMessage(tab_id, { _type: "zhubo" }, function (isZhuboPage) {
			if (isZhuboPage)
				chrome.pageAction.show(tab_id);
			else
				chrome.pageAction.hide(tab_id);
		});
	}
});

//关闭标签时 取消收集当前标签页的弹幕
chrome.tabs.onRemoved.addListener(function(tab_id, info) {
	removeTab(tab_id);
});


//处理定时器消息
chrome.alarms.onAlarm.addListener(function(alarm) {
	console.log("每分钟回调收集弹幕")
	for (var i = 0; i < collect_tabs.length; ++i) {
		getChat(collect_tabs[i]);
	};
});