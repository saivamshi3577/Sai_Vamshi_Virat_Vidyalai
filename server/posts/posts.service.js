const axios = require('axios');

async function fetchPosts(start = 0, limit = 10) {
  try {
    const response = await axios.get('https://jsonplaceholder.typicode.com/posts');
    const posts = response.data.slice(start, start + limit);
    return posts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
}
module.exports = {
  fetchPosts,
};
