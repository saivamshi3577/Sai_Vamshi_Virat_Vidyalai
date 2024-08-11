import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import styled from '@emotion/styled';
import Container from '../common/Container';
import useWindowWidth from '../hooks/useWindowWidth';


const PostListContainer = styled.div(() => ({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
}));

const LoadMoreButton = styled.button(() => ({
  padding: '10px 20px',
  backgroundColor: '#007bff',
  color: '#fff',
  border: 'none',
  borderRadius: 5,
  cursor: 'pointer',
  fontSize: 16,
  marginTop: 20,
  transition: 'background-color 0.3s ease',
  fontWeight: 600,

  '&:hover': {
    backgroundColor: '#0056b3',
  },
  '&:disabled': {
    backgroundColor: '#808080',
    cursor: 'default',
  },
}));

const PostContainer = styled.div(() => ({
  width: '300px',
  margin: '10px',
  border: '1px solid #ccc',
  borderRadius: '5px',
  overflow: 'hidden',
}));

const CarouselContainer = styled.div(() => ({
  position: 'relative',
  width: '100%',
  overflow: 'hidden',
}));

const Carousel = styled.div(() => ({
  display: 'flex',
  overflowX: 'scroll',
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
  position: 'relative',
  scrollSnapType: 'x mandatory',
}));

const CarouselItem = styled.div(() => ({
  flex: '0 0 auto',
  scrollSnapAlign: 'start',
}));

const Image = styled.img(() => ({
  width: '100%',
  height: 'auto',
  maxHeight: '300px',
  display: 'block',
}));

const Content = styled.div(() => ({
  padding: '10px',
  '& > h2': {
    marginBottom: '16px',
  },
}));

const Button = styled.button(() => ({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  backgroundColor: 'rgba(255, 255, 255, 0.7)', // Semi-transparent background
  border: 'none',
  color: '#000',
  fontSize: '20px',
  cursor: 'pointer',
  height: '50px',
  width: '30px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10, // Ensure buttons are above images
  transition: 'background-color 0.3s ease',

  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Darker on hover
  },
}));

const PrevButton = styled(Button)`
  left: 0;
`;

const NextButton = styled(Button)`
  right: 0;
`;

const UserInfoContainer = styled.div(() => ({
  display: 'flex',
  alignItems: 'center',
  padding: '10px',
  backgroundColor: '#ffffff',
  borderBottom: '1px solid #ddd',
}));
const UserInitials = styled.div(() => ({
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  backgroundColor: '#ddd',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
  marginRight: '10px',
}));
const UserInfo = styled.div(() => ({
  display: 'flex',
  flexDirection: 'column',
}));


const Post = ({ post, user }) => {
  const carouselRef = useRef(null);

  const handleNextClick = () => {
    if (carouselRef.current) {
      const itemWidth = carouselRef.current.querySelector('img').clientWidth;
      carouselRef.current.scrollBy({
        left: itemWidth + 20,
        behavior: 'smooth',
      });
    }
  };

  const handlePrevClick = () => {
    if (carouselRef.current) {
      const itemWidth = carouselRef.current.querySelector('img').clientWidth;
      carouselRef.current.scrollBy({
        left: -(itemWidth + 20),
        behavior: 'smooth',
      });
    }
  };

  const formatInitials = (name) => {
    const [firstName, lastName] = name.split(' ');
    return `${firstName[0]}${lastName ? lastName[0] : ''}`;
  };

  return (
    <PostContainer>
      <UserInfoContainer>
        <UserInitials>{formatInitials(user.name)}</UserInitials>
        <UserInfo>
          <strong>{user.name}</strong>
          <span>{user.email}</span>
        </UserInfo>
      </UserInfoContainer>
      <CarouselContainer>
        <Carousel ref={carouselRef}>
          {post.images.map((image, index) => (
            <CarouselItem key={index}>
              <Image src={image.url} alt={post.title} />
            </CarouselItem>
          ))}
        </Carousel>
        <PrevButton onClick={handlePrevClick}>&#10094;</PrevButton>
        <NextButton onClick={handleNextClick}>&#10095;</NextButton>
      </CarouselContainer>
      <Content>
        <h2>{post.title}</h2>
        <p>{post.body}</p>
      </Content>
    </PostContainer>
  );
};


export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  const { isSmallerDevice } = useWindowWidth;

  const fetchPosts = async (page, limit) => {
    try {
      const { data: fetchedPosts } = await axios.get('/api/v1/posts', {
        params: { start: page * limit, limit },
      });
      if (fetchedPosts.length === 0) {
        setHasMorePosts(false);
      }
      setPosts((prevPosts) => [...prevPosts, ...fetchedPosts]);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data: fetchedUsers } = await axios.get('https://jsonplaceholder.typicode.com/users');
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchPosts(page, isSmallerDevice ? 5 : 10);
    fetchUsers();
  }, [page, isSmallerDevice]);

  const handleClick = () => {
    setIsLoading(true);
    setPage((prevPage) => prevPage + 1);
    setIsLoading(false);
  };
  return (
    <Container>
      <PostListContainer>
        {posts.map((post, index) => {
          const user = users[index % users.length];
          return <Post key={post.id} post={post} user={user} />;
        })}
      </PostListContainer>

      {hasMorePosts && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <LoadMoreButton onClick={handleClick} disabled={isLoading}>
            {!isLoading ? 'Load More' : 'Loading...'}
          </LoadMoreButton>
        </div>
      )}
    </Container>
  );
}