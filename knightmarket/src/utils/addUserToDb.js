import { API_ENDPOINTS } from "../config/apis";

export const addUserToDatabase = async (userAttributes) => {
    const response = await fetch(API_ENDPOINTS.USER, {
        method: 'POST',
        headers: {
            'Content-Type': 'json/application',
            'credentials': 'masterknight:chickenNugget452!'
        },
        body: {
            'email': userAttributes.email,
            'password': '',
        }
    })
}