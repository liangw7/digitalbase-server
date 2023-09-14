var passport = require('passport');
var User = require('../app/models/user');
var Util = require('../app/utils/util');
var config = require('./auth');
var cfg = require('./common').config;
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var LocalStrategy = require('passport-local').Strategy;

var localOptions = {
    usernameField: 'email',
    passReqToCallback: true
};

/**
 * 登录逻辑说明:email为了兼容老系统登录,故此名称实际含义为:username
 * 该username包括的参数为:
 * 1.邮箱
 * 2.手机号
 * 3.weChatID
 * 
 * 通过正则校验是否为邮箱,手机号,否则默认为weChatID
 * 注意!!!!!!!
 * 邮箱,手机号登录需要校验密码的准确性.登录逻辑需要加上此层判断!
 * 
 * weChatID登录不需要校验密码,因为通过微信授权登录,微信端已经校验过一层.因此如果weChatID与用户
 * 信息可以匹配上就直接登录即可
 * (这么做是为了提高微信端登录用户的体验,无需在微信授权登录后,又要再次在系统内输入密码登录)
 */
var localLogin = new LocalStrategy(localOptions, function (req, email, password, done) {
    console.log('----passport----req.body', req.body);
    console.log('----passport----req.body.email', req.body.email);
    console.log('----passport----req.body.role',);
    console.log('----passport----email', email);
    let params = null;
    let isWeiXin = false;
    const providerRoles = cfg.healthCareWorkerRoles;
    if (Util.checkMobile(email)) {
        if (req.body.role) {
            if (req.body.role == 'provider') {
                params = {
                    "$and": [
                        {
                            role: {
                                "$in": [
                                    'nurse',
                                    'physicalTherapist',
                                    'caseManager',
                                    'marketOperator',
                                    'provider',
                                    'admin'
                                ]
                            }
                        },
                        { phone: email }
                    ]
                }
            } else if (req.body.role == 'patient' || req.body.role == 'admin') {
                params = {
                    phone: email,
                    role: req.body.role
                }
            }
        } else {
            params = {
                phone: email
            }
        }
    } else {
        // 判断是否为手机号,如果不是手机号则默认为微信unionid即user信息中的weChatID
        if (Util.checkEmail(email)) {
            if (req.body.role) {
                if (req.body.role == 'provider') {
                    params = {
                        "$and": [
                            {
                                role: {
                                    "$in": [
                                        'nurse',
                                        'physicalTherapist',
                                        'caseManager',
                                        'marketOperator',
                                        'provider',
                                        'admin'
                                    ]
                                }
                            },
                            { email: email }
                        ]
                    }
                } else if (req.body.role == 'patient' || req.body.role == 'admin') {
                    params = {
                        email: email,
                        role: req.body.role
                    }
                }
            } else {
                params = {
                    email: email
                }
            }
        } else {
            if (req.body.role) {
                params = {
                    weChatID: email,
                    role: req.body.role
                }
                isWeiXin = true;
            } else {
                params = {
                    weChatID: email
                }
                isWeiXin = true;
            }
        }
    }
    console.log('----passport----params');
    console.log(params);
    if (params) {
        User.findOne(params, function (err, user) {
            if (err) {
                console.log('----passport----err' + err);
                return done(err);
            }
            console.log('----passport----user' + user);
            if (!user) {
                return done(null, false, { error: 'Login failed. Please try again.' });
            }
            if (isWeiXin) {
                return done(null, user);
            } else {
                user.comparePassword(password, function (err, isMatch) {
                    if (err) {
                        console.log('----comparePassword----err' + err);
                        return done(err);
                    }
                    console.log('----comparePassword----isMatch' + isMatch);
                    if (!isMatch) {
                        return done(null, false, { error: 'Login failed. Please try again.' });
                    }
                    return done(null, user);
                });
            }
        });
    } else {
        return done(null, false, { error: '用户角色异常,请联系管理员!' });
    }
});

var jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeader(),
    secretOrKey: config.secret
};

var jwtLogin = new JwtStrategy(jwtOptions, function (payload, done) {
    console.log('jwtOptions', jwtOptions)
    User.findById(payload._id, function (err, user) {
        console.log('payload', payload)
        console.log('user', user)
        if (err) {
            return done(err, false);
        }

        if (user) {
            done(null, user);
        } else {
            done(null, false);
        }

    });

});

passport.use(jwtLogin);
passport.use(localLogin);

module.exports = {
    initialize: () => passport.initialize(),
    authenticateJWT: passport.authenticate('jwt', { session: false }),
    authenticateCredentials: passport.authenticate('local', { session: false }),
};