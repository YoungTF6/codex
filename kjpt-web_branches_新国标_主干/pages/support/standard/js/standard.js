layui.use(['table', 'form', 'jquery', 'layer'], function () {
    var table = layui.table,
        form = layui.form,
        $ = layui.jquery,
        layer = layui.layer
        ;

        layer.ready(function () {
            setTimeout(function () {
                if (localStorage.getItem('choose-standard-id')) {
                    loaderTable();
                } else {
                    chooseStandard();
                }
            }, 100);
            
        })

        window.chooseStandard = function(){
            if (!localStorage.getItem('choose-standard-id')) {
                layer.alert('请选择套标准', function(index){
                    //do something
                    layer.close(index);
                    layer.open({
                        type: 2, 
                        content: 'cmeStandardKind.html', //这里content是一个普通的String
                        area: ['100%', '100%'],
                        btn: ['关闭'],
                        closeBtn: 0,
                        yes: function(index, layero){
                            layer.close(index);
                            location.reload();
                          },
                        btnAlign: 'c'
                    });
                });
                return false
            }
            return true;
        }
})
