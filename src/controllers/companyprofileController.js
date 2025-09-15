const { User } = require('../models');

// Get recruiter profile
const getRecruiterProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const recruiter = await User.findByPk(userId, {
      attributes: [
        'id',
        'fullName',
        'email',
        'role',
        'companyName',
        'aboutUs',
        'organizationType',
        'teamSize',
        'industryTypes',
        'yearOfEstablishment',
        'companyWebsite',
        'facebookLink',
        'instagramLink',
        'linkedInLink',
        'twitterLink',
        'location',
        'phoneNumber'
      ]
    });

    if (!recruiter || recruiter.role !== 'recruiter') {
      return res.status(404).json({ error: 'Recruiter profile not found' });
    }

    res.status(200).json({ recruiter });
  } catch (error) {
    console.error('Error fetching recruiter profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//  Update recruiter profile
const updateRecruiterProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      companyName,
      aboutUs,
      organizationType,
      teamSize,
      industryTypes,
      yearOfEstablishment,
      companyWebsite,
      facebookLink,
      instagramLink,
      linkedInLink,
      twitterLink,
      location,
      phoneNumber
    } = req.body;

    

    const recruiter = await User.findByPk(userId);

    if (!recruiter || recruiter.role !== 'recruiter') {
      return res.status(404).json({ error: 'Recruiter profile not found' });
    }

    await recruiter.update({
      companyName,
      aboutUs,
      organizationType,
      teamSize,
      industryTypes,
      yearOfEstablishment,
      companyWebsite,
      facebookLink,
      instagramLink,
      linkedInLink,
      twitterLink,
      location,
      phoneNumber
    });

    res.status(200).json({ message: 'Profile updated successfully', recruiter });
  } catch (err) {
    console.error('Error updating recruiter profile:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getRecruiterProfile, updateRecruiterProfile }
// see if there any validations that are needed and not theere if needed tell me where 