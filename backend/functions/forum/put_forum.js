
exports.handler = async (data, pool) => {
    console.log('PUT handler started');
    console.log('Received data:', JSON.stringify(data));
    try {
        const {id, title, body, author_id, image_url, vote} = data;

        if (!id || !author_id) {
            return generateResponse(400, { message: 'post id and author_id are required'});
        }

        if (body || title || image_url) {

            const [posts] = await pool.execute(`
            SELECT forum_posts.*, threads.owner_id as thread_owner_id 
            FROM forum_posts 
            JOIN threads ON forum_posts.thread_id = threads.id 
            WHERE forum_posts.id = ?`, [id]);

            if (posts.length === 0) {
                return generateResponse(404, { 
                    message: 'Post not found'
                });
            }

            const [moderators] = await pool.execute(`
                SELECT * FROM moderators
                WHERE user_id = ? AND thread_id = ?
            `, [author_id, posts[0].thread_id]);

            if (posts[0].author_id == author_id || 
                moderators.length > 0 || 
                posts[0].thread_owner_id == author_id) {
                
                const updates = [];
                const values = [];
                if (title) {
                    updates.push('title = ?');
                    values.push(title);
                }
                if (body) {
                    updates.push('body = ?');
                    values.push(body);
                }
                if (image_url) {
                    updates.push('image_url = ?');
                    values.push(image_url);
                }
                values.push(id);  

                await pool.execute(`
                    UPDATE forum_posts 
                    SET ${updates.join(', ')}, updated_at = NOW()
                    WHERE id = ?
                `, values);

                return generateResponse(200, { 
                    message: 'Post updated successfully',
                    updated_post_id: id,
                    thread_id: posts[0].thread_id})
            } else {
                return generateResponse(403, { 
                    message: 'Not authorized to update this post' });
            }
        } else {
            return generateResponse(400, { 
                message: 'Either title, body, image_url, or vote_count must be changed'});
        }

    } catch (e) {
        console.error('Post Forum Error:', e);
        return generateResponse(500, { 
            message: 'Internal server error', 
            error: e.message,});
    };
}

// Helper function to generate HTTP responses
function generateResponse(statusCode, body) {
    return {
        statusCode: statusCode,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    };
}