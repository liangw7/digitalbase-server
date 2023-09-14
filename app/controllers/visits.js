var Visit = require('../models/visit');
const mongoose = require('mongoose');

exports.getVisits = function (req, res, next) {

    Visit.find(function (err, Visits) {

        if (err) {
            res.send(err);
        }

        res.json(Visits);

    });

}
exports.getOneVisit = function (req, res, next) {
    console.log('req.body', req.body)
    Visit.findOne(req.body, function (err, Visit) {

        if (err) {
            res.send(err);
        }

        res.json(Visit);

    });

}
exports.getFollowupsByDate = function (req, res) {

    var pipeline = [

        {
            "$match": {
                '$expr': {
                    '$and': [
                        {
                            "$gt": [{ '$toDate': '$visitDate' },
                            { '$toDate': req.body.selectedStart }
                            ]
                        },
                        {
                            "$gt": [{ '$toDate': req.body.selectedEnd },
                            { '$toDate': '$visitDate' }
                            ]
                        },

                        { "$eq": ['$type', 'followup'] },
                        { "$eq": ['$desc', 'monitor'] },
                        {
                            "$eq": [{ '$toString': '$patientID' },
                            { '$toString': req.body.patientID }
                            ]
                        }
                    ]
                }
            }
        },
        { '$sort': { 'visitDate': -1 } }




    ];
    Visit.aggregate(
        pipeline,

        // cursor({ batchSize: 1000 }),
        function (err, result) {
            console.log('req.body', req.body)
            if (err) {
                console.log(err);
            }
            else {
                res.json(result);
            }
        });

}

exports.getVisitsByPatient = function (req, res, next) {


    var pipeline =
        [
            { "$match": { "patientID": req.body.patientID } },
            {
                "$lookup": {
                    "let": { "profile": "$profile" },
                    "from": "categories",
                    "pipeline": [
                        {
                            "$match": {
                                "$expr": {
                                    "$and": [
                                        {
                                            "$eq": [{ "$toString": "$_id" }, { "$toString": "$$profile._id" }]
                                        },

                                    ]
                                }
                            }
                        }
                    ],

                    "as": "profile"
                }
            },
            {
                "$unwind": {
                    "path": '$profile',
                    "preserveNullAndEmptyArrays": true
                }
            }

        ]


    Visit.aggregate(
        pipeline,
        function (err, result) {

            console.log('result', result)
            if (err) {
                console.log(err);
            }
            else {
                res.json(result);
            }
        });

}

exports.getVisitPartByFilter = function (req, res, next) {

    console.log('req.body', req.body)

    Visit.find(req.body, {
        _id: 1, desc: 1, patientID: 1,
        providerID: 1, patientName: 1, providerName: 1,
        patientEmail: 1, providerEmail: 1, patientGender: 1,
        patientBirthday: 1, providerGender: 1, providerSpecialty: 1,
        orderID: 1, type: 1, followupType: 1,
        status: 1, availableAtYear: 1, availableAtMonth: 1,
        availableAtDate: 1, availableAtHours: 1, availableAtMinutes: 1,
        reservedAt: 1, visitDate: 1, createdBy: 1,
        modifiedBy: 1, out_trade_no: 1
    }, function (err, data) {
        if (err) {
            res.send(err);
            console.log(err);
        }
        res.json(data);

        var _send = res.send;
        var sent = false;
        res.send = function (data) {
            if (sent) return;
            _send.bind(res)(data);
            sent = true;
        };
        next();
    }).sort({ "createdAt": 'desc' });
}

exports.getVisitListByFilter = function (req, res, next) {

    console.log('req.body', req.body)

    Visit.find(req.body, { _id: 1, 
        type: 1, 
        status: 1, 
        desc: 1, 
        provider: 1,
        patient:1, 
        visitDate: 1, 
        providerID: 1,
        patientID: 1, 
        createdBy: 1, 
        modifiedBy: 1 },{limit: 6}, function (err, data) {
        if (err) {
            res.send(err);
            console.log(err);

        }
        res.json(data);

        var _send = res.send;
        var sent = false;
        res.send = function (data) {
            if (sent) return;
            _send.bind(res)(data);
            sent = true;
        };
        next();

    }).sort({ "visitDate": 'desc' });

}
exports.getVisitsByFilter = function (req, res, next) {

    console.log('req.body', req.body)
    Visit.find(req.body, { _id: 1, 
        type: 1, 
        status: 1, 
        desc: 1, 
        provider: 1,
        patient:1, 
        visitDate: 1, 
        providerID: 1,
        patientID: 1, 
        createdBy: 1, 
        modifiedBy: 1 }, function (err, data) {
        if (err) {
            res.send(err);
            console.log(err);

        }
        res.json(data);

        var _send = res.send;
        var sent = false;
        res.send = function (data) {
            if (sent) return;
            _send.bind(res)(data);
            sent = true;
        };
        next();

    }).sort({ "visitDate": 'desc' });

}

exports.getVisitsForProviderList = function (req, res, next) {

    console.log('req.body', req.body)

    Visit.find(req.body, {
        _id: 1, desc: 1, patientID: 1,
        providerID: 1, type: 1, followupType: 1,
        status: 1, createdAt: 1, reservedAt: 1,
        visitDate: 1, createdBy: 1,
        modifiedBy: 1, out_trade_no: 1,
        provider: 1,
        profiles: 1,
    }, function (err, data) {
        if (err) {
            res.json({ code: -1, msg: '��ѯVisitsʧ��' + err });
            console.log(err);
        }
        console.log(data);
        res.json({ code: 1, msg: '��ѯVisits�ɹ�', data: data });
    }).sort({ "visitDate": 'desc' });
}


exports.getMonthlyVisits = function (req, res, next) {

    Visit.aggregate(
        [
            { $match: { status: { $ne: 'avail' }, providerID: { $ne: null } } },
            {
                $lookup: {
                    "let": { "providerID": "$providerID" },
                    "from": "users",
                    "pipeline": [
                        {
                            "$match": {
                                "$expr": {
                                    '$or': [
                                        {
                                            '$and': [
                                                { "$eq": [{ "$toString": "$_id" }, '$$providerID'] },
                                                { "$eq": [{ "$toString": "$service._id" }, req.body.serviceID] }
                                            ],
                                        },
                                        {
                                            '$and': [

                                                { "$eq": [{ "$toString": "$_id" }, '$$providerID'] },
                                                { "$in": [{ "$toString": "$service._id" }, req.body.serviceIDs] }
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    ],
                    "as": "provider"
                }
            },
            { $unwind: '$provider' },


            { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
            { $sort: { '_id.year': 1, '_id.month': 1 } }

            //   "createdAt": { $gte: new Date((new Date().getTime() - (req.body.months * 24 * 60 * 60 * 1000))) }
            //       } }
        ],
        // cursor({ batchSize: 1000 }),
        function (err, result) {
            console.log('req.body', req.body)
            console.log('result', result)
            if (err) {
                console.log(err);
            }
            else {
                res.json(result);
            }
        });


}
exports.getVisitsByProvider = function (req, res, next) {

    var pipeline = [

        //find provider

        { '$match': { 'provider.profiles': { '$elemMatch': { '_id': { '$in': req.body.profileIDs } } } } },

        //find right time phrame

        {
            "$match": {
                '$expr': {
                    '$and': [

                        { "$eq": ['$availableAtYear', req.body.availableAtYear] },
                        { "$eq": ['$availableAtMonth', req.body.availableAtMonth] },
                        { "$eq": ['$availableAtDate', req.body.availableAtDate] },
                        {
                            '$or': [{ "$eq": ['$status', 'avail'] },
                            {
                                "$and": [{ "$eq": ['$status', 'reserved'] },
                                { "$eq": ['$patientID', req.body.patientID] }
                                ]
                            }




                            ]
                        }
                    ]

                }
            }
        },

        {
            '$addFields': {
                'visit': {
                    'availableAtYear': "$availableAtYear",
                    'availableAtMonth': "$availableAtMonth",
                    'availableAtDate': "$availableAtDate",
                    'availableAtHours': "$availableAtHours",
                    'availableAtMinutes': "$availableAtMinutes",
                    'patient': '$patient',
                    'patientID': '$patientID',
                    'status': "$status",
                    'type': "$type",
                    'enType': "$enType",
                    'createdAt': "$createdAt",
                    "_id": "$_id"
                }
            }
        },

        //group by provider
        //  { "$unwind": "$provider.profiles"},
        {
            "$group": {
                "_id":
                {
                    "providerID": "$provider._id",
                    "providerName": "$provider.name",
                    "providerTitle": "$provider.title",
                    "providerPhoto": "$provider.photo",
                    // "providerProfiles":"$provider.profiles",




                },
                "providerVisits": { "$push": "$visit" },

            }



        },
        {
            "$project": {
                "provider":
                {
                    '_id': "$_id.providerID",
                    'name': "$_id.providerName",
                    'title': "$_id.providerTitle",
                    'photo': "$_id.providerPhoto"
                    // 'profiles':"$_id.providerProfiles",


                },
                "profiles": 1,
                "providerVisits": 1,
                "_id": 0
            }
        }






    ];
    Visit.aggregate(
        pipeline,

        // cursor({ batchSize: 1000 }),
        function (err, result) {
            console.log('req.body', req.body)
            if (err) {
                console.log(err);
            }
            else {
                res.json(result);
            }
        });

}

exports.getMonthlyVisitsByProvider = function (req, res, next) {

    var pipeline = [
        {
            $match: {
                providerID: req.body.providerID,
                visitDate: { $gte: new Date((new Date().getTime() - (req.body.months * 24 * 60 * 60 * 1000))) }
            }
        },
        { $group: { _id: { year: { $year: '$visitDate' }, month: { $month: '$visitDate' } }, count: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } }


    ];




    Visit.aggregate(
        pipeline,
        // cursor({ batchSize: 1000 }),
        function (err, result) {
            if (err) {
                console.log(err);
            }
            else {
                res.json(result);
            }
        });


}
exports.getVisitsByRequester = function (req, res, next) {

    Visit.find({ requesterID: req.params.requesterID }, function (err, data) {
        if (err) {
            res.send(err);
            console.log(err);

        }
        res.json(data);

        var _send = res.send;
        var sent = false;
        res.send = function (data) {
            if (sent) return;
            _send.bind(res)(data);
            sent = true;
        };
        next();

    });

}
exports.UpdateVisit = function (req, res, next) {

    console.log('request', req.body)
    Visit.findByIdAndUpdate(req.body._id, { $set: req.body }, { new: true },
        function (err, request) {
            if (err) {
                res.send(err);
            } else {
                res.json(request);
            }
        });
}

exports.createVisit = function (req, res, next) {
    console.log('request', req.body)
    Visit.create(req.body, function (err, Visit) {

        if (err) {
            res.send(err);
        }
        res.json(Visit);


    });

}

exports.deleteVisit = function (req, res, next) {

    Visit.remove({
        _id: req.params.visitID
    }, function (err, visit) {
        res.json(visit);
    });

}


/**
 * 每月门诊量统计查询
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.getMonthlyVisits = function (req, res, next) {
    console.log('---------------------------------------------------');
    console.log('-------------------------profileId--------------------------'+ req.body.profileId);
    console.log('-------------------------yearStr--------------------------'+ req.body.yearStr);
    let profileId = String(req.body.profileId);
    let yearStr = String(req.body.yearStr);
    var pipeline = [
        {
            $match: {
                profiles: { $elemMatch: { '_id': profileId } },
                visitDate: { $regex: yearStr },
                visitDate: { $ne: null }
            }
        },
        { $group: { _id: { month: { $month: '$visitDate' } }, count: { $sum: 1 } } },
		{ $sort: { '_id.month': 1 } }
        // {
        //     $group: {
        //         _id: null,
        //         total: { $sum: "$count" },
        //         mon: { $push: { count: "$count", mon: "$_id" } }
        //     }
        // },
        // { $unwind: "$mon" },
        // {
        //     $addFields: {
        //         mon: "$mon.mon",
        //         count: "$mon.count",
        //         percent_with_this_month: { $multiply: [{ $divide: ["$mon.count", "$total"] }, 100] },
        //         total: "$$REMOVE"
        //     }
        // }
    ];

    Visit.aggregate(pipeline, function (err, result) {
        if (err) {
            console.log(err);
        } else {
            console.log(result);
            res.json(result);
        }
    });
}