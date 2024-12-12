// post_marketplace.js
const pool = require('./db');
exports.handler = async (event) => {
    try {
        const body = event.body;
        let { user_id, title, product_description, product_price, images_url = ''} = body;
        if (!user_id || !title || !product_description || !product_price) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Missing required fields' }),
            };
        }
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();
            const currentTimestamp = new Date();

            // Insert into marketplace_posts
            const [postResult] = await connection.execute(
                `INSERT INTO marketplace_posts (user_id, title, product_description, product_price, date_posted, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [user_id, title, product_description, product_price, currentTimestamp, currentTimestamp]
            );
            const postId = postResult.insertId;
            // If images_url is provided, insert into marketplace_images
            if (images_url) {
                images_url = images_url.split(',');
                if (Array.isArray(images_url) && images_url.length != 0) {
                    const imageInserts = images_url.map((url) => [
                        postId,
                        url,
                    ]);

                    await connection.query(
                        `INSERT INTO marketplace_images (postid, url) VALUES ?`,
                        [imageInserts]
                    );
                }
            }
            await connection.commit();

            return {
                statusCode: 201,
                body: JSON.stringify({ message: `The post '${title}' was created successfully!` }),
            };
        } catch (err) {
            await connection.rollback();
            console.error('Error creating post:', err);
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'Failed to create post' }),
            };
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error in post_marketplace handler:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' }),
        };
    }
};
