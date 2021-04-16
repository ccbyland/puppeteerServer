module.exports = {
    autoCheckUrl(url) {
        if (url.indexOf('//') == 0) {
            url = 'https:' + url;
        }
        return url;
    }
}