exports.handler = async (queryParams, pool) => {
    console.log('GET handler started');
    console.log('Received data:', JSON.stringify(queryParams));
    try {
        let baseQuery = 'SELECT * FROM forum_posts';
        const conditions = [];
        const params = [];

        // Extract allowed query parameters
        if (queryParams && Object.keys(queryParams).length > 0) {
            const {
                id,
                title,
                body,
                author_id,
                created_at,
                
            } = queryParams;

            if (id) {
                const ids = id.split(',');
                conditions.push(`id IN (${ids.map(() => '?').join(',')})`);
                params.push(...ids);
            }
            if (title) {
                conditions.push('title = ?');
                params.push(title);
            }
            if (body) {
                conditions.push('body = ?');
                params.push(body);
            }
            if (author_id) {
                const author_ids = author_id.split(',');
                conditions.push(`author_id IN (${author_ids.map(() => '?').join(',')})`);
                params.push(...author_ids);
            }
            if (created_at) {
                conditions.push('created_at LIKE ?');
                params.push(`%${created_at}%`);
            }
            if (conditions.length > 0) {
                baseQuery += ' WHERE ' + conditions.join(' AND ');
            }
        }

        // fetch posts based on parameters
        const [posts] = await pool.execute(baseQuery, params);

        const fetchAuthorData = async (authorIds) => {
            if (authorIds.length === 0) return {};

            const placeholders = authorIds.map(() => '?').join(',');
            const [authors] = await pool.execute(
                `SELECT id, username 
                FROM users 
                WHERE id IN (${placeholders})`,
                authorIds
            );

            const authorData = {};
            authors.forEach(author => {
                authorData[author.id] = {
                    username: author.username
                };
            });
            return authorData;
        };

        const postIds = posts.map(post => post.id);
        const authorIds = [...new Set(posts.map(post => post.author_id))];

        const [voteData, commentData, authorData] = await Promise.all([
            fetchVoteData(postIds),
            fetchCommentData(postIds), 
            fetchAuthorData(authorIds)
        ]);

        const enrichedPosts = posts.map(post => ({
            ...post,
            votes: voteData[post.id] || { upvotes: 0, downvotes: 0, total_votes: 0 },
            comments: commentData[post.id] || { comments: 'Not Available'},
            author: authorData[post.author_id] || { username: 'Unknown' }
        }));

        const response = {
            posts: enrichedPosts,
            count: enrichedPosts.length
        };

        return generateResponse(
            enrichedPosts.length > 0 ? 200 : 404,
            enrichedPosts.length > 0 ? response : { message: 'No posts found' }
        );

    } catch (error) {
        console.error('Get Posts Error:', error);
        return generateResponse(500, { 
            message: 'Internal Server Error',
            error: error.message 
        });
    }
};

function generateResponse(statusCode, body) {
    return {
        statusCode: statusCode,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    };
}
