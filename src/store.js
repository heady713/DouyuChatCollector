/*
 * C:\Users\%USERNAME%\AppData\Local\Google\Chrome\User Data\Default\databases\
 * 本地存储SQLite
 */

var webStorage = {};
webStorage.webSql = function () {

	var _this = this;

	//数据库
	var _dataBase;

	//打开数据库连接或者创建数据库
	this.openDatabase = function () {
		if (!!_dataBase) {
			return _dataBase;
		}
		_dataBase = openDatabase("chat", "1.0", "弹幕数据", 50 * 1024 * 1024);
		return _dataBase;
	}

	//创建表
	this.createAllTables = function () {
		var dataBase = _this.openDatabase();
		// 弹幕数据表
		dataBase.transaction(function (tx) {
			tx.executeSql(
				"create table if not exists chat_list ( \
					zb_id integer, \
					chat_time timestamp DEFAULT current_timestamp, \
					chat_id varchar2(64), \
					rel varchar2(32), \
					name varchar2(80), \
					content text \
				)",
				[],
				function () {
					// console.log("chat_list表创建成功");
				},
				function (tx, error) {
					console.log('chat_list表创建失败:' + error.message);
				}
			);
		});
		// 主播表
		dataBase.transaction(function (tx) {
			tx.executeSql(
				"create table if not exists zhubo ( \
					zb_id integer primary key autoincrement, \
					zb_name varchar2(64), \
					zb_type varchar2(64) \
				)",
				[],
				function () {
					// console.log("zhubo表创建成功");
				},
				function (tx, error) {
					console.log('zhubo表创建失败:' + error.message);
				}
			);
		});
		// 主播分时段在线人数表
		dataBase.transaction(function (tx) {
			tx.executeSql(
				"create table if not exists online_num ( \
					zb_id integer, \
					zb_time timestamp DEFAULT current_timestamp, \
					num integer \
				)",
				[],
				function () {
					// console.log("online_num表创建成功");
				},
				function (tx, error) {
					console.log('online_num表创建失败:' + error.message);
				}
			);
		});
	}

	//插入在线人数数据
	this.insertOnlineNumber = function (zb_id, ol_num) {
		var dataBase = _this.openDatabase();
		dataBase.transaction(function (tx) {
			tx.executeSql(
				"insert into online_num (zb_id, num) values(?, ?)",
				[zb_id, ol_num],
				function () {
					// console.log('插入数据成功');
				},
				function (tx, error) {
					console.log('插入数据失败: ' + error.message);
				}
			);
		});
	}

	//插入弹幕数据
	this.insertChat = function (zb_id, chat_list) {
		var dataBase = _this.openDatabase();

		var divide = 150;
		var times = Math.floor((chat_list.length-1)/divide) + 1;//防止参数过多 分次数写入弹幕
		for (var t = 0; t < times; ++t) {
			var chats = chat_list.slice(t*divide, (t+1)*divide);
			var data = [];
			var value_sql = "";
			for (var i = 0; i < chats.length; ++i) {
				data.push(zb_id);
				data.push(chats[i].viewer_chatid);
				data.push(chats[i].viewer_rel);
				data.push(chats[i].viewer_name);
				data.push(chats[i].viewer_content);
				value_sql += "(?, ?, ?, ?, ?)";
				if (i != chats.length - 1)
					value_sql += ",";
			}

			dataBase.transaction(function (tx) {
				tx.executeSql(
					"insert into chat_list (zb_id, chat_id, rel, name, content) values " + value_sql,
					data,
					function () {
						// console.log('插入数据成功');
					},
					function (tx, error) {
						console.log('插入数据失败: ' + error.message);
					}
				);
			});
		}
	}

	//解析json数据并插入
	this.insert = function (data) {
		var zb_name = data.zb_name;
		var zb_type = data.zb_type;
		var ol_num = data.ol_num;
		var chat_list = data.chat_list;

		var dataBase = _this.openDatabase();

		//保存数据
		dataBase.transaction(function (tx) {
			tx.executeSql(
				"select zb_id from zhubo where zb_name = ?",
				[zb_name],
				function (tx, result) {
					if (result.rows.length == 1) {
						var zb_id = result.rows.item(0)['zb_id'];
						_this.insertOnlineNumber(zb_id, ol_num);
						_this.insertChat(zb_id, chat_list);
					} else if (result.rows.length == 0) {
						tx.executeSql(
							"insert into zhubo (zb_name, zb_type) values(?, ?)",
							[zb_name, zb_type],
							function () {//插入完成后查询主播ID  再写入
								tx.executeSql(
									"select zb_id from zhubo where zb_name = ?",
									[zb_name],
									function (tx, result) {
										if (result.rows.length == 1) {
											var zb_id = result.rows.item(0)['zb_id'];
											_this.insertOnlineNumber(zb_id, ol_num);
											_this.insertChat(zb_id, chat_list);
										}
									},
									function (tx, error) {
										console.log('查询数据失败: ' + error.message);
									}
								);
							},
							function (tx, error) {
								console.log('查询数据失败: ' + error.message);
							}
						);
					}
				},
				function (tx, error) {
					console.log('查询数据失败: ' + error.message);
				}
			);			
		});
	}
}