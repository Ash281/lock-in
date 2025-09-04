import React, { useState } from 'react';
import { X } from 'lucide-react';

// we define an interface for the event data
// this will be used for the form submission
interface AddEventWindowProps {
    isOpen: boolean;
    onClose: () => void; // define functions to close and submit the form
    onSubmit: (eventData: {
        title: string;
        startTime: string; // string because the API takes json which doesn't support Date objects
        endTime: string;
        flexibility?: string;
        priority?: number;
    }) => void; // onSubmit takes an object with event data and returns void (submits data)
}

// main add event window component
// this function renders the window for adding a new event
// has functions to handle form submission, form closure and checking if it is open
export default function AddEventWindow({ isOpen, onClose, onSubmit }: AddEventWindowProps) {
    // state hook here creates form data with default form values
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        startTime: '',
        endTime: '',
        flexibility: 'FLEXIBLE',
        priority: 3
    });

    // error state for form validation (default empty)
    // record type allows us to map field names to error messages (key value pairs)
    const [errors, setErrors] = useState<Record<string, string>>({});

    // if the popup window is not open, return null
    if (!isOpen) return null;

    // handle form submission
    const handleSubmit = () => {
        // basic validation
        const newErrors: Record<string, string> = {};
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.date) newErrors.date = 'Date is required';
        if (!formData.startTime) newErrors.startTime = 'Start time is required';
        if (!formData.endTime) newErrors.endTime = 'End time is required';

        // Check if end time is after start time
        if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
            newErrors.endTime = 'End time must be after start time';
        }

        setErrors(newErrors);

        // if there are no errors
        if (Object.keys(newErrors).length === 0) {
            // Convert to ISO strings for API
            const startDateTime = new Date(`${formData.date}T${formData.startTime}`).toISOString();
            const endDateTime = new Date(`${formData.date}T${formData.endTime}`).toISOString();

            onSubmit({
                title: formData.title,
                startTime: startDateTime,
                endTime: endDateTime,
                flexibility: formData.flexibility,
                priority: formData.priority
            });

            // Reset form
            setFormData({
                title: '',
                date: '',
                startTime: '',
                endTime: '',
                flexibility: 'FLEXIBLE',
                priority: 3
            });
            setErrors({});
            onClose();
        }
    };

    // handle input change in form fields e.g when typing
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        // takes name of field and input value as args
        // here we are updating the form data state by using the setFormData function
        // ...prev is the previous state of formData
        // copy previous values, and then update the changed field
        // if the priority is being changed, parse the value as an integer
        // otherwise, use the value as is
        setFormData(prev => ({
            ...prev,
            [name]: name === 'priority' ? parseInt(value) : value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Get today's date in YYYY-MM-DD format for min date
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Add New Event</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <div className="p-6 space-y-4">
                    {/* Title */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                            Event Title *
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="e.g. Team Meeting, Gym Session"
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-300' : 'border-gray-300'
                                }`}
                        />
                        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                    </div>

                    {/* Date */}
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                            Date *
                        </label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={formData.date}
                            onChange={handleInputChange}
                            min={today}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.date ? 'border-red-300' : 'border-gray-300'
                                }`}
                        />
                        {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                    </div>

                    {/* Time Range */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                                Start Time *
                            </label>
                            <input
                                type="time"
                                id="startTime"
                                name="startTime"
                                value={formData.startTime}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.startTime ? 'border-red-300' : 'border-gray-300'
                                    }`}
                            />
                            {errors.startTime && <p className="text-red-500 text-xs mt-1">{errors.startTime}</p>}
                        </div>
                        <div>
                            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                                End Time *
                            </label>
                            <input
                                type="time"
                                id="endTime"
                                name="endTime"
                                value={formData.endTime}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.endTime ? 'border-red-300' : 'border-gray-300'
                                    }`}
                            />
                            {errors.endTime && <p className="text-red-500 text-xs mt-1">{errors.endTime}</p>}
                        </div>
                    </div>

                    {/* Flexibility */}
                    <div>
                        <label htmlFor="flexibility" className="block text-sm font-medium text-gray-700 mb-1">
                            Flexibility
                        </label>
                        <select
                            id="flexibility"
                            name="flexibility"
                            value={formData.flexibility}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="FLEXIBLE">Flexible - Can be moved anywhere</option>
                            <option value="DAY_LOCKED">Day Locked - Can move within the same day</option>
                            <option value="LOCKED">Locked - Cannot be moved</option>
                        </select>
                    </div>

                    {/* Priority */}
                    <div>
                        <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                            Priority
                        </label>
                        <select
                            id="priority"
                            name="priority"
                            value={formData.priority}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={1}>1 - Highest Priority</option>
                            <option value={2}>2 - High Priority</option>
                            <option value={3}>3 - Normal Priority</option>
                            <option value={4}>4 - Low Priority</option>
                            <option value={5}>5 - Lowest Priority</option>
                        </select>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Add Event
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}