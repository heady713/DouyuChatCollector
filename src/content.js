//取弹幕并清空
var getChartList = function () {

	var zb_name = $('i.zb_name').text();
	var zb_type = $('#head_room_tag').html();
	var ol_num = $('span#ol_num').text();

	var chat_list = [];

	//删除弹幕
	var chat_line_list = $('#chat_line_list').children().remove();
	chat_line_list.each(function(index, element) {
		if (!$(this).hasClass('chartli'))
			return;
		var name = $(this).find('a.nick');
		var viewer_name = name.text();
		var viewer_rel  = name.attr('rel');

		var content = $(this).find('span.text_cont');
		var viewer_content = content.text();
		var viewer_chatid = content.attr('chatid');

		chat_list.push({
			"viewer_name" : viewer_name.substr(0, viewer_name.length - 1),
			"viewer_rel" : viewer_rel,
			"viewer_chatid" : viewer_chatid,
			"viewer_content" : viewer_content
		});
	});

	return {
		"zb_name" : zb_name,
		"zb_type" : zb_type,
		"ol_num" : ol_num,
		"chat_list" : chat_list
	}
}

//是否主播页面
var isZhuboPage = function () {
	var list = $('#chat_line_list');
	if (list === null || list.length === 0) {
		return false;
	} else {
		return true;
	}
}

// 获取弹幕并返回
chrome.runtime.onMessage.addListener(function(message, sender, send_response) {
	if (message._type == "chat") {
		send_response(getChartList());
	} else if (message._type == "zhubo") {
		send_response(isZhuboPage());
	}
});