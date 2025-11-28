export interface UserNotificationPreferences {
  userId: string;
  receiveDeadlineAlerts: boolean;
  receiveNonPertinentAlerts: boolean;
  groupNotificationsByProject: boolean;
}

export function getDefaultPreferences(userId: string): UserNotificationPreferences {
  return {
    userId,
    receiveDeadlineAlerts: true,
    receiveNonPertinentAlerts: true,
    groupNotificationsByProject: false
  };
}

