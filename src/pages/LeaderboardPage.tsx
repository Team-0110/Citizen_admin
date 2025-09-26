import React, { useState, useEffect } from 'react';
import '../styles/leaderboard.css';
import { fetchIssues } from '../data/supabase_data';
import type { Issue } from '../data/issues.ts';

// Define the interface for the department data on the leaderboard
interface DepartmentStats {
  department: string;
  solvedCount: number;
  totalCount: number;
  solvedPercentage: number;
  avgResolutionTime: number; // Storing time as a number (in minutes) for easier sorting
  avgResolutionTimeFormatted: string; // Formatted string for display
}

interface LeaderboardPageProps {
  onNavigate: (page: string) => void;
}

const LeaderboardPage: React.FC<LeaderboardPageProps> = ({ onNavigate }) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<DepartmentStats[]>([]);
  const [loading, setLoading] = useState(true);

  // Use useEffect to fetch data from Supabase once on component mount
  useEffect(() => {
    const getIssues = async () => {
      setLoading(true);
      const fetchedIssues = await fetchIssues();
      setIssues(fetchedIssues);
      setLoading(false);
    };
    getIssues();
  }, []);

  // Recalculate leaderboard data whenever issues are fetched or changed
  useEffect(() => {
    if (issues.length === 0) {
      setLeaderboardData([]);
      return;
    }

    // Group issues by department
    const departments = issues.reduce((acc, issue) => {
      if (!acc[issue.department]) {
        acc[issue.department] = [];
      }
      acc[issue.department].push(issue);
      return acc;
    }, {} as Record<string, Issue[]>);

    // Calculate metrics for each department
    const stats: DepartmentStats[] = Object.entries(departments).map(([department, departmentIssues]) => {
      // Use "Completed" status to filter solved issues
      const solvedIssues = departmentIssues.filter(issue => issue.status === 'Completed');
      const solvedCount = solvedIssues.length;
      const totalCount = departmentIssues.length;
      const solvedPercentage = totalCount > 0 ? (solvedCount / totalCount) * 100 : 0;

      const totalResolutionTime = solvedIssues.reduce((sum, issue) => {
        if (issue.resolvedDate && issue.reportedDate) {
          const resolvedDate = new Date(issue.resolvedDate);
          const reportedDate = new Date(issue.reportedDate);
          return sum + (resolvedDate.getTime() - reportedDate.getTime());
        }
        return sum;
      }, 0);

      const avgTimeInMs = solvedCount > 0 ? totalResolutionTime / solvedCount : 0;
      const avgResolutionTime = Math.floor(avgTimeInMs / 1000 / 60); // In minutes for accurate sorting

      // Format the time for display
      const days = Math.floor(avgResolutionTime / 1440);
      const hours = Math.floor((avgResolutionTime % 1440) / 60);
      const minutes = avgResolutionTime % 60;
      const avgResolutionTimeFormatted = days > 0 ? `${days} day(s)` : hours > 0 ? `${hours} hour(s)` : `${minutes} minute(s)`;

      return {
        department,
        solvedCount,
        totalCount,
        solvedPercentage: parseFloat(solvedPercentage.toFixed(2)),
        avgResolutionTime, // Use number for sorting
        avgResolutionTimeFormatted // Use string for display
      };
    });

    stats.sort((a, b) => {
      if (a.solvedPercentage !== b.solvedPercentage) {
        return b.solvedPercentage - a.solvedPercentage;
      }
      
      // Secondary sort by average resolution time (shorter time is better)
      return a.avgResolutionTime - b.avgResolutionTime;
    });

    setLeaderboardData(stats);
  }, [issues]);

  if (loading) {
    return (
      <div className="leaderboard-page">
        <div className="header">
          <button onClick={() => onNavigate('home')}>&larr; Back to Home</button>
          <h1>Department Leaderboard</h1>
        </div>
        <p>Loading issues...</p>
      </div>
    );
  }

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-header">
        <button onClick={() => onNavigate('home')}>&larr; Back to Home</button>
        <h1>Department Leaderboard</h1>
        <p>Rankings based on issue resolution performance.</p>
      </div>
      <div className="leaderboard-table-container">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Department</th>
              <th>Solved Issues (%)</th>
              <th>Avg. Resolution Time</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((data, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{data.department}</td>
                <td>{data.solvedPercentage}% ({data.solvedCount}/{data.totalCount})</td>
                <td>{data.avgResolutionTimeFormatted}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderboardPage;