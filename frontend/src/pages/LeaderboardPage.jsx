import { useState, useEffect } from 'react';
import { usePointsStore } from '../store/usePointsStore';
import { Award, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const LeaderboardPage = () => {
  const { leaderboard, loading, getLeaderboard } = usePointsStore();
  const [limit, setLimit] = useState(20);
  const navigate = useNavigate();
  
  useEffect(() => {
    getLeaderboard(limit);
  }, [getLeaderboard, limit]);
  
  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="max-w-3xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <button 
              className="btn btn-ghost btn-sm"
              onClick={() => navigate('/profile')}
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </div>
          
          <div className="text-center">
            <h1 className="text-2xl font-semibold flex items-center justify-center gap-2">
              <Award className="w-8 h-8 text-amber-400" /> Eco Points Leaderboard
            </h1>
            <p className="mt-2">Top eco-friendly users making a difference</p>
          </div>
          
          {/* Leaderboard */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-12">
                <div className="loading loading-spinner loading-lg text-primary"></div>
                <p className="mt-4">Loading leaderboard...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th className="w-16 text-center">Rank</th>
                      <th>User</th>
                      <th className="text-right">Eco Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((user, index) => (
                      <tr key={user._id} className={index < 3 ? 'font-medium' : ''}>
                        <td className="text-center">
                          {index === 0 && <span className="text-amber-400 font-bold">🏆 1</span>}
                          {index === 1 && <span className="text-slate-400 font-bold">🥈 2</span>}
                          {index === 2 && <span className="text-amber-700 font-bold">🥉 3</span>}
                          {index > 2 && <span>{index + 1}</span>}
                        </td>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="avatar">
                              <div className="w-10 h-10 rounded-full">
                                <img src={user.profilePic || "/avatar.png"} alt={user.fullName} />
                              </div>
                            </div>
                            <div>
                              <div className="font-medium">{user.fullName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Award className="w-4 h-4 text-primary" />
                            <span className="font-medium">{user.ecoPoints}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {!loading && leaderboard.length > 0 && (
              <div className="flex justify-center mt-6">
                <button
                  className="btn btn-outline"
                  onClick={() => setLimit(limit + 10)}
                >
                  Load More
                </button>
              </div>
            )}
          </div>
          
          {/* Help Text */}
          <div className="bg-base-200 p-4 rounded-lg text-sm">
            <h3 className="font-bold mb-2">How to earn Eco Points:</h3>
            <ul className="space-y-1 list-disc pl-4">
              <li>Create a post (+10 points)</li>
              <li>Get likes on your posts (+2 points each)</li>
              <li>Get comments on your posts (+3 points each)</li>
              <li>Organize an eco-friendly event (+15 points)</li>
              <li>Participate in eco-friendly events (points vary by event)</li>
              <li>Complete events you've organized (+10 bonus points)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
