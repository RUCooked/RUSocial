// delete_marketplace.js
const pool = require('./db');

exports.handler = async (event) => {
    try {
        const body = event.body;
        const { postsId } = body;

        if (!postsId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Missing postsId parameter' }),
            };
        }

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // Check if the post exists
            const [postRows] = await connection.execute(
                `SELECT title FROM marketplace_posts WHERE postsId = ?`,
                [postsId]
            );

            if (postRows.length === 0) {
                await connection.rollback();
                return {
                    statusCode: 404,
                    body: JSON.stringify({ message: 'The post does not exist' }),
                };
            }

            const postTitle = postRows[0].title;

            // Delete from marketplace_images
            await connection.execute(
                `DELETE FROM marketplace_images WHERE postId = ?`,
                [postsId]
            );

            // Delete from marketplace_posts
            await connection.execute(
                `DELETE FROM marketplace_posts WHERE postsId = ?`,
                [postsId]
            );

            await connection.commit();

            return {
                statusCode: 200,
                body: JSON.stringify({ message: `The marketplace post '${postTitle}' was deleted successfully!` }),
            };
        } catch (err) {
            await connection.rollback();
            console.error('Error deleting post:', err);
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'Failed to delete post' }),
            };
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error in delete_marketplace handler:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' }),
        };
    }
};
