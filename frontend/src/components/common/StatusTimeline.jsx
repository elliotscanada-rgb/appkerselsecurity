import React from 'react';
import { FaCheckCircle, FaTimesCircle, FaHourglassHalf } from 'react-icons/fa';
import { formatDate } from '../../utils/formatters';
import { STATUS_LABELS, STATUS_COLORS, STATUS_DESCRIPTIONS } from '../../utils/constants';

const StatusTimeline = ({ statusHistory, consignmentNumber, itemName }) => {
  const getStatusIcon = (status) => {
    // Determine if status is positive, negative, or neutral based on status type
    if (['verification_failed', 'rejected', 'on_hold'].includes(status)) {
      return <FaTimesCircle className="text-red-600" />;
    }
    if (['verification_passed', 'approved', 'in_secure_storage', 'completed', 'released'].includes(status)) {
      return <FaCheckCircle className="text-green-600" />;
    }
    return <FaHourglassHalf className="text-yellow-600" />;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h3 className="font-bold text-lg">{itemName}</h3>
        <p className="text-sm text-gray-600">Consignment #{consignmentNumber}</p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {statusHistory && statusHistory.length > 0 ? (
          statusHistory.map((history, index) => (
            <div key={index} className="flex gap-4 pb-8">
              {/* Timeline dot and line */}
              <div className="relative flex flex-col items-center">
                <div className={`w-4 h-4 rounded-full ${STATUS_COLORS[history.status].split(' ')[0]} border-4 border-white shadow-md flex items-center justify-center`}>
                  {getStatusIcon(history.status)}
                </div>
                {index < statusHistory.length - 1 && (
                  <div className="w-0.5 h-full bg-gray-300 mt-1"></div>
                )}
              </div>

              {/* Status content */}
              <div className="flex-1 pb-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`badge ${STATUS_COLORS[history.status]}`}>
                      {STATUS_LABELS[history.status]}
                    </span>
                    <span className="text-sm text-gray-500">{formatDate(history.date)}</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    {STATUS_DESCRIPTIONS[history.status]}
                  </p>
                  <p className="text-xs text-gray-500">
                    <strong>Staff:</strong> {history.staff}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No status history available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusTimeline;
