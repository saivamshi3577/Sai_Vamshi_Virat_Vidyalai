const express = require('express');
const axios = require('axios');
const { fetchPosts } = require('./posts.service');
const { fetchUserById } = require('../users/users.service');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { start = 0, limit = 10 } = req.query; 
    const posts = await fetchPosts(Number(start), Number(limit));
    const postsWithImages = await Promise.all(
      posts.map(async (post) => {
        try {
          const response = await axios.get(`https://jsonplaceholder.typicode.com/albums/${post.id}/photos`);
          const images = response.data.map((photo) => ({ url: photo.url }));
          return {
            ...post,
            images,
          };
        } catch (error) {
          console.error(`Error fetching photos for album ${post.id}:`, error);
          return {
            ...post,
            images: [],
          };
        }
      })
    );
    res.json(postsWithImages);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
