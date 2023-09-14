module.exports = {
  // 'url': 'mongodb://careline:alex2005@ds040017.mlab.com:40017/careline'
  //'url': 'mongodb://careline:alex2005@127.0.0.1/careline?authMechanism=SCRAM-SHA-1'
  // 'url': 'mongodb://liangw7:alex2005@127.0.0.1:27017/careline?maxPoolSize=2&socketTimeoutMS=600000'
  //'url': 'mongodb://liangw7:Outlook!2018@127.0.0.1/careline'
  // 'url': 'mongodb://careline:alex2005@127.0.0.1/careline'
  //'mongodb://用户名:登陆密码@127.0.0.1/databaseFoo';
  mongo_url: "mongodb://127.0.0.1:27017/careline",
  /* axiconn: {
     host: 'bj-cdb-qcpjo1zh.sql.tencentcdb.com',
     user: 'AIoT2',
     port: '63182',
     password: 'aiot7534',
     database: 'AxiDB_v2'
   },*/
  axiconn: {
    host: 'db.axilink.pro',
    user: 'AIoT2',
    port: '10109',
    password: 'aiot7534',
    database: 'AxiDB_v2'
  },
  wechat: {
    wechatRedirectUrl: 'http://localhost/wechat/oauth-callback',  //set your oauth redirect url, defaults to localhost
    appId: 'wx1456c566ec3e6686',
    appSecret: '8ada6bb8a95c8d79abf7a374688aa9cd',
    card: true, //enable cards
    //  "wechatToken": "wechat_token", //not necessary required
    //  payment: true, //enable payment support
    //  merchantId: '', //
    //  paymentSandBox: true, //dev env
    //  paymentKey: '', //API key to gen payment sign
    //  paymentCertificatePfx: fs.readFileSync(path.join(process.cwd(), 'cert/apiclient_cert.p12')),
    //  default payment notify url
    //  paymentNotifyUrl: `http://your.domain.com/api/wechat/payment/`,
  },
  wxpay: {
    appid: 'wx1456c566ec3e6686',
    appSecret: '8ada6bb8a95c8d79abf7a374688aa9cd',
    mchid: '1601139967',
    partnerKey: 'GNHsDl0y4Y4RNlUAWGXOKcjzc1SraA9X',
    pfx: require('fs').readFileSync('././apiclient_cert.p12'), // 证书文件路径
    notify_url: encodeURI('https://www.digitalbaseas.com/api/wx/notify'), // 支付回调网址
    refund_url: encodeURI('https://www.digitalbaseas.com/api/wx/notifyRefund'),  // 退款结果通知回调地址(选填)  
    spbill_create_ip: '47.101.41.210' //  IP地址
  },
  wxapi: {
    //  sns: 'https://api.weixin.qq.com/sns',
    //  cgi: 'https://api.weixin.qq.com/cgi-bin',
    token: 'https://api.weixin.qq.com/cgi-bin/token',
    send: 'https://api.weixin.qq.com/cgi-bin/message/custom/send',
    access_token: 'https://api.weixin.qq.com/sns/oauth2/access_token',
    userinfo: 'https://api.weixin.qq.com/sns/userinfo',
    getticket: 'https://api.weixin.qq.com/cgi-bin/ticket/getticket'
  },
  peer: {
    debug: true,
    path: '/ws/'
  },
  s3: {
    AWS_ACCESS_KEY: 'AKIAISS7W65ZH3BWLPBA',
    AWS_SECRET_ACCESS_KEY: 'SHwMrJumjZS7Hd4pcH6sPKtQgMudBqXC1fXV0NVq',
    REGION: 'us-east-2', // change to yours
    Bucket: 'careline-dev' // change to yours
  },
  mandao: {
    url: 'http://sdk.entinfo.cn:8061/mdsmssend.ashx',
    sn: 'SDK-BBX-010-38274',
    password: 'pSTw7cpb',
    autograph: '【数基健康】',
    content: {
      login: {
        firstHalf: '登录/注册验证码：',
        secondHalf: '，请勿转发，转发将导致帐号被盗。本验证码5分钟有效。注册后将绑定此安全手机'
      },
      resetPassword: {
        firstHalf: '密码找回验证码：',
        secondHalf: '，请勿转发，转发将导致帐号被盗。本验证码5分钟有效。注册后将绑定此安全手机'
      },
      notification: {
        msg: '您有一条新的咨询消息,请及时处理!'
      }
    }
  },
  healthCareWorkerRoles: [// 医护工作者对应的角色值
    'nurse',
    'physicalTherapist',
    'caseManager',
    'marketOperator',
    'provider',
    'admin'
  ],
  upload_path: '../uploads',
  homepage: 'http://localhost:3000/homepage/login-poster/',
  api_port: 8085,
  debug: true
}