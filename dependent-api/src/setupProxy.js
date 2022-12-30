const { createProxyMiddleware } = require('http-proxy-middleware');
const proxy = {
    target: 'http://localhost:8001',
    changeOrigin: true
}
module.exports = function(app) {
  app.use(
    '/k8s',
    createProxyMiddleware(proxy)
  );
};
