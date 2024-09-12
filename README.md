# Tokencord
A robust and secure invite-only chat platform, engineered with Express and WebSockets and backed by MySQL. This platform is designed for easy deployment and scalability, whether hosted locally for personal use or scaled up with Nginx for broader application. It ensures that your data remains private, without reliance on third-party servers. A high-performance, secure messaging solution that prioritizes scalability needs while being user friendly.

<b>Performance:</b> Tested to support up to 1000 concurrent users locally, contingent on the specifications and bandwidth of both the client and server.

<b>Flexibility:</b> The backend architecture is versatile, enabling the creation of analogous mobile applications for iOS and Android. Developers with proficiency in WebSockets and API integrations can seamlessly extend the service across different platforms. 

# Features
- [x] Token Based authentication
- [x] Image upload supported (Gif's are also animated)
- [x] Profile Edits
- [x] Bot gateway/accounts supports (A Basic bot has been provided in js/bot.js for reference)
- [x] Server disconnected error page
- [x] Offline/Online status and live updates just like discord
- [x] Accounts bannable from Backend dashboard
- [x] Typing indicators just like discord
- [ ] Videos support
- [ ] Rich Markdown
- [ ] Custom Emoji's
- [ ] Polls

# Preview
![Login](https://firebasestorage.googleapis.com/v0/b/nanochat-beta.appspot.com/o/Screenshot%202024-09-11%20at%2010.10.57%E2%80%AFPM.png?alt=media&token=73fa28fd-6639-4b67-a616-f7b5e0aad0ed)
![home](https://firebasestorage.googleapis.com/v0/b/nanochat-beta.appspot.com/o/Screenshot%202024-09-11%20at%2010.06.33%E2%80%AFPM.png?alt=media&token=f1c962db-887f-485c-8820-50bdfff356d0)
![Typing](https://firebasestorage.googleapis.com/v0/b/nanochat-beta.appspot.com/o/Screenshot%202024-09-11%20at%2010.01.47%E2%80%AFPM.png?alt=media&token=ec3d0f41-285f-41e2-8db8-382c52da57de)
![Image](https://firebasestorage.googleapis.com/v0/b/nanochat-beta.appspot.com/o/Screenshot%202024-09-11%20at%2010.00.24%E2%80%AFPM.png?alt=media&token=5aecb6a6-04bf-4bce-9dc3-357549c93acd)
![Profile](https://firebasestorage.googleapis.com/v0/b/nanochat-beta.appspot.com/o/Screenshot%202024-09-11%20at%2010.00.09%E2%80%AFPM.png?alt=media&token=fb209a27-d7d9-42fb-bbf4-bc230c2d8421)
![Large](https://firebasestorage.googleapis.com/v0/b/nanochat-beta.appspot.com/o/Screenshot%202024-09-11%20at%2010.00.40%E2%80%AFPM.png?alt=media&token=135fa84f-b3b6-4f57-8369-08243493695d)
![Banned](https://firebasestorage.googleapis.com/v0/b/nanochat-beta.appspot.com/o/Screenshot%202024-09-11%20at%2010.03.33%E2%80%AFPM.png?alt=media&token=88961da6-36be-4549-9c50-9898dba00263)
![Disconnected](https://firebasestorage.googleapis.com/v0/b/nanochat-beta.appspot.com/o/Screenshot%202024-09-11%20at%2010.02.04%E2%80%AFPM.png?alt=media&token=a4a51757-b7f4-4f3e-a277-812747949e72)
![Bot](https://firebasestorage.googleapis.com/v0/b/nanochat-beta.appspot.com/o/Screenshot%202024-09-11%20at%2010.06.02%E2%80%AFPM.png?alt=media&token=66a3b5fd-5cb2-4663-979f-799e2bc057be)

# Local Setup Guide
<b>Step 1:</b>
Clone the repo and do `npm install`

<b>Step 2:</b> Create a MySQL database and fill in the credentials at `.env` file in root directory. `PORT` can be of your choice.

<b>Step 3:</b> Use a MySQL command line client and run the queries listed below

```
CREATE TABLE "messages" (
    "id" bigint NOT NULL,
    "u_id" bigint DEFAULT NULL,
    "m_content" text,
    PRIMARY KEY ("id")
)
```
```

CREATE TABLE "users" (
    "id" bigint NOT NULL,
    "name" varchar(20) DEFAULT NULL,
    "email" varchar(20) DEFAULT NULL,
    "authkey" varchar(50) DEFAULT NULL,
    "status" int DEFAULT NULL,
    "emailVerified" tinyint(1) DEFAULT NULL,
    "authprotocol" bigint DEFAULT NULL,
    "tag" varchar(50) DEFAULT NULL,
    "avatar" text,
    PRIMARY KEY ("id")
)
```
**Note:** You can choose the number of partitions based on your usage and requirements. However, if you are using for a small group then don’t worry about them.

<b>Step 4:</b> Do `node server.js` in cmd and the server should be running. Head to `http://localhost:your_port_here` to verify that it is working properly.

<b>Step 5:</b> To create a token/account use postmen or api client which supports POST request and create a request to `http://localhost:your_port_here/request` with username, email and password as headers. This should return you a token in response body, Use it to login.

<b>Step 6:</b> For bot accounts use a Database client and change the `tag` in users table.

<b>Step 7:</b> This should make site accessible in your local network. However, if you want the site to be accessible globally then use `port forwarding` method.


