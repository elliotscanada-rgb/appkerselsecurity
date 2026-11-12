import React from 'react';
import { FaCircle, FaUser, FaClock, FaArrowRight } from 'react-icons/fa';

const HistoryTimeline = ({ history = [] }) => {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No history available
      </div>
    );
  }

  const getEventColor = (eventType) => {
    const colors = {
      created: 'text-green-400',
      status_change: 'text-blue-400',
      received: 'text-green-400',
      verification_started: 'text-yellow-400',
      verification_completed: 'text-yellow-400',
      approved: 'text-green-400',
      rejected: 'text-red-400',
      stored: 'text-purple-400',
      on_hold: 'text-orange-400',
      withdrawal_requested: 'text-cyan-400',
      released: 'text-green-400',
      in_transit: 'text-blue-400',
      completed: 'text-emerald-400',
      note_added: 'text-gray-400',
    };
    return colors[eventType] || 'text-kestrel-gold';
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {history.map((event, index) => (
          <li key={event.id || index}>
            <div className="relative pb-8">
              {index !== history.length - 1 && (
                <span
                  className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-700"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex items-start space-x-3">
                <div className="relative">
                  <span className={`h-8 w-8 rounded-full bg-kestrel-charcoal flex items-center justify-center ring-4 ring-gray-800 ${getEventColor(event.event_type)}`}>
                    <FaCircle className="h-2 w-2" />
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm">
                    <p className="font-semibold text-kestrel-gold">
                      {event.event_type_display}
                    </p>
                    {event.description && (
                      <p className="mt-1 text-gray-300">
                        {event.description}
                      </p>
                    )}
                    {event.previous_status && event.new_status && (
                      <div className="mt-2 flex items-center gap-2 text-sm">
                        <span className="px-2 py-1 rounded bg-gray-700 text-gray-300">
                          {event.previous_status.replace(/_/g, ' ')}
                        </span>
                        <FaArrowRight className="text-kestrel-gold" />
                        <span className="px-2 py-1 rounded bg-kestrel-gold/20 text-kestrel-gold font-medium">
                          {event.new_status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <FaClock className="text-kestrel-gold" />
                      <span>{event.timestamp_formatted}</span>
                    </div>
                    {event.performed_by_name && (
                      <div className="flex items-center gap-1">
                        <FaUser className="text-kestrel-gold" />
                        <span>{event.performed_by_name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HistoryTimeline;
