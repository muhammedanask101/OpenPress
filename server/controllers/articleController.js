const asyncHandler = require('express-async-handler');
const Article = require('../models/articleModel');

const getArticles = asyncHandler(async (req, res) => {
    const articles = await Article.find();
    res.status(200).json(articles);
})

const postArticle = asyncHandler(async (req, res) => {
    if(!req.body || !req.body.title) {
        res.status(400);
        throw new Error('Please input an article');
    }

    const article = await Article.create({ user: req.user.id, title: req.body.title, fileurl: req.body.fileurl, description: req.body.description });
    res.status(200).json(article);
})

const updateArticle = asyncHandler(async (req, res) => {
    const article = await Article.findById(req.params.id);

    if(!article) {
        res.status(400);
        throw Error('article not found');
    }

    const updatedArticle = await Article.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedArticle);
})

const deleteArticle = asyncHandler(async (req, res) => {
    const article = await Article.findById(req.params.id);

    if(!article){
        res.status(400);
        throw new Error('No article found');
    }

    await Article.findByIdAndDelete(req.params.id);

    res.status(200).json({ id: req.params.id });
})

module.exports = { getArticles, postArticle, updateArticle, deleteArticle };