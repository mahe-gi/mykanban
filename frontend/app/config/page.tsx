'use client';

import { useEffect, useState } from 'react';
import * as microsoftTeams from '@microsoft/teams-js';

export default function ConfigPage() {
  const [error, setError] = useState<string>('');
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    async function setupConfiguration() {
      try {
        // Initialize Teams SDK
        await microsoftTeams.app.initialize();
        console.log('✓ Teams SDK initialized in config page');

        // Set initial validity to true
        microsoftTeams.pages.config.setValidityState(true);
        
        // Get current context
        const context = await microsoftTeams.app.getContext();
        const hostUrl = window.location.origin;
        
        // Register save handler BEFORE user can click save
        microsoftTeams.pages.config.registerOnSaveHandler((saveEvent) => {
          try {
            // Define URLs based on context
            const entityId = context.channel?.id || 'kanban-board';
            const contentUrl = `${hostUrl}/?channelId=${entityId}`;
            
            // Save configuration settings (synchronous)
            microsoftTeams.pages.config.setConfig({
              entityId: entityId,
              contentUrl: contentUrl,
              websiteUrl: contentUrl,
              suggestedDisplayName: 'Kanban Board',
            });
            
            console.log('✓ Configuration saved:', { contentUrl, entityId });
            saveEvent.notifySuccess();
          } catch (err) {
            console.error('Save handler error:', err);
            saveEvent.notifyFailure('Failed to save configuration');
          }
        });

        setIsConfigured(true);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Configuration failed';
        setError(message);
        console.error('Configuration error:', err);
      }
    }

    setupConfiguration();
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md p-8 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Configuration Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">📋</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Kanban Board Setup
          </h1>
          <p className="text-gray-600 mb-6">
            Add this Kanban board to your Teams channel for visual task management.
          </p>

          {isConfigured ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium mb-2">✓ Ready to save</p>
              <p className="text-sm text-green-700">
                Click <strong>Save</strong> below to add the board to your channel.
              </p>
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent"></div>
              <p className="text-sm text-gray-600 mt-2">Configuring...</p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Features:</h3>
            <ul className="text-sm text-gray-600 space-y-1 text-left">
              <li>• Visual task organization</li>
              <li>• To Do, In Progress, Done columns</li>
              <li>• Channel-specific boards</li>
              <li>• Real-time updates</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
