const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/proxy-storage',
    createProxyMiddleware({
      target: 'https://firebasestorage.googleapis.com',
      changeOrigin: true,
      pathRewrite: {
        '^/proxy-storage': '/v0/b/turtle-i-7978a.appspot.com/o'
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log('Proxying request:', req.method, req.url);
      },
      onProxyRes: function (proxyRes, req, res) {
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        console.log('Proxy response status:', proxyRes.statusCode);
      }
    })
  );
};