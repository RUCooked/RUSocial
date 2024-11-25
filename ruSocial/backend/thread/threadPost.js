const mysql = require('mysql2/promise');

exports.handler = async (data, pool) => {
    console.log('POST handler started');
    console.log('Received data:', JSON.stringify(data));
    try {
        const { owner_id, name, description="" } = data;
        if (!owner_id || !name) {
            return generateResponse(400, { message: 'name and owner_id are required'});
        }

        const [existingThread] = await pool.execute(
            `SELECT * FROM threads WHERE name = ?`, [name]);

        console.log(existingThread);
        console.log(existingThread.length);
        if (existingThread.length > 0) {
            return generateResponse(409, {message: 'Same name Thread already exists'})
        } else {
            let currentTime = new Date();
            await pool.execute(
                `INSERT INTO threads
                (owner_id, name, description, created_at)
                VALUES (?, ?, ?, ?)`, [owner_id, name, description, currentTime]
            );
            console.log('Thread successfully created in threads table');

            const [rows] = await pool.execute(
                `SELECT * FROM threads WHERE name = ? AND owner_id = ?`,
                [name, owner_id]);
            const created_thread = rows[0]
            const thread_id = created_thread?.id;

            if (thread_id) {
                await pool.execute(
                    `INSERT INTO moderators
                    (user_id, thread_id, created_at)
                    VALUES (?, ?, ?)`,
                    [owner_id, thread_id, currentTime]
                );
                console.log('Default moderator (thread creator) successfully created in moderators table');
            } else {
                console.log(`Unable to create moderator for Thread ${name} from user_id: ${owner_id}`);
            }
            
            return generateResponse(201, { message: `Thread ${name} was successfully created`});
        }
    } catch (e) {
        console.error('Error: ', e);
        return generateResponse(500, { message: 'Internal Server Error'});
    }
}

function generateResponse (statusCode, body) {
    return {
        statusCode: statusCode,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body),
    };
};