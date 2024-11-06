# SWE
This repository is for all the code related to the Rutgers Software Engineering (14:332:452) Course
Our group:
Haider Abdelrahman, Lukas Arteni, Kashvi Chandwani, Lukas Chang, Romit Ghosh, Daniel Li, Jason Merchan, and Yousef Naam

Level 1 specifications:
Have a rutgers social platform

Level 2 specifications:
reddit type platform

facebook marketplace type platform

Level 3 specifications:
Reddit type - Discussions

Marketplace- buy/sell items

Level 4 specifications:
Shared Log in/Register Users 
- ability to interact on marketplace/reddit needs user

Level 5 specifications:
Search/view in Marketplace/Reddit 
Shared messaging b/w Marketplace/Reddit

Level 6 specifications:
Creating for Reddit:
- post
- Subforum
Creating for Marketplace:
- Listing for Item
User Customization:
- Profile Picture
- Bio
- Username/Password
- Messages
- Access to posts/listings

Level 7 specifications:
Reddit:
- Posts
  - Likes/Dislikes
  - Comments
  - Threads
  - Send to other users
- Subforum
  - Public/Private
  - Subforum Owner special permissions/settings
  
  Marketplace:
- Listing for Item
  - Price
  - Pictures
  - Description/Title
  - Quick Appearance
  - Seller feedback/ratings

  Shared:
- User Customization
  - profile picture customization features
  - Bio text limit
  - Username/password changes
  - Messages
    - send text
    - send pictures
  - Verified Users (have log ins)
    - post
    - comment
    - like/dislike
    - messages
    - search posts
    - followings
  - Unverified Users (guest accounts)
    - can only view posts
    - can search posts

Level 8 specifications:

Everyone is a full stack engineer here!
We do not care if you like front end or backend
We will all be doing everything and learning everything

1) create one central gmail account for our group
  - this will serve as our admit account for everything
  - everyone will have access to this account

  - create SQL database
    - host on azure
      - cosmos DB? free 25 Gb + 1000 RU/s
    - write to entire group in new channel:
      - how to use the database and stuff
      - how to interact with the API's
      - how to create table and table relations (MOST IMPORTANT)
      - anything else you deem necessary to be able to work with the database

  - front page
    - start with a blank home page
    - until we implement the other stuff
    - first implementation:
      - 4 options at the bottom:
        - reddit
        - marketplace
        - settings
        - in the middle: option to create post (+ botton)
      - search bar at the top
      - top right messages button
  
  Reddit:
    - create all required SQL tables as you move through what you need
      - or adjust already created tables for new info you should add
    - have user-based recommendation sub-reddits as the first reddit interaction
    - implement like button and dislike button on each post and put them in a nice place
      - pressing like and dislike button will call an API that will update the database to rank post visibility priority
          - 
      - implement clicking on post and it pops up in its own page
        - that page will have commenting capabilities for logged in users
        - comments can also be liked or disliked, and also replied to 

  marketplace:
    - create all required SQL tables as you move through what you need
      - or adjust already created tables for new info you should add
    - have marketplace posts as the first marketplace interaction
      - sorted by most popular through most viewed (clicked on full post)

  settings:
    - create all required SQL tables as you move through what you need
      - or adjust already created tables for new info you should add
    - user settings
      - username
        - netid-based (immutable)
      - password
        - netid-based (mutable through Rutgers Netid)


  + bottom:
    - no databases needed for this one

  search bar:
    - no databases needed for this one

  messaging system:
    - create all required SQL tables as you move through what you need
      - or adjust already created tables for new info you should add

  logging in:
    - create all required SQL tables as you move through what you need
      - or adjust already created tables for new info you should add

  creating accounts:
    - create all required SQL tables as you move through what you need
      - or adjust already created tables for new info you should add
  
  user permissions (no account or account):
    - no databases needed for this one


