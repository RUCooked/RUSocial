import React, { useState } from 'react';


const Profile = () => {
  const [followed, setFollowed] = useState(false);  // State for follow/unfollow

  // Toggle follow/unfollow button
  const handleFollowClick = () => {
    setFollowed(!followed);
  };

  return (
    <div className="profile">
      <div className="profile-header">
        <div className="profile-picture">
          <img src="https://via.placeholder.com/150" alt="Profile" />
        </div>
        <div className="profile-info">
          <h1>Jane Doe</h1>
          <p>@janedoe</p>
          <button onClick={handleFollowClick} className="follow-btn">
            {followed ? 'Following' : 'Follow'}
          </button>
        </div>
      </div>

      <div className="user-details">
        <p className="bio">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam eget libero at turpis tempor facilisis.
        </p>
        <div className="stats">
          <div><strong>120</strong> Posts</div>
          <div><strong>1.2k</strong> Followers</div>
          <div><strong>180</strong> Following</div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
