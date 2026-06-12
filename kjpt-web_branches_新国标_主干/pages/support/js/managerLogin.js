function setFileVerifyCookie(xhr) {
    // 添加文件验证cookie
    document.cookie = `file_verify_cookie=${xhr.getResponseHeader('Authorization')}; path=/;`;
}

function setFileVerifyCookie(xhr) {
    // 添加文件验证cookie
    document.cookie = `file_verify_cookie=${localStorage.getItem('token')}; path=/;`;
}

