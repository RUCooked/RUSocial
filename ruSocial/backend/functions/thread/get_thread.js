const mysql = require('mysql2/promise');

exports.handler = async (queryParams, pool) => {
    console.log('GET Threads handler started');
    console.log('Received data:', JSON.stringify(queryParams));
    try {
        let baseQuery = 'SELECT * FROM threads';
        const conditions = [];
        const params = [];

        if (queryParams && Object.keys(queryParams).length > 0) {
            const {
                id,
                owner_id,
                name,
                description,
                created_at
            } = queryParams;

            if (id) {
                const ids = id.split(',');
                conditions.push(`id IN (${ids.map(() => '?').join(',')})`);
                params.push(...ids);
            }
            if (owner_id) {
                const owner_ids = owner_id.split(',');
                conditions.push(`owner_id IN (${owner_ids.map(() => '?').join(',')})`);
                params.push(...owner_ids);
            }
            if (name) {
                conditions.push('name = ?');
                params.push(name);
            }
            if (description) {
                conditions.push('description LIKE ?');
                params.push(`%${description}%`);
            }
            if (created_at) {
                conditions.push('created_at LIKE ?');
                params.push(`%${created_at}%`);
            }

            if (conditions.length > 0) {
                baseQuery += ' WHERE ' + conditions.join(' AND ');
            }
        }

        const [threads] = await pool.execute(baseQuery, params);

        const fetchThreadPosts = async (threadIds) => {
            if (threadIds.length === 0) return {};

            const placeholders = threadIds.map(() => '?').join(',');
            const [posts] = await pool.execute(
                `SELECT id, title, body, author_id, thread_id, created_at, updated_at, image_url
                FROM forum_posts 
                WHERE thread_id IN (${placeholders})
                ORDER BY created_at DESC`,
                threadIds
            );

            const postsByThread = {};
            posts.forEach(post => {
                if (!postsByThread[post.thread_id]) {
                    postsByThread[post.thread_id] = [];
                }
                postsByThread[post.thread_id].push(post);
            });

            return postsByThread;
        };

        const fetchThreadFollowers = async (threadIds) => {
            if (threadIds.length === 0) return {};

            const placeholders = threadIds.map(() => '?').join(',');
            const [followers] = await pool.execute(
                `SELECT tf.thread_id, tf.user_id, u.username
                FROM threads_following tf
                JOIN users u ON tf.user_id = u.id
                WHERE tf.thread_id IN (${placeholders})`,
                threadIds
            );

            const followersByThread = {};
            followers.forEach(follower => {
                if (!followersByThread[follower.thread_id]) {
                    followersByThread[follower.thread_id] = [];
                }
                followersByThread[follower.thread_id].push({
                    user_id: follower.user_id,
                    username: follower.username
                });
            });

            return followersByThread;
        };

        const fetchOwnerData = async (ownerIds) => {
            if (ownerIds.length === 0) return {};

            const placeholders = ownerIds.map(() => '?').join(',');
            const [owners] = await pool.execute(
                `SELECT id, username 
                FROM users 
                WHERE id IN (${placeholders})`,
                ownerIds
            );

            const ownerData = {};
            owners.forEach(owner => {
                ownerData[owner.id] = {
                    username: owner.username
                };
            });
            return ownerData;
        };

        const threadIds = threads.map(thread => thread.id);
        const ownerIds = [...new Set(threads.map(thread => thread.owner_id))];

        const [postsData, followersData, ownerData] = await Promise.all([
            fetchThreadPosts(threadIds),
            fetchThreadFollowers(threadIds),
            fetchOwnerData(ownerIds)
        ]);

        const enrichedThreads = threads.map(thread => ({
            ...thread,
            posts: postsData[thread.id] || [],
            followers: followersData[thread.id] || [],
            owner: ownerData[thread.owner_id] || { username: 'Unknown' },
            post_count: (postsData[thread.id] || []).length,
            follower_count: (followersData[thread.id] || []).length
        }));

        const response = {
            threads: enrichedThreads,
            count: enrichedThreads.length
        };

        return generateResponse(
            enrichedThreads.length > 0 ? 200 : 404,
            enrichedThreads.length > 0 ? response : { message: 'No threads found' }
        );

    } catch (error) {
        console.error('Get Threads Error:', error);
        return generateResponse(500, { 
            message: 'Internal Server Error',
            error: error.message 
        });
    }
};

function generateResponse(statusCode, body) {
    return {
        statusCode: statusCode,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    };
}