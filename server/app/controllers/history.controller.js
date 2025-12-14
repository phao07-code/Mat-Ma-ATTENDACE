// controllers/history.controller.js
const History = require('../models/history.model');

exports.all = (req, res) => History.all(null, r => res.json({ result: r }));

exports.getLimit = (req, res) => 
    History.getLimit({ limit: req.params.limit }, r => res.json({ result: r }));

exports.getByCardId = (req, res) => 
    History.getByCardId(req.params, r => res.json({ result: r }));

exports.filter = (req, res) => 
    History.filter(req.params.from, req.params.to, req.params.sort || 'DESC', r => res.json({ result: r }));

exports.add = (req, res) => History.add(req.body, r => res.json({ result: r }));

exports.update = (req, res) => History.update(req.body, r => res.json({ result: r })); // body = [{...}, id]

exports.delete = (req, res) => History.delete(req.params.id, r => res.json({ result: r }));