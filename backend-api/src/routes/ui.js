const Router = require('koa-router');
const config = require('../config');
const { commonBiz, userBiz } = require('../bizs');

const router = new Router({
  prefix: `${config.apiPrefix}/ui`
});

router.use(commonBiz.mustLogin);

router.get('/main', userBiz.getMainUIData);

module.exports = router;
