
exports.handler = async (data, pool) => {
    console.log('DELETE handler started');
    console.log('Received data:', JSON.stringify(data));
    try {

        const { id, author_id } = data
        console.log(id, author_id);

        if (!id || !author_id) {
            return generateResponse(400, { message: 'post id and author_id is required'})
        } 
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

        const numericAuthorId = parseInt(author_id);
        const postAuthorId = parseInt(posts[0].author_id);
        const threadOwnerId = posts[0].thread_owner_id ? parseInt(posts[0].thread_owner_id) : null;

        console.log('Types:', {
            numericAuthorId: typeof numericAuthorId,
            postAuthorId: typeof postAuthorId,
            threadOwnerId: typeof threadOwnerId
        });

        if (postAuthorId === numericAuthorId 
            || moderators.length > 0 
            || threadOwnerId === numericAuthorId) {
            try {
                await pool.execute(`
                DELETE FROM forum_posts WHERE id = ?`, [id]);
                return generateResponse(200, { 
                    message: `Post ${posts[0].title} successfully deleted`,
                    deleted_post_id: id,
                    thread_id: posts[0].thread_id});
            } catch (e) {
                console.log("Delete Post Error: ", e);
                return generateResponse(500, { 
                    message: 'Internal Server Error', 
                    error: e.message,});
            }
        } else {
            return generateResponse(403, { 
                message: 'Post not deleted. Not authorized to delete this post'});
        }
    } catch (e) {
        console.error('Delete Forum Error:', e);
        return generateResponse(500, { 
            message: 'Internal server error', 
            error: e.message,}) 
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