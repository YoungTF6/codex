$(function () {
    _html.verifycpt?.();
    _render.projectId = getOrDefault(getUrlParamByName('project_id'), '0d00d7b4-6d36-4e9d-8222-0076bbfd02fb');
    _render.projectVo = null;
    declareProjDetailById(_render.projectId).then(response => {
        let jsonRes = response.data;
        if (jsonRes.success) {
            _render.projectVo = jsonRes.data;
        } else {
            alert(jsonRes.msg);
        }
    }).catch(error => {
        alert('error:加载项目信息');
    }).finally(() => {
        _render.project(_render.projectVo);
        setTimeout(function () {
            $('.loading_container').hide();
        }, 300);
    });
});