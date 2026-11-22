import React from 'react';
import { FaShieldAlt } from 'react-icons/fa';

/**
 * CUSTODY CHAIN TIMELINE
 * Displays the procedural tracking of gold custody chain
 * Shows evidence-based custody history with status indicators
 * Data is fed from backend (admin-defined custody steps)
 */
const CustodyChainTimeline = ({ consignment }) => {
  // Use custody_steps from backend, or show empty state
  const custodySteps = consignment?.custody_steps || [];

  // Get status styling
  const getStatusStyle = (status) => {
    switch (status) {
      case 'completed':
        return {
          badge: 'bg-green-900/40 text-green-400 border border-green-600/50',
          icon: '✅',
          label: 'Recorded',
          color: 'text-green-400'
        };
      case 'evidence_required':
        return {
          badge: 'bg-orange-900/40 text-orange-400 border border-orange-600/50',
          icon: '⚠️',
          label: 'Evidence required',
          color: 'text-orange-400'
        };
      case 'not_established':
        return {
          badge: 'bg-gray-800/40 text-gray-500 border border-gray-600/50',
          icon: '◯',
          label: 'Not established',
          color: 'text-gray-500'
        };
      case 'pending':
        return {
          badge: 'bg-blue-900/40 text-blue-400 border border-blue-600/50',
          icon: '⏳',
          label: 'Pending',
          color: 'text-blue-400'
        };
      default:
        return {
          badge: 'bg-gray-800/40 text-gray-400 border border-gray-600/50',
          icon: '○',
          label: 'Unknown',
          color: 'text-gray-400'
        };
    }
  };

  if (!custodySteps || custodySteps.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
          <FaShieldAlt className="text-cyan-400" />
          Consignment Tracking
        </h3>
        <p className="text-gray-400 text-sm">No custody steps defined yet</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      {/* Header */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
          <FaShieldAlt className="text-cyan-400" />
          Consignment Tracking
        </h3>
        <p className="text-gray-400 text-sm">
          Evidence-based custody timeline
        </p>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {custodySteps.map((step, index) => {
          const statusStyle = getStatusStyle(step.status);
          const isLast = index === custodySteps.length - 1;

          return (
            <div key={step.id} className="relative">
              {/* Step Number and Connection Line */}
              <div className="flex gap-6">
                {/* Left Column - Step Number */}
                <div className="flex flex-col items-center flex-shrink-0">
                  {/* Circle with number */}
                  <div className={`w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center font-bold text-white text-sm flex-shrink-0`}>
                    {step.step_number}
                  </div>
                  
                  {/* Vertical line to next step */}
                  {!isLast && (
                    <div className="w-0.5 h-24 bg-gradient-to-b from-cyan-500 to-gray-700 mt-2"></div>
                  )}
                </div>

                {/* Right Column - Content */}
                <div className="flex-1 pb-6">
                  {/* Step Title */}
                  <h4 className="text-lg font-bold text-white mb-2">
                    {step.title}
                  </h4>

                  {/* Status Badge */}
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${statusStyle.badge}`}>
                    {statusStyle.label}
                  </div>

                  {/* Step Details */}
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-300">
                      {step.description}
                    </p>
                    <p className="text-gray-500 text-xs">
                      <span className="font-semibold">Evidence:</span> {step.evidence_description}
                    </p>

                    {/* Completion date if available */}
                    {step.completion_date && (
                      <p className="text-gray-400 text-xs mt-2">
                        <span className="font-semibold">Completed:</span>{' '}
                        {new Date(
                          step.completion_date.includes('T')
                            ? step.completion_date
                            : step.completion_date + 'T00:00:00'
                        ).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CustodyChainTimeline;
