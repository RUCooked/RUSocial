// put_marketplace.js
const pool = require('./db'); // Ensure this is using mysql2/promise

exports.handler = async (event) => {
    try {
        // Parse the JSON body
        const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
        let { postsId, title, product_description, product_price, images_url } = body;

        // Validate postsId
        if (!postsId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Missing postsId' }),
            };
        }

        // Check if there are fields to update
        if (!title && !product_description && !product_price && !images_url) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'No fields to update' }),
            };
        }

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // Check if the post exists
            const [postRows] = await connection.execute(
                `SELECT * FROM marketplace_posts WHERE postsId = ?`,
                [postsId]
            );

            if (postRows.length === 0) {
                await connection.rollback();
                return {
                    statusCode: 404,
                    body: JSON.stringify({ message: 'The post does not exist' }),
                };
            }

            // Build update query dynamically
            let updateFields = [];
            let values = [];

            if (title) {
                updateFields.push('title = ?');
                values.push(title);
            }
            if (product_description) {
                updateFields.push('product_description = ?');
                values.push(product_description);
            }
            if (product_price) {
                updateFields.push('product_price = ?');
                values.push(product_price);
            }

            if (updateFields.length > 0) {
                updateFields.push('updated_at = ?');
                values.push(new Date());

                const updateQuery = `UPDATE marketplace_posts SET ${updateFields.join(', ')} WHERE postsId = ?`;
                values.push(postsId);

                await connection.execute(updateQuery, values);
            }

            // If images_url is provided, handle image updates
            if (images_url) {
                // Split the images_url string into an array, trim spaces, and filter out empty strings
                images_url = images_url.split(',').map(url => url.trim()).filter(url => url);

                if (Array.isArray(images_url) && images_url.length > 0) {
                    const imageInserts = images_url.map((url) => [postsId, url]);

                    // Delete existing images for the post
                    await connection.execute(
                        `DELETE FROM marketplace_images WHERE postId = ?`,
                        [postsId]
                    );

                    // Bulk insert new images
                    const insertQuery = `INSERT INTO marketplace_images (postId, url) VALUES ?`;
                    await connection.query(insertQuery, [imageInserts]);
                }
            }

            await connection.commit();

            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: `The marketplace post '${title || 'updated'}' was updated successfully!`,
                }),
            };
        } catch (err) {
            await connection.rollback();
            console.error('Error updating post:', err);
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'Failed to update post' }),
            };
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error in put_marketplace handler:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' }),
        };
    }
};
