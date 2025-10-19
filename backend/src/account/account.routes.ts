import { Router, Request, Response } from 'express';
import { AccountService } from './account.service';
import { requireAuth } from '../auth/auth.middleware';

const router = Router();
const accountService = new AccountService();

// TODO, is this dead code? Might be useful, but, also might not be used right now
// Get profile endpoint
router.get('/profile', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const phone = (req as any).userPhone;
  
  try {
    const profile = await accountService.getProfileByPhone(phone);
    
    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }
    
    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// TODO, is this dead code? Remove this?
// Update profile endpoint
router.put('/profile', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { firstName, lastName, city, state } = req.body;
  const phone = (req as any).userPhone;
  
  if (!firstName || !lastName || !city || !state) {
    res.status(400).json({ error: 'All fields are required' });
    return;
  }
  
  try {
    await accountService.updateProfile(phone, {
      firstName,
      lastName,
      city,
      state
    });
    
    res.json({ 
      success: true, 
      message: 'Profile updated successfully' 
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Idempotent update profile data endpoint
router.post('/update-profile-data', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { firstName, lastName, city, state } = req.body;
  const phone = (req as any).userPhone;
  
  if (!firstName || !lastName || !city || !state) {
    res.status(400).json({ error: 'All fields are required' });
    return;
  }
  
  try {
    await accountService.updateProfileData(phone, {
      firstName,
      lastName,
      city,
      state
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating profile data:', error);
    res.status(500).json({ error: 'Failed to update profile data' });
  }
});

// Get onboarding state endpoint
router.get('/onboarding-state', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const phone = (req as any).userPhone;
  
  try {
    const onboardingState = await accountService.getOnboardingState(phone);
    res.json(onboardingState);
  } catch (error) {
    console.error('Error fetching onboarding state:', error);
    res.status(500).json({ error: 'Failed to fetch onboarding state' });
  }
});

export default router;
