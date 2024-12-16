// post_marketplace.js
const pool = require('./db');
console.log('Post handler started');
exports.handler = async (event) => {
    try {
        console.log('Received event:', JSON.stringify(event, null, 2));
        
        // Check if event.body is already an object or needs parsing
        const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
        console.log('Processed body:', body);

        
        let { user_id, title, product_description, product_price, images_url = ''} = body;
        console.log('Attempting to create post with user_id:', user_id);

        console.log('Extracted data:', {
            user_id,
            title,
            product_description,
            product_price,
            images_url
        });

        
        if (!user_id || !title || !product_description || product_price === undefined || product_price === null) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Missing required fields' }),
            };
        }
        const connection = await pool.getConnection();
        console.log('pool connection succesful');

        try {
            await connection.beginTransaction();
            const currentTimestamp = new Date();

            console.log('About to insert into DB');
            // Insert into marketplace_posts
            const [postResult] = await connection.execute(
                `INSERT INTO marketplace_posts (user_id, title, product_description, product_price, date_posted, updated_at, url)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [user_id, title, product_description, product_price, currentTimestamp, currentTimestamp, images_url]
            );

            console.log('db action executed')
            const postId = postResult.insertId;
            console.log('postId:', postId);
            // If images_url is provided, insert into marketplace_images

            console.log('adding image to marketplace_images')
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
            console.log('mostly done');
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
