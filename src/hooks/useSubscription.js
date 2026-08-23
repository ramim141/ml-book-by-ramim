import { useAuth } from '../contexts/AuthContext';
import { isAdmin } from '../config/roles';

/**
 * পুরো প্ল্যাটফর্ম এখন সম্পূর্ণ ফ্রি।
 * যেকোনো ফিচার যেন কোনো বাধা ছাড়া উন্মুক্ত থাকে, তাই premium: true রিটার্ন করা হয়।
 */
export function useSubscription() {
  const { currentUser } = useAuth();
  const admin = isAdmin(currentUser?.email);

  return {
    loading: false,
    premium: true,
    isAdminUser: admin,
    plan: 'free',
    daysLeft: 0,
    refresh: () => Promise.resolve(),
  };
}

export default useSubscription;

