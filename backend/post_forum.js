const mysql = require('mysql2/promise')

exports.handler = async (data, pool) => {
    console.log('POST handler started');
    console.log('Received data:', JSON.stringify(data));
    try {
        const {title, body, author_id, image_url=''} = data;
        if (!title || !body || !author_id) {
            return generateResponse(400, { message: 'title, body, and author_id are required'});
        };

        // check to see if there is a duplicate forum (no same title from same author in same thread)
        // if not, create the forum 
        const [exisitingForum] = await pool.execute(
            'SELECT * FROM forum_posts WHERE title = ? AND author_id = ?',
            [title, author_id]
        );

        if (exisitingForum.length > 0) {
            return generateResponse(409, {message: 'Same title and authored post under this thread already exists'})
        } else {
            let currentTime = new Date();
            await pool.execute(
                `INSERT INTO forum_posts
                (title, body, author_id, created_at, updated_at, image_url)
                VALUES (?, ?, ?, ?, ?, ?)`,
                [title, body, author_id, currentTime, currentTime, image_url]
            );
            console.log('Forum successfully created in forum_posts table');

            // retrieves newly created forum
            const [rows] = await pool.execute(
                `SELECT * FROM forum_posts WHERE title = ? AND author_id = ?`,
                [title, author_id]
            );
            const created_post = rows[0]

            // id of newly created forum
            const post_id = created_post?.id;
        

            return generateResponse(201, { message: `Forum '${title}' was created successfully!`});
        };

    } catch (e) {
        console.error('Post Forum Error:', e);
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
