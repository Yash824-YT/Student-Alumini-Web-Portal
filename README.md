

## ⚙️ Setup & Installation

### Prerequisites
- **Node.js** v18+ — [nodejs.org](https://nodejs.org)
- **MongoDB Atlas** account — [mongodb.com/atlas](https://mongodb.com/atlas) (free tier works)
- **Cloudinary** account — [cloudinary.com](https://cloudinary.com) (free tier works)
- **Git** — [git-scm.com](https://git-scm.com)


### Step 2 — MongoDB Atlas Setup

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) → Create free account
2. Create a **new Project** → Create a **free M0 cluster**
3. Under **Database Access** → Add a database user (username + password)
4. Under **Network Access** → Click **+ Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`) for development
5. Click **Connect** on your cluster → **Drivers** → Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/
   ```

---

### Step 3 — Cloudinary Setup

1. Go to [cloudinary.com](https://cloudinary.com) → Create free account
2. From your **Dashboard**, copy:
   - **Cloud Name** (e.g., `dxyz1234ab`)
   - **API Key**
   - **API Secret**

---

### Step 4 — Configure Environment Variables

Create the file `server/.env`:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/alumni-website
JWT_SECRET=your_strong_random_secret_here
PORT=5000

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> ⚠️ **Never commit `.env` to Git.** It's already in `.gitignore`.

---

### Step 5 — Install Dependencies

Install both server and client dependencies:

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

Or from the root (if `package.json` scripts are set up):
```bash
npm run install:all
```

---

### Step 6 — Run the Application

Open **two terminal windows**:

**Terminal 1 — Backend Server:**
```bash
cd server
node server.js
```
You should see:
```
🚀 Server running on port 5000
✅ MongoDB connected successfully
```

**Terminal 2 — Frontend Client:**
```bash
cd client
npm run dev
```
You should see:
```
▲ Next.js 16.1.7 (Turbopack)
- Local: http://localhost:3000
✓ Ready in 2.7s
```

