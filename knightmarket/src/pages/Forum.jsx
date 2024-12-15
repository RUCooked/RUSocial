import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Container, Button, Card, Badge } from 'react-bootstrap';
import { PlusCircle, ChatLeftText } from 'react-bootstrap-icons';

function Forum() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const fetchPosts = async () => {
        try {
            // Example: Assume user is authenticated for now
            setIsAuthenticated(true);

            const response = await axios.get('https://r0s9cmfju1.execute-api.us-east-2.amazonaws.com/cognito-testing/forum', {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const parsedBody = typeof response.data.body === 'string'
                ? JSON.parse(response.data.body)
                : response.data.body;

            const apiListings = Array.isArray(parsedBody.posts)
                ? parsedBody.posts.map(post => ({
                    id: post.id,
                    title: post.title,
                    content: post.body,
                    author_id: post.author_id,
                    image: post.image_url || null,
                    datePosted: post.created_at,
                    updatedAt: post.updated_at,
                    author: post.author,
                    comments: post.comments,
                }))
                : [];

            setPosts(apiListings);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching listings:', err);
            setError(err.response?.data?.message || 'Failed to load listings. Please try again later.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <Container className="py-4">
            {/* Header Section */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-2">Forum</h2>
                    <p className="text-muted">Join the conversation with fellow students</p>
                </div>
                {isAuthenticated && (
                    <Button
                        as={Link}
                        to="/create-post"
                        variant="success"
                        className="d-flex align-items-center gap-2"
                    >
                        <PlusCircle size={20} />
                        Create Post
                    </Button>
                )}
            </div>

            {/* Loading and Error States */}
            {loading && <p>Loading posts...</p>}
            {error && <p className="text-danger">{error}</p>}

            {/* Posts Section */}
            {!loading && !error && posts.length > 0 ? (
                <div className="d-flex flex-wrap gap-3">
                    {posts.map((post) => (
                        <Card key={post.id} className="shadow-sm" style={{ width: '18rem' }}>
                            {post.image ? (
                                <Card.Img
                                    variant="top"
                                    src={post.image}
                                    alt={post.title}
                                    style={{ height: '150px', objectFit: 'cover' }}
                                />
                            ) : (
                                <Card.Img
                                    variant="top"
                                    src="https://via.placeholder.com/150"
                                    alt="Placeholder"
                                    style={{ height: '150px', objectFit: 'cover' }}
                                />
                            )}
                            <Card.Body>
                                <Card.Title>{post.title}</Card.Title>
                                <Card.Subtitle className="mb-2 text-muted">
                                    Posted by {post.author?.username || 'Unknown'} on{' '}
                                    {new Date(post.datePosted).toLocaleDateString()}
                                </Card.Subtitle>
                                <Card.Text>
                                    {post.content && post.content.length > 100
                                        ? `${post.content.slice(0, 100)}...`
                                        : post.content || "No content available"}
                                </Card.Text>
                                <div className="d-flex justify-content-between align-items-center">
                                    <Badge bg="secondary">
                                        <ChatLeftText size={14} /> {Array.isArray(post.comments) ? post.comments.length : 'No Comments'}
                                    </Badge>
                                    <Button
                                        variant="outline-primary"
                                        as={Link}
                                        to={`/post/${post.id}`}
                                        size="sm"
                                    >
                                        Read More
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    ))}
                </div>
            ) : (
                !loading && <p>No posts available.</p>
            )}
        </Container>
    );
}

export default Forum;
