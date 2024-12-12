const pool = require('./db');
exports.handler = async (event) => {
    try {
        const params = event.queryStringParameters;
        const {
            postsId,
            user_id,
            created_at,
            updated_at,
            title,
            product_description,
            product_price
        } = params;

        let query = `SELECT * FROM marketplace_posts`;
        let conditions = [];
        let values = [];

        if (postsId) {
            conditions.push('postsId = ?');
            values.push(postsId);
        }
        if (user_id) {
            conditions.push('user_id = ?');
            values.push(user_id);
        }
        if (created_at) {
            conditions.push('date_posted LIKE ?');
            values.push(`${created_at}%`);
        }
        if (updated_at) {
            conditions.push('updated_at LIKE ?');
            values.push(`${updated_at}%`);
        }
        if (title) {
            conditions.push('title LIKE ?');
            values.push(`%${title}%`);
        }
        if (product_description) {
            conditions.push('product_description LIKE ?');
            values.push(`%${product_description}%`);
        }
        if (product_price) {
            conditions.push('product_price = ?');
            values.push(product_price);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        const connection = await pool.getConnection();

        try {
            const [rows] = await connection.query(query, values);

            // Format and return the results
            const formattedRows = rows.map(row => ({
                postsId: row.postsId,
                user_id: row.user_id,
                title: row.title,
                product_description: row.product_description,
                product_price: row.product_price,
                date_posted: row.date_posted,
                updated_at: row.updated_at,
            }));

            return {
                statusCode: 200,
                body: JSON.stringify(formattedRows),
            };
        } catch (err) {
            console.error('Error retrieving posts:', err);
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'Failed to retrieve posts' }),
            };
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error in get_marketplace handler:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' }),
        };
    }
};
