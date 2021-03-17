//配置layui扩展模块
layui.config({
	base: getProjectUrl()+'assets/js/module/'
}).extend({
	dialog: 'dialog',
    wangEditor:'wangEditor/wangEditor',
    wangEditorExt:'wangEditorExt/wangEditorExt',
    zTree:'zTree/zTree',
    formSelects:'formSelects/formSelects-v4',
    xmSelect:'xmSelect/xm-select',
    treetable: 'treetable-lay/treetable',
    treeTable:'treeTable/treeTable',
    inputTags:'inputTags/inputTags',
    Validform:'Validform/Validform',
    tableSelect:'tableSelect/tableSelect',
    selectY:'selectY/selectY',
    cropper:'cropper/cropper',
    croppers:'cropper/croppers',
    easyCropper:'easyCropper/easyCropper',
    treeSelect:'treeSelect/treeSelect'
}).use(['layer','dialog'], function () {
      var $ = layui.jquery;
      var layer = layui.layer;
      var dialog=layui.dialog;
      var ctx=getProjectUrl();

    //修改密码
    $('#updatePwd').click(function () {
        page('修改密码',ctx+'sys/user/profile/updatePwd')
    });

	//顶部添加按钮事件
	$('.addBtn').click(function() {
		var title=$(this).attr('data-title');
		var url=ctx+$(this).attr('data-url');
		var w=$(this).attr('w');
		var h=$(this).attr('h');
		page(title, url,typeof (w)=='undefined'?'':w, typeof (h)=='undefined'?'':h);
        return false;
	});
	//顶部表格数据刷新按钮事件
	$('.refreshBtn').click(function() {
		active.reload();
        return false;
	});

    //顶部搜索按钮事件
    $('.searchBtn').click(function() {
        active.reload();
        return false;

    });
	
	//顶部批量删除按钮事件
	$('.delBtn').click(function() {
		var url=ctx+$(this).attr('data-url');
		var checkData=active.getCheckData();
            if(checkData.length==0){
                layer.alert('请选择要删除的数据!', {icon: 3});
            }else{
                layer.confirm('确认要删除吗？',{icon: 3, title:'系统提示'},function(index){
                    var ids=[];
                    for (var i in checkData){
                        ids.push(checkData[i].id);
                    }
                    //alert(ids)
                    $.post(url,{ids:ids.join()},function(data){
                        dialog.msg(data);
                        if (data.resultInfo.type==1) {
                            active.reload();
                        }
                    })
                });
            }
        return false;
	});

    //顶部清空按钮事件
    $('.cleanBtn').click(function() {
        var url=ctx+$(this).attr('data-url');
        layer.confirm('确认要清空所有数据吗？', {icon: 3, title:'系统提示'}, function(index){
            layer.close(index);
            $.post(url,function(data){
                dialog.msg(data);
                if (data.resultInfo.type==1) {
                    active.reload();
                }
            })
        });
        return false;
    });

});

//封装layui表格通用操作方法
var active;
var operInit=function ($,dialog,table) {
    active = {

        getCheckData: function(){ //获取选中数据
            var checkStatus = table.checkStatus('datagrid')
                ,data = checkStatus.data;
            return data;
        }
        ,getCheckLength: function(){ //获取选中数据条数
            var checkStatus = table.checkStatus('datagrid')
                ,data = checkStatus.data;
            return data.length;
        }
        ,isAll: function(){ //验证是否全选
            var checkStatus = table.checkStatus('datagrid');
            return checkStatus.isAll;
        }
        ,getQueryParam:function () {//获取查询条件
            //获取表单数据，并序列化
            var formData = $("#searchForm").serializeArray();
            //将序列化数据转为对象
            var formObject = {};
            for (var item in formData) {
                formObject[formData[item].name] = formData[item].value;
            }
            //console.log(formObject)
            return formObject;
        }
        ,reload: function(){//表格重载
            var param=active.getQueryParam();
            table.reload('datagrid', {
                page: {
                    curr:$(".layui-laypage-skip").children()[0].value  //重新从第 1 页开始
                }
                ,where: param//查询条件
            });
        },
            reloadPage:function () {
            var param=active.getQueryParam();
            table.reload('datagrid', {
                where: param//查询条件
            });
        }
        ,edit:function (title,url,w,h){ //编辑 查看
            page(title, url, typeof (w)=='undefined'?'':w,typeof (h)=='undefined'?'':h);
        }
        ,delete:function(data,url){//删除
            layer.confirm('确认要删除吗？', {icon: 3, title:'系统提示'}, function(index){
                layer.close(index);
                $.post(url,{id:data.id},function(data){
                    dialog.msg(data);
                    if (data.resultInfo.type==1) {
                        active.reload();
                    }
                })
            });
        }
        ,updateStatus:function (obj,url) {//修改状态
            var status = obj.tr.find("input[name='status']").prop('checked') ? 1 : 0;
            $.post(url,{id:obj.data.id,status:status},function(data){
                dialog.msg(data);
                if (data.resultInfo.type==1) {
                    active.reloadPage();
                }
            })
        }

    };

};

//封装表单验证通用方法
var data_load;
var verifyForm=function($,dialog,formId,btnId,options,ajaxUrl){
    _ignoreHidden = typeof (options.ignoreHidden)=="undefined" ? false : options.ignoreHidden;
    _dragonfly = typeof (options.dragonfly)=="undefined" ? false : options.dragonfly;
    _tipSweep = typeof (options.tipSweep)=="undefined" ? true : options.tipSweep;
    _showAllError = typeof (options.showAllError)=="undefined" ? false : options.showAllError;
    _postonce = typeof (options.postonce)=="undefined" ? true : options.postonce;
    _ajaxPost = typeof (options.ajaxPost)=="undefined" ? true : options.ajaxPost;
    _datatype = typeof (options.datatype)=="undefined" ? {} : options.datatype;
    _usePlugin = typeof (options.usePlugin)=="undefined" ? {} : options.usePlugin;
    _beforeCheck = typeof (options.beforeCheck)=="undefined" ? function (curform) {

    } : options.beforeCheck;
    _beforeSubmit = typeof (options.beforeSubmit)=="undefined" ? function (curform) {
        data_load = layer.load(2);
    } : options.beforeSubmit;
    _callback = typeof (options.callback)=="undefined" ? function (data) {
        layer.close(data_load);
        dialog.alert(data,function () {
            parent.layui.$(".refreshBtn").click();//刷新表格数据
            var index = parent.layer.getFrameIndex(window.name);
            parent.layer.close(index);
        });
    } : options.callback;

    //自定义验证规则
    var ajaxForm=$('#'+formId).Validform({
        btnSubmit:"#"+btnId,
        tiptype:function(msg,o,cssctl){
            //msg：提示信息;
            //o:{obj:*,type:*,curform:*},
            //obj指向的是当前验证的表单元素（或表单对象，验证全部验证通过，提交表单时o.obj为该表单对象），
            //type指示提示的状态，值为1、2、3、4， 1：正在检测/提交数据，2：通过验证，3：验证失败，4：提示ignore状态,
            //curform为当前form对象;
            //cssctl:内置的提示信息样式控制函数，该函数需传入两个参数：显示提示信息的对象 和 当前提示的状态（既形参o中的type）;
            if(!o.obj.is("form")){//验证表单元素时o.obj为该表单元素
                if(o.type==3){
                    layer.msg(msg,{icon:0});
                }
            }

        },
        ignoreHidden:_ignoreHidden,//默认为false，当为true时对:hidden的表单元素将不做验证;
        dragonfly:_dragonfly,//默认false，当为true时，值为空时不做验证；
        tipSweep:_tipSweep,//默认为false，为true时提示信息将只会在表单提交时触发显示，各表单元素blur时不会触发信息提示；
        showAllError:_showAllError,//默认为false，true：提交表单时所有错误提示信息都会显示；false：一碰到验证不通过的对象就会停止检测后面的元素，只显示该元素的错误信息；
        postonce:_postonce,//默认为false，指定是否开启二次提交防御，true开启，不指定则默认关闭；为true时，在数据成功提交后，表单将不能再继续提交;
        ajaxPost:_ajaxPost,//默认为false，使用ajax方式提交表单数据，将会把数据POST到config方法或表单action属性里设定的地址；
        datatype:_datatype,//传入自定义datatype类型，可以是正则，也可以是函数
        usePlugin:_usePlugin,//目前已整合swfupload、datepicker、passwordstrength和jqtransform四个插件，在这里传入这些插件使用时需要传入的参数
        beforeCheck:_beforeCheck,//在表单提交执行验证之前执行的函数，curform参数是当前表单对象。这里明确return false的话将不会继续执行验证操作;
        beforeSubmit:_beforeSubmit,//在验证成功后，表单提交前执行的函数，curform参数是当前表单对象。这里明确return false的话表单将不会提交;
        callback:_callback//注意：如果不是ajax方式提交表单，传入callback，这时data参数是当前表单对象，回调函数会在表单验证全部通过后执行，然后判断是否提交表单，如果callback里明确return false，则表单不会提交，如果return true或没有return，则会提交表单。
    });
    ajaxForm.config({url:ajaxUrl});

};

//通用文件上传
var commonUpload=function (upload,btnId,uploadUrl,data,multiple,uploadCallback) {
    upload.render({
        elem: '#'+btnId //绑定元素
        ,url: uploadUrl //上传接口
        ,data: data
        ,multiple: multiple
        ,before: function(obj){
            layer.msg('文件上传中...', {
                icon: 16,
                shade: 0.01,
                time: 0
            })
        }
        ,done: function(res){
            //上传完毕回调
            layer.close(layer.msg());
            if(res.code == 0){
                uploadCallback(res)
            }

        }
        ,error: function(){
            //请求异常回调
            alert('文件上传异常！')
        }
    });
};

//父级弹出页面
function page(title, url, w, h) {
	if(title == null || title == '') {
		title = false;
	};
	if(url == null || url == '') {
		url = "404.html";
	};
	if(w == null || w == '') {
		w = '700px';
	};
	if(h == null || h == '') {
		h = '620px';
	};
	//如果手机端，全屏显示
	if(window.innerWidth <= 768) {
		var index = layer.open({
			type: 2,
			title: title,
			area: [320, h],
			fixed: false, //不固定
			content: url
		});
		layer.full(index);
	} else {
		var index = layer.open({
			type: 2,
			title: title,
			area: [w, h],
			fixed: false, //不固定
			maxmin: true,
			content: url
		});
	}
}
// 获取当前项目的根路径，通过获取layui.js全路径截取assets之前的地址
function getProjectUrl() {
    var layuiDir = layui.cache.dir;
    if (!layuiDir) {
        var js = document.scripts, last = js.length - 1, src;
        for (var i = last; i > 0; i--) {
            if (js[i].readyState === 'interactive') {
                src = js[i].src;
                break;
            }
        }
        var jsPath = src || js[last].src;
        layuiDir = jsPath.substring(0, jsPath.lastIndexOf('/') + 1);
    }
    //console.log(layuiDir);
    return layuiDir.substring(0, layuiDir.indexOf('assets'));
}
/**
 * 将整数价格变为小数
 * @param val
 * @returns {*}
 */
function formatPrice(val) {
    if(typeof val === 'string'){
        if(isNaN(val)){
            return null;
        }
        // 价格转为整数
        var index = val.lastIndexOf(".");
        var p = "";
        if(index < 0){
            // 无小数
            p = val + "00";
        }else if(index === p.length - 2){
            // 1位小数
            p = val.replace("\.","") + "0";
        }else{
            // 2位小数
            p = val.replace("\.","")
        }
        return parseInt(p);
    }else if(typeof val === 'number'){
        if(val == null){
            return null;
        }
        var s = val + '';
        if(s.length === 0){
            return "0.00";
        }
        if(s.length === 1){
            return "0.0" + val;
        }
        if(s.length === 2){
            return "0." + val;
        }
        var i = s.indexOf(".");
        if(i < 0){
            return s.substring(0, s.length - 2) + "." + s.substring(s.length-2)
        }
        var num = s.substring(0,i) + s.substring(i+1);
        if(i === 1){
            // 1位整数
            return "0.0" + num;
        }
        if(i === 2){
            return "0." + num;
        }
        if( i > 2){
            return num.substring(0,i-2) + "." + num.substring(i-2)
        }
    }
}
/**
 * 将日期格式化为指定格式
 * @param val
 * @param pattern
 * @returns {null}
 */
function formatDate(val, pattern) {
    if (!val) {
        return null;
    }
    if (!pattern) {
        pattern = "yyyy-MM-dd hh:mm:ss"
    }
    return new Date(val).format(pattern);
}

/**
 * 文件大小单位转换  B转KB转MB
 * @param limit
 * @returns {string}
 */
function computeFileSize(limit){
  var size = "";
  if(limit < 0.1 * 1024){                            //小于0.1KB，则转化成B
     size = limit.toFixed(2) + "B"
  }else if(limit < 0.1 * 1024 * 1024){            //小于0.1MB，则转化成KB
      size = (limit/1024).toFixed(2) + "KB"
  }else if(limit < 0.1 * 1024 * 1024 * 1024){        //小于0.1GB，则转化成MB
      size = (limit/(1024 * 1024)).toFixed(2) + "MB"
   }else{                                            //其他转化成GB
      size = (limit/(1024 * 1024 * 1024)).toFixed(2) + "GB"
  }

   var sizeStr = size + "";                        //转成字符串
   var index = sizeStr.indexOf(".");                    //获取小数点处的索引
   var dou = sizeStr.substr(index + 1 ,2)            //获取小数点后两位的值
   if(dou == "00"){                                //判断后两位是否为00，如果是则删除00
         return sizeStr.substring(0, index) + sizeStr.substr(index + 3, 2)
     }
         return size;
}