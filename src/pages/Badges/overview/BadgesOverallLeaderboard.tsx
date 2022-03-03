import { useBadgesOverallLeaderboard } from 'hooks/Badge';

import BadgesLeaderboard from 'pages/Badges/BadgesLeaderboard';

export const BadgesOverallLeaderboard = () => <BadgesLeaderboard useHook={useBadgesOverallLeaderboard} />;

export default BadgesOverallLeaderboard;
