import { useState, useEffect } from 'react';
import { usePointsStore } from '../store/usePointsStore';
import { useAuthStore } from '../store/useAuthStore';
import { Award, MessageSquare, ThumbsUp, Calendar, Users, CalendarCheck, ArrowUpRight, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const PointsSummary = ({ userId }) => {
  const { authUser } = useAuthStore();
  const { pointsSummary, loading, getPointsSummary } = usePointsStore();
  const [showDetail, setShowDetail] = useState(false);
  
  // Get the user ID, defaults to current user if not provided
  const targetUserId = userId || authUser?._id;
  
  useEffect(() => {
    if (targetUserId) {
      getPointsSummary(targetUserId);
    }
  }, [targetUserId, getPointsSummary]);
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <div className="loading loading-spinner loading-md text-primary"></div>
        <p className="mt-2">Loading eco points...</p>
      </div>
    );
  }

  if (!pointsSummary) {
    return null;
  }

  const { user, breakdown } = pointsSummary;
  const isCurrentUser = authUser?._id === user._id;
  
  // Calculate percentage contributions
  const total = user.totalEcoPoints || 1; // Prevent division by zero
  const calculatePercent = (points) => Math.round((points / total) * 100);
  
  const postsPercent = calculatePercent(breakdown.posts.points);
  const likesPercent = calculatePercent(breakdown.likes.points);
  const commentsPercent = calculatePercent(breakdown.comments.points);
  const eventsOrganizedPercent = calculatePercent(breakdown.eventsOrganized.points + breakdown.eventsOrganized.completedBonusPoints);
  const eventsParticipatedPercent = calculatePercent(breakdown.eventsParticipated.points);
  const otherPercent = calculatePercent(breakdown.other.points);
  
  return (
    <div className="bg-base-200 rounded-lg p-4">
      {/* Main Points Display */}      <div className="flex flex-col items-center mb-4">
        <div className="avatar placeholder mb-2">
          <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center">
            <Award className="w-8 h-8" />
          </div>
        </div>
        <h3 className="font-bold text-xl">{user.totalEcoPoints}</h3>
        <p className="text-sm text-base-content/70">Eco Points</p>
        
        <div className="flex gap-2 mt-2">
          <button 
            className="btn btn-ghost btn-sm"
            onClick={() => setShowDetail(!showDetail)}
          >
            {showDetail ? 'Hide Details' : 'View Breakdown'}
          </button>
          
          {isCurrentUser && (
            <Link to="/badges" className="btn btn-primary btn-sm">
              <ShoppingBag className="w-3 h-3 mr-1" /> Redeem Points
            </Link>
          )}
        </div>
      </div>
      
      {/* Points Progress */}
      {!showDetail ? (
        <div className="w-full bg-base-300 rounded-full h-4 mb-2 overflow-hidden">
          {postsPercent > 0 && (
            <div 
              className="h-full bg-primary" 
              style={{width: `${postsPercent}%`, float: 'left'}}
              title={`Posts: ${breakdown.posts.points} points (${postsPercent}%)`}
            ></div>
          )}
          {likesPercent > 0 && (
            <div 
              className="h-full bg-secondary" 
              style={{width: `${likesPercent}%`, float: 'left'}}
              title={`Likes: ${breakdown.likes.points} points (${likesPercent}%)`}
            ></div>
          )}
          {commentsPercent > 0 && (
            <div 
              className="h-full bg-accent" 
              style={{width: `${commentsPercent}%`, float: 'left'}}
              title={`Comments: ${breakdown.comments.points} points (${commentsPercent}%)`}
            ></div>
          )}
          {eventsOrganizedPercent > 0 && (
            <div 
              className="h-full bg-info" 
              style={{width: `${eventsOrganizedPercent}%`, float: 'left'}}
              title={`Events Organized: ${breakdown.eventsOrganized.points + breakdown.eventsOrganized.completedBonusPoints} points (${eventsOrganizedPercent}%)`}
            ></div>
          )}
          {eventsParticipatedPercent > 0 && (
            <div 
              className="h-full bg-success" 
              style={{width: `${eventsParticipatedPercent}%`, float: 'left'}}
              title={`Events Participated: ${breakdown.eventsParticipated.points} points (${eventsParticipatedPercent}%)`}
            ></div>
          )}
          {otherPercent > 0 && (
            <div 
              className="h-full bg-warning" 
              style={{width: `${otherPercent}%`, float: 'left'}}
              title={`Other: ${breakdown.other.points} points (${otherPercent}%)`}
            ></div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Detailed breakdown */}
          <div className="space-y-2">
            {/* Posts */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" /> Posts
                </span>
              </div>
              <div className="text-right">
                <div className="font-medium">{breakdown.posts.points} points</div>
                <div className="text-xs text-base-content/70">{breakdown.posts.count} posts × {breakdown.posts.pointsPerPost} pts</div>
              </div>
            </div>
            
            {/* Likes */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-secondary"></div>
                <span className="flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4" /> Likes Received
                </span>
              </div>
              <div className="text-right">
                <div className="font-medium">{breakdown.likes.points} points</div>
                <div className="text-xs text-base-content/70">{breakdown.likes.count} likes × {breakdown.likes.pointsPerLike} pts</div>
              </div>
            </div>
            
            {/* Comments */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent"></div>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" /> Comments Received
                </span>
              </div>
              <div className="text-right">
                <div className="font-medium">{breakdown.comments.points} points</div>
                <div className="text-xs text-base-content/70">{breakdown.comments.count} comments × {breakdown.comments.pointsPerComment} pts</div>
              </div>
            </div>
            
            {/* Events Organized */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-info"></div>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> Events Organized
                </span>
              </div>
              <div className="text-right">
                <div className="font-medium">
                  {breakdown.eventsOrganized.points + breakdown.eventsOrganized.completedBonusPoints} points
                </div>
                <div className="text-xs text-base-content/70">
                  {breakdown.eventsOrganized.count} events × {breakdown.eventsOrganized.pointsPerEvent} pts
                  {breakdown.eventsOrganized.completedCount > 0 && (
                    <> + {breakdown.eventsOrganized.completedCount} completed × {breakdown.eventsOrganized.bonusPerCompletedEvent} bonus</>
                  )}
                </div>
              </div>
            </div>
            
            {/* Events Participated */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success"></div>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" /> Events Participated
                </span>
              </div>
              <div className="text-right">
                <div className="font-medium">{breakdown.eventsParticipated.points} points</div>
                <div className="text-xs text-base-content/70">
                  {breakdown.eventsParticipated.count} events × ~{breakdown.eventsParticipated.averagePointsPerEvent} pts avg
                </div>
              </div>
            </div>
            
            {/* Other Points */}
            {breakdown.other.points > 0 && (
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-warning"></div>
                  <span>Other Activity</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">{breakdown.other.points} points</div>
                </div>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="flex justify-between items-center pt-2 border-t border-base-300">
            <div className="font-bold">Total Eco Points</div>
            <div className="font-bold">{user.totalEcoPoints}</div>
          </div>
          
          {/* Call to Action */}
          {isCurrentUser && (
            <div className="pt-2">
              <div className="flex gap-2 flex-wrap">
                <Link to="/events" className="btn btn-primary btn-sm flex-1">
                  <CalendarCheck className="w-4 h-4" /> Join Events
                </Link>
                <Link to="/leaderboard" className="btn btn-outline btn-sm flex-1">
                  <Award className="w-4 h-4" /> Leaderboard
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PointsSummary;
