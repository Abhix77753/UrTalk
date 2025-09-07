// Email/password login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = { admin: '12345', user1: 'password' }; // hardcoded
  if (users[username] && users[username] === password) {
    req.session.user = { username };
    res.json({ message: 'Login successful!' });
  } else {
    res.json({ message: 'Invalid username or password.' });
  }
});

// Google login (optional)
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => done(null, profile)));

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login.html' }),
  (req, res) => {
    req.session.user = req.user;
    res.redirect('/talkChat.html');
  }
);

// Guest login
app.get('/guest', (req, res) => {
  req.session.user = { username: 'Guest' };
  res.redirect('/talkChat.html');
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login.html');
});