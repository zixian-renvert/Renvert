import { v } from 'convex/values';
import { action } from './_generated/server';
import { api } from './_generated/api';

// Send cleaner onboarding completion notification to Google Chat
export const notifyCleanerOnboardingComplete: any = action({
  args: {
    cleanerId: v.id('cleaners'),
    userId: v.string(),
    userName: v.string(),
    userEmail: v.string(),
    companyName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const webhookUrl = 'https://chat.googleapis.com/v1/spaces/AAQACjoYY_I/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=IKvmmECT7y5KDbV9ZLT9bHDA2XyK8sSVFSCsLNvJGBI';

    try {
      // Get cleaner details
      const cleaner = await ctx.runQuery(api.cleaners.getCleanerById, { 
        cleanerId: args.cleanerId 
      });

      if (!cleaner) {
        throw new Error('Cleaner not found');
      }

      // Get HMS card file URL if it exists
      let hmsCardUrl = null;
      if (cleaner.hmsCardFileId) {
        hmsCardUrl = await ctx.runQuery(api.fileStorage.getFileUrl, {
          storageId: cleaner.hmsCardFileId,
        });
      }

      // Prepare the message
      const message = {
        text: `🎉 *New Cleaner Onboarding Complete!*
        
👤 *Name:* ${args.userName}
📧 *Email:* ${args.userEmail}
🏢 *Company:* ${args.companyName || 'Individual/Not specified'}
🆔 *User ID:* ${args.userId}
📋 *Cleaner ID:* ${args.cleanerId}
📅 *Completed:* ${new Date().toLocaleString('no-NO', { timeZone: 'Europe/Oslo' })}

${hmsCardUrl ? `🏥 *HMS Card:* ${hmsCardUrl}` : '⚠️ *HMS Card:* Not uploaded'}

*Status:* ${cleaner.status} ${cleaner.isActive ? '(Active)' : '(Inactive)'}`,
      };

      // Send to Google Chat
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Google Chat webhook failed:', response.status, errorText);
        return { 
          success: false, 
          error: `Webhook failed: ${response.status} ${errorText}` 
        };
      }

      console.log('Successfully sent cleaner onboarding notification to Google Chat');
      return { success: true };

    } catch (error) {
      console.error('Error sending cleaner onboarding notification:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },
});
