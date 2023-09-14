//const fs = require("fs");
const cfg = require('../../config/common').config;
const schedule = require('node-schedule');
const cron = require('node-cron');
var wechat = require('../middleware/wechat');
const User = require('../models/user');

let utils = {
  isUndef: (v) => {
    return v === undefined || v === null || v === ''
  },

  isEmpty: (obj) => {
    return Object.keys(obj).length == 0
  },

  wxDate: (dateTime) => {
    let t = (new Date(dateTime)).toISOString().slice(0, 19);
    t = t.substr(5, t.length);
    t = t.replace("-", "月");
    t = t.replace("T", "日");
    return t;
  },

  dateFrom: (interval) => {
    let unit = interval[interval.length - 1];
    let span = parseInt(interval.substr(0, interval.length - 1), 10);
    let d = new Date();

    switch (unit) {
      case 'y':
        d.setFullYear(d.getFullYear() - span);
        break;
      case 'm':
        d.setMonth(d.getMonth() - span);
        break;
      case 'd':
        d.setDate(d.getDate() - span);
        break;
      case 'H':
        d.setHours(d.getHours() - span);
        break;
      case 'M':
        d.setMinutes(d.getMinutes() - span);
        break;
      case 'S':
        d.setSeconds(d.getSeconds() - span);
        break;
      default:
        break;
    }
    return d.toISOString();

  },

  dateRange: (start = '12m', endDay = 1) => {
    let t = new Date();
    t.setDate(t.getDate() + endDay);

    return {
      start: utils.dateFrom(start),
      end: t.toISOString()
    }
  },

  json2mongosql: (obj) => {
    const keys = Object.keys(obj)
    let conds = []

    for (key of keys) {
      let val = obj[key]
      if (Array.isArray(val))
        conds.push({
          [key]: {
            $gte: new Date(val[0]),
            $lt: new Date(val[1])
          }
        });
      else if (/^([0-9]{1,2})[ymdHMS]$/.test(val))
        conds.push({
          [key]: {
            $gte: new Date(utils.dateFrom(val))
          }
        });
      else
        conds.push({
          [key]: val
        })
    }
    return {
      $and: conds
    }
  },

  // format: 1. host, 2. cgi, 3. [ params ..]
  /* example
    { 
      host: "127.0.0.1:8080/cgi-bin",
      cgi: /token,
      params: {
        appid: appId,       
        secret: appSecret
      }
    }
  */

  json2url: (obj) => {
    let url = `${obj.host}${obj.cgi}?`;
    const keys = Object.keys(obj.params)
    for (i in keys) {
      if (i > 0) url += '&';
      url += `${keys[i]}=${obj.params[keys[i]]}`;
    }
    // console.log(url);
    return url
  },


  /* sql object example
      { 
        fields: 'UNID, MAX(DateTime) as DateTime, DevProp, Value1',
        table: 'SimpleDB',
        criteria: [
          'DevProp = '13',       
          'DateTime BETWEEN '2020/05/01' AND '2020/07/31'
        ],
        logic: ' and'
        orderby: 'date DESC',
        groupby: 'UNID'
        limit: 'limit',
        offset: 'offset'
      }
    */
  json2sql: (obj) => {

    let sql = `SELECT ${obj.fields} FROM ${obj.table} WHERE `;
    const keys = Object.keys(obj.criteria)
    for (i in keys) {
      if (i > 0) sql += ` ${obj.logic} `;
      sql += `${obj.criteria[keys[i]]}`;
    }
    if (obj.orderby) sql += ` ORDER BY ${obj.orderby}`;
    if (obj.groupby) sql += ` GROUP BY ${obj.groupby}`;
    if (obj.limit) sql += ` LIMIT ${obj.limit}`;
    if (obj.offset) sql += ` OFFSET ${obj.offset}`;
    // console.log(sql);

    return sql
  },

  // 商户订单号  
  out_trade_no: () => {
    return Math.random().toString(36).substr(2, 15);
  },

  //UUID
  uuid: () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },

  //把金额转为分
  getMoney: function (money) {
    return parseFloat(money) * 100;
  },

  // 随机字符串产生函数  
  createNonceStr: function () {
    return Math.random().toString(36).substr(2, 15);
  },

  // 时间戳产生函数  
  createTimeStamp: function () {
    return parseInt(new Date().getTime() / 1000) + '';
  },

  /**
  * 正则校验手机号
  * @param {手机号} mobile 
  */
  checkMobile: function (mobile) {
    if (!(/^1(3|4|5|6|7|8|9)\d{9}$/.test(mobile))) {
      console.log(mobile + "入参非手机号码");
      return false;
    } else {
      console.log(mobile + "入参为手机号码");
      return true;
    }
  },

  /**
   * 正则校验邮箱
   * @param email 邮箱
   * @returns 
   */
  checkEmail: function (email) {
    if (!(/^([a-zA-Z\d])(\w|\-)+@[a-zA-Z\d]+\.[a-zA-Z]{2,4}$/.test(email + ""))) {
      console.log(email + "入参非邮箱");
      return false;
    } else {
      console.log(email + "入参为邮箱");
      return true;
    }
  },

  /**
   * 校验角色信息准确性
   * 'nurse',
   * 'physicalTherapist',
   * 'caseManager',
   * 'marketOperator',
   * 'provider',
   * 'admin',
   * 'patient'
   * @param {前端角色入参} role 
   * @returns 
   */
  checkRoleIsRight(role) {
    let roleArray = cfg.healthCareWorkerRoles;
    roleArray.push('patient');
    // roleArray.push('admin');
    let flag = false;

    for (let r of roleArray) {
      if (role == r) {
        flag = true;
      }
    }
    return flag;
  },


  /**
 * name定时名称
 * ruleObj表达式
 * desc任务描述信息，为空得话给个默认值
 * */
  startTimer: function (name, ruleObj, desc, patientID, url) {
    console.log('------startTimer---url---' + url);
    console.log('------startTimer---name---' + name);
    console.log('------startTimer---ruleObj---' + ruleObj);
    console.log('------startTimer---desc---' + desc);
    console.log('------startTimer---patientID---' + patientID);
    return new Promise((resolve, reject) => {
      let rule = new schedule.RecurrenceRule();
      console.log('进入指定任务方法中，开始触发');
      if (!ruleObj) {
        console.log('定时任务表达式为空！');
        reject({ code: -1, msg: '定时任务表达式为空！' });
      } else {
        if (!ruleObj.year && !ruleObj.month && !ruleObj.date &&
          !ruleObj.dayOfWeek && !ruleObj.hour && !ruleObj.minute &&
          !ruleObj.second) {
          console.log('定时任务表达式中所有相关内容均为空！');
          reject({ code: -1, msg: '定时任务表达式中所有相关内容均为空！' });
        }
        // 年
        if (ruleObj.year) {
          rule.year = ruleObj.year;
          if (ruleObj.year instanceof Array) {
            console.log("ruleObj.year我是 Array 类型");
          }
          if (typeof ruleObj.year === "number") { // "string" 
            console.log("ruleObj.year 我是 number 类型");
          }
        }
        // 月
        if (ruleObj.month) {
          rule.month = ruleObj.month;
          if (ruleObj.month instanceof Array) {
            console.log("ruleObj.month 我是 Array 类型");
          }
          if (typeof ruleObj.month === "number") { // "string" 
            console.log("ruleObj.month 我是 number 类型");
          }
        }
        // 日
        if (ruleObj.date) {
          rule.date = ruleObj.date;
          if (ruleObj.date instanceof Array) {
            console.log("ruleObj.date 我是 Array 类型");
          }
          if (typeof ruleObj.date === "number") { // "string" 
            console.log("ruleObj.date 我是 number 类型");
          }
        }
        // 周
        if (ruleObj.dayOfWeek) {
          rule.dayOfWeek = ruleObj.dayOfWeek;
          if (ruleObj.dayOfWeek instanceof Array) {
            console.log("ruleObj.dayOfWeek 我是 Array 类型");
          }
          if (typeof ruleObj.dayOfWeek === "number") { // "string" 
            console.log("ruleObj.dayOfWeek 我是 number 类型");
          }
        }
        // 时
        if (ruleObj.hour) {
          rule.hour = ruleObj.hour;
          if (ruleObj.hour instanceof Array) {
            console.log("ruleObj.hour 我是 Array 类型");
          }
          if (typeof ruleObj.hour === "number") { // "string" 
            console.log("ruleObj.hour 我是 number 类型");
          }
        }
        // 分
        if (ruleObj.minute) {
          rule.minute = ruleObj.minute;
          if (ruleObj.minute instanceof Array) {
            console.log("ruleObj.minute 我是 Array 类型");
          }
          if (typeof ruleObj.minute === "number") { // "string" 
            console.log("ruleObj.minute 我是 number 类型");
          }
        }
        // 秒
        if (ruleObj.second) {
          rule.second = ruleObj.second;
          if (ruleObj.second instanceof Array) {
            console.log("ruleObj.second 我是 Array 类型");
          }
          if (typeof ruleObj.second === "number") { // "string" 
            console.log("ruleObj.second 我是 number 类型");
          }
        }
      }
      if (!desc) {
        desc = '您有一个任务，请及时处理！'
      }
      schedule.scheduleJob(name, rule, () => {
        console.log('scheduleCronstyle:' + new Date());

        User.findById({ _id: patientID }, function (err, data) {
          if (err) {
            reject({ code: -1, msg: err });
            console.log('err' + err);
          }
          console.log('-----data-----' + data);
          if (data) {
            const patient = data;
            if (patient && patient.openID) {
              var image = '';
              if (patient.photo) {
                image = 'https://www.digitalbaseas.com/api/upload/photo-' + String(patient.photo) + '.png';
              } else {
                image = 'https://www.digitalbaseas.com/api/upload/photo-header.png';
              }
              userTypeStr = 'userType=0';
              var title = desc;
              var filter = {
                openID: patient.openID,
                message: '任务提醒',
                title: title,
                url: url,
                picUrl: image
              };
              console.log('mail filter', filter);
              wechat.sendwxMessage(`${cfg.wechat.appId}`, `${cfg.wechat.appSecret}`, {
                touser: filter.openID,
                msgtype: "news",
                news: {
                  articles: [{
                    title: title,
                    description: filter.message,
                    url: filter.url,
                    picurl: filter.picUrl
                  }]
                }
              })
            } else {
              // 发送短信
              userTypeStr = 'userType=0';
              // var message = desc + 'https://www.digitalbaseas.com';
              var message = desc;
              console.log('----发送短信----' + message);
              shortMessage.sendMessage(patient.phone, null, message);
            }
          }
          // resolve({ code: 1, msg: '保存并发送成功！' });
        });
      });
      resolve({ code: 1, msg: '保存并发送成功！' });
    });
  },

  /**
 * 根据schedule信息，判断入参schedule是否已经在执行中。
 * 如果任务本身不存在，或处于存在未执行状态，则需要重新触发，执行即可
 * @param {*} data schedule信息
 */
  detailSchedule: function (data) {
    if (Array.isArray(data)) {
      for (let index = 0; index < data.length; index++) {
        const s = data[index];
        let url = 'https://www.digitalbaseas.com/public/main';
        if (s.detail && s.detail.url) {
          url = s.detail.url;
        }
        if (s.status && s.status == '1') {
          console.log('schedule----' + s);
          console.log('name----' + s.name);
          console.log('rule----' + s.rule);
          console.log('desc----' + s.desc);
          console.log('patientID----' + s.patientID);
          let job = schedule.scheduledJobs[s.name];
          console.log('job----' + job);
          if (job) {
            let nextInvocation = job.nextInvocation();
            console.log('nextInvocation----' + nextInvocation);
            if (null == nextInvocation && s.status == '1') {
              console.log('任务存在，但处于停滞状态，即将触发执行');
              this.startTimer(s.name, s.rule, s.desc, s.patientID, url);
            } else {
              console.log('任务已经处于执行状态，无需重复执行');
            }
          } else {
            console.log('任务已经不存在了，需要重新开始执行');
            this.startTimer(s.name, s.rule, s.desc, s.patientID, url);
          }
        } else {
          console.log('任务数据处于取消状态，不能重启，此处特殊说明');
        }
      }
    }
  }

}

module.exports = utils;