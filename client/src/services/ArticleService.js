import axios from 'axios';
const API_URL = '/api/articles/';

const createArticle = async (articleData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }
    
    const response = await axios.post(API_URL, articleData, config);
    return response.data;
}

const getArticle = async () => {
    const response = await axios.get(API_URL);
    return response.data;
}

const deleteArticle = async (id, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }
    const response = await axios.delete(API_URL + id, config);
    return response.data;
} 

const updateArticle = async (id, articleData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
    const response = await axios.put(`/api/articles/${id}`, articleData, config);
    return response.data;
};

const articleService = { createArticle, getArticle, deleteArticle, updateArticle };
export default articleService;