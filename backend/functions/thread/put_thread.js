const mysql = require('mysql2/promise');

exports.handler = async (data, pool) => {
    console.log('PUT handler started');
    console.log('Received data:', JSON.stringify(data));
    try {
        const {id, owner_id, name, description, moderator_id} = data;

        if (!id || !owner_id) {
            return generateResponse(400, { message: 'id and owner_id are required'});
        }
        console.log(id, owner_id);

        if (name || description || moderator_id) {

            const [threads] = await pool.execute(
                `SELECT * FROM threads WHERE id = ?`, [id]);
            
            console.log('Found threads:', threads);

            if (threads.length === 0) {  // Changed > to ===
                return generateResponse(404, { 
                    message: 'Thread not found'
                });
            }

            const [moderators] = await pool.execute(`
                SELECT * FROM moderators
                WHERE user_id = ? AND thread_id = ?
            `, [owner_id, id]);

            console.log('Found moderators:', moderators);

            if (threads[0].owner_id == owner_id 
                || moderators.length > 0) {

                const updates = [];
                const values = [];

                if (name) {
                    updates.push('name = ?');
                    values.push(name);
                }
                if (description) {
                    updates.push('description = ?');
                    values.push(description);
                }
                values.push(id);  

                // Only execute update if there are fields to update
                if (updates.length > 0) {
                    await pool.execute(`
                        UPDATE threads 
                        SET ${updates.join(', ')}
                        WHERE id = ?
                    `, values);
                }

                // Handle moderator addition
                if (moderator_id) {
                    const [existingMod] = await pool.execute(
                        `SELECT * FROM moderators WHERE 
                        user_id = ? AND thread_id = ?`, 
                        [moderator_id, id]
                    );

                    if (existingMod.length > 0) {
                        return generateResponse(409, { 
                            message: 'moderator for this thread already exists'
                        });
                    }

                    await pool.execute(
                        `INSERT INTO moderators (user_id, thread_id)
                        VALUES (?, ?)`, 
                        [moderator_id, id]
                    );
                }

                // Fixed response - removed reference to undefined 'posts' variable
                return generateResponse(200, { 
                    message: 'Thread updated successfully',
                    updated_thread_id: id
                });
            } else {
                return generateResponse(403, { 
                    message: 'Not authorized to update this thread' 
                });
            }
        } else {
            return generateResponse(400, { 
                message: 'Either name, description, or moderator must be changed'
            });
        }
        
    } catch (e) {
        console.error('Update Thread Error:', e);
        return generateResponse(500, { 
            message: 'Internal server error', 
            error: e.message
        });
    }
};