const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { User, OAuthAccount } = require("../models");
passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
    const user = await User.findByPk(id);
    done(null, user);
});

// GOOGLE 
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:5000/api/oauth/google/callback",
            scope: ["profile", "email"],
        },
        async (accessToken, refreshToken, profile, done) => {
            try{
            const email = profile.emails[0].value;
            const providerId = profile.id;
            if (!email) return done(new Error("No email found in Google profile"));

            let oauthAccount = await OAuthAccount.findOne({
                where: { provider: "google", providerId },
            });

            if (!oauthAccount) {
                let user = await User.findOne({ where: { email } });

                if (!user) {
                    user = await User.create({
                        fullName: profile.displayName,
                        email,
                        password: null,
                        role: "applicant",
                    });
                }

                oauthAccount = await OAuthAccount.create({
                    userId: user.id,
                    provider: "google",
                    providerId,
                    email,
                });
            }
            let user = await User.findByPk(oauthAccount.userId);

            
// Safety check if user was deleted
if (!user) {
  user = await User.create({
    fullName: profile.displayName,
    email,
    password: null,
    role: "applicant",
  });

  await OAuthAccount.update(
    { userId: user.id },
    { where: { id: oauthAccount.id } }
  );
}

            return done(null, user);


        }catch (error) {
            console.error ("Error in Google OAuth callback:", error);
            return done(error, null);
        }
    }    )
);

module.exports = passport;


