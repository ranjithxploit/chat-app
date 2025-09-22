import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from './utils/database.js';
import { upload, uploadToCloudinary } from './utils/cloudinary.js';
import User from './models/User.js';
import Message from './models/Message.js';
import Chat from './models/Chat.js';
import FileShare from './models/FileShare.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:8080",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Basic routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'ChillChat Backend is running!' });
});

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Generate unique user code
    const userCode = await User.generateUserCode();

    // Create new user
    const user = new User({
      userCode,
      name,
      email,
      password // Will be hashed by the pre-save middleware
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, userCode: user.userCode },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Update online status
    user.online = true;
    user.lastSeen = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, userCode: user.userCode },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User routes
app.get('/api/users/search/:userCode', authenticateToken, async (req, res) => {
  try {
    const { userCode } = req.params;
    const user = await User.findOne({ userCode }).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Friend request routes
app.post('/api/friends/request', authenticateToken, async (req, res) => {
  try {
    const { userCode } = req.body;
    const fromUserId = req.user.userId;

    // Find target user
    const targetUser = await User.findOne({ userCode });
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already friends
    if (targetUser.friends.includes(fromUserId)) {
      return res.status(400).json({ error: 'Already friends' });
    }

    // Check if request already exists
    const existingRequest = targetUser.friendRequests.find(
      req => req.from.toString() === fromUserId
    );
    if (existingRequest) {
      return res.status(400).json({ error: 'Friend request already sent' });
    }

    // Add friend request
    targetUser.friendRequests.push({
      from: fromUserId,
      status: 'pending'
    });
    await targetUser.save();

    res.json({ message: 'Friend request sent successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/friends/respond', authenticateToken, async (req, res) => {
  try {
    const { requestId, action } = req.body; // action: 'accept' or 'reject'
    const userId = req.user.userId;

    const user = await User.findById(userId);
    const request = user.friendRequests.id(requestId);

    if (!request) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    request.status = action === 'accept' ? 'accepted' : 'rejected';

    if (action === 'accept') {
      // Add each other as friends
      user.friends.push(request.from);
      const fromUser = await User.findById(request.from);
      fromUser.friends.push(userId);
      await fromUser.save();
    }

    await user.save();
    res.json({ message: `Friend request ${action}ed successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// File sharing routes
app.post('/api/files/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validate file type (ZIP only)
    if (!req.file.mimetype.includes('zip')) {
      return res.status(400).json({ error: 'Only ZIP files are allowed' });
    }

    // Validate file size (100MB max)
    if (req.file.size > 104857600) {
      return res.status(400).json({ error: 'File size exceeds 100MB limit' });
    }

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(
      req.file.buffer,
      req.file.originalname,
      'raw' // For non-image files
    );

    // Generate share code
    const shareCode = await FileShare.generateShareCode();

    // Create file share record
    const fileShare = new FileShare({
      shareCode,
      uploaderId: req.user.userId,
      fileName: uploadResult.publicId,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      fileUrl: uploadResult.url,
      publicId: uploadResult.publicId,
      mimeType: req.file.mimetype
    });

    await fileShare.save();

    res.json({
      message: 'File uploaded successfully',
      shareCode,
      expiresAt: fileShare.expiresAt,
      fileName: req.file.originalname,
      fileSize: req.file.size
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/files/download/:shareCode', async (req, res) => {
  try {
    const { shareCode } = req.params;
    const clientIP = req.ip || req.connection.remoteAddress;

    const fileShare = await FileShare.findOne({ shareCode, isActive: true });

    if (!fileShare) {
      return res.status(404).json({ error: 'File not found or expired' });
    }

    if (!fileShare.canDownload()) {
      return res.status(410).json({ error: 'File expired or download limit reached' });
    }

    // Mark as downloaded
    await fileShare.markDownloaded(req.user?.userId, clientIP);

    // Redirect to Cloudinary URL for download
    res.redirect(fileShare.fileUrl);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/files/info/:shareCode', async (req, res) => {
  try {
    const { shareCode } = req.params;
    
    const fileShare = await FileShare.findOne({ shareCode, isActive: true })
      .populate('uploaderId', 'name userCode');

    if (!fileShare) {
      return res.status(404).json({ error: 'File not found or expired' });
    }

    res.json({
      shareCode: fileShare.shareCode,
      fileName: fileShare.originalName,
      fileSize: fileShare.fileSize,
      uploader: fileShare.uploaderId.name,
      uploaderCode: fileShare.uploaderId.userCode,
      expiresAt: fileShare.expiresAt,
      canDownload: fileShare.canDownload(),
      downloadCount: fileShare.downloadCount,
      maxDownloads: fileShare.maxDownloads
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Socket.IO connection handling
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('user_online', (userData) => {
    connectedUsers.set(socket.id, userData);
    socket.broadcast.emit('user_status_change', {
      userId: userData.userId,
      online: true
    });
  });

  socket.on('join_chat', (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.id} joined chat: ${chatId}`);
  });

  socket.on('send_message', async (messageData) => {
    try {
      // Save message to database
      const message = new Message(messageData);
      await message.save();

      // Update chat's last message
      await Chat.findByIdAndUpdate(messageData.chatId, {
        lastMessage: message._id,
        lastActivity: new Date()
      });

      // Emit to chat room
      socket.to(messageData.chatId).emit('receive_message', message);
    } catch (error) {
      socket.emit('message_error', { error: error.message });
    }
  });

  socket.on('disconnect', () => {
    const userData = connectedUsers.get(socket.id);
    if (userData) {
      connectedUsers.delete(socket.id);
      socket.broadcast.emit('user_status_change', {
        userId: userData.userId,
        online: false
      });
    }
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});