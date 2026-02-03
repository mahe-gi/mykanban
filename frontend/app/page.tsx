'use client';

import { useEffect, useState } from 'react';
import { initializeTeams, getTeamsContext, isInTeams, notifySuccess, notifyFailure } from '@/lib/teamsClient';
import KanbanBoard from '@/components/KanbanBoard';

export default function Home() {
  const [channelId, setChannelId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    async function initialize() {
      try {
        // Check if running in Teams
        if (!isInTeams()) {
          // For development outside Teams, use a demo channel ID
          setChannelId('demo-channel-123');
          setLoading(false);
          return;
        }

        // Initialize Teams SDK
        await initializeTeams();
        
        // Get Teams context (channel ID)
        const context = await getTeamsContext();
        setChannelId(context.channelId);
        
        // Notify Teams that app loaded successfully
        notifySuccess();
        setLoading(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        notifyFailure(message);
        setLoading(false);
      }
    }

    initialize();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading Kanban Board...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <KanbanBoard channelId={channelId} />
      </div>
    </div>
  );
}
