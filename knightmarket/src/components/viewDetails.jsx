// const handleViewDetails = async (listing) => {
//     try {
//         setSelectedListing(listing);
//         setShowModal(true);

//         console.log('Fetching user details for user_id:', listing.user);

//         // Fetch user details using the user's ID
//         const userResponse = await axios.get(`https://r0s9cmfju1.execute-api.us-east-2.amazonaws.com/cognito-testing/user?id=${listing.user}`, {
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//         });

//         const parsedUser = JSON.parse(userResponse.data.body);
//         console.log('Parsed User:', parsedUser);

//         // Check if users array exists and has entries
//         if (parsedUser.users && Array.isArray(parsedUser.users) && parsedUser.users.length > 0) {
//             const userInfo = parsedUser.users.map(user => ({
//                 userid: user.id,
//                 username: user.username,
//                 email: user.email,
//                 image_url: user.image_url,
//             }));
//             console.log('Formatted User Info:', userInfo);

//             setUserDetails(userInfo[0]); // Use the first user from the array
//         } else {
//             console.warn('Users array is not present or is empty');
//             setUserDetails(null); // Reset user details if no valid data is returned
//         }
//     } catch (err) {
//         console.error('Error fetching user details:', err);
//         setUserDetails(null); // Reset user details on error
//     }
// };