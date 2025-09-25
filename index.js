require('dotenv').config();
const path = require("path");
const express = require("express");
const cors = require('cors');
const os = require ('os');
const session = require('express-session');
const { dbconnection } = require("./src/config/dbConnection");
const userRoutes = require('./src/routes/userRoutes');
const authRoutes = require('./src/routes/authRoutes');
const passport = require("./src/config/passport");
const oauthaccountRoutes = require("./src/routes/oauthaccountRoutes");
const userpersonalprofileRoutes = require("./src/routes/userpersonalprofileRoutes");
const structuredresumeRoutes = require("./src/routes/structuredresumeRoutes");
const imageRoutes = require('./src/routes/imageRoutes');
const industryRoutes = require('./src/routes/industryRoutes');
const jobfilterRoutes = require('./src/routes/jobfilterRoutes');
const companyprofileRoutes = require('./src/routes/companyprofileRoutes');
const jobpostRoutes = require('./src/routes/jobpostRoutes');
const savedjobsRoutes = require('./src/routes/savejobsRoutes');
const applicationRoutes = require('./src/routes/applicationRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const cmsRoutes = require('./src/routes/cmsRoutes');
const locationRoutes = require('./src/routes/locationRoutes');


const app = express();
const port = process.env.PORT || 3000;
const allowedOrigins = [

    'http://192.168.1.9:3000', 
    'http://localhost:3000'   
    
];
// CORS configuration
const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('This origin is not allowed by CORS'));
        }
    },
    credentials: true
};
// ------------Middlewares-----
// CORS middleware
app.use(cors(corsOptions));
// JSON parsing
app.use(express.json());


// Middleware for serving static files
app.use('/images', express.static(path.join(__dirname, 'public/Images')));
app.use('/resume', express.static(path.join(__dirname, 'public/resume')));

// // Cookie parsing
// app.use(cookieParser()); 
// Session and passport middlewares here
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
         sameSite: 'lax',
         secure: process.env.NODE_ENV === 'production' 
    }
}));
// Passport initialization  k93hg#8fA
app.use(passport.initialize());
app.use(passport.session());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/oauth', oauthaccountRoutes );

app.use('/api/structuredresume', structuredresumeRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/profile', userpersonalprofileRoutes);
app.use('/api/companyprofile', companyprofileRoutes )
app.use('/public', express.static('public'));

app.use('/api/industries', industryRoutes);
app.use('/api/locations', locationRoutes );
app.use('/api/jobs', jobfilterRoutes);
app.use('/api/jobpost', jobpostRoutes );
app.use('/api/saved-jobs', savedjobsRoutes);
app.use('/api/application',applicationRoutes );

app.use('/api/admin', analyticsRoutes);
app.use('/api/cms', cmsRoutes);

// Test route for browser
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Backend API is running!' });
});


function getLocalNetworkIp(){
    const nets = os.networkInterfaces();
    
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
        
            if (net.family === 'IPv4' && !net.internal) {
                return net.address; 
            }
        }
    }
    return 'localhost'; 
}

dbconnection()
    .then(() => {
        app.listen(port, '0.0.0.0', () => {
            const networkIp = getLocalNetworkIp();
            console.log(`Server is running on: 0.0.0.0:${port}`);
            console.log(`Local:   http://localhost:${port}`);
            console.log(`Network: http://${networkIp}:${port}`);
        });
    })
    .catch((error) => {
        console.error('Failed to connect to the database:', error);
    });


