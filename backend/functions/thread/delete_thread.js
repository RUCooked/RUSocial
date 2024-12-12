const mysql = require('mysql2/promise');

exports.handler = async (data, pool) => {
    console.log('DELETE handler started');
    console.log('Received data:', JSON.stringify(data));
    try {

        const { id, author_id } = data
        console.log(id, author_id);

        if (!id || !author_id) {
            return generateResponse(400, { message: 'thread id and author_id is required'})
        } 
        const [threads] = await pool.execute(`
            SELECT * FROM threads
            WHERE threads.id = ?`, [id]);
        
        if (threads.length === 0) {
            return generateResponse(404, { 
                message: 'Thread not found'
            });
        }

        const numericAuthorId = parseInt(author_id);
        const threadOwnerId = parseInt(threads[0].owner_id);

        if (threadOwnerId === numericAuthorId) {
            try {
                await pool.execute(`
                DELETE FROM threads WHERE id = ?`, 
                [id]);
                
                return generateResponse(200, { 
                    message: `Thread '${threads[0].name}' successfully deleted`,
                    deleted_thread_id: id
                });
            } catch (e) {
                console.log("Delete Thread Error: ", e);
                return generateResponse(500, { 
                    message: 'Internal Server Error', 
                    error: e.message
                });
            }
        } else {
            return generateResponse(403, { 
                message: 'Thread not deleted. Not authorized to delete this thread'});
        }
    } catch (e) {
        console.error('Error: ', e);
        return generateResponse(500, { 
            message: 'Internal server error', 
            error: e.message,
        });
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