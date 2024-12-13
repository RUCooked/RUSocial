// import { API_ENDPOINTS } from "../config/apis";

// export const addUserToDatabase = async (userAttributes) => {
//     try {
//         const response = await fetch(API_ENDPOINTS.USER, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({
//                 'username': userAttributes.username,
//                 'email': userAttributes.email,
//                 'bio': '',
//             })
//         },);

//         if (!response.ok) {
//             throw new Error('Failed to create user in database');
//         }

//         const data = await response.json();
//         console.log('User added to database:', data);

//     } catch (error) {
//         console.error('User creation error:', error);
//         throw new Error('User creation failed: ' + error.message);
//     }
// };