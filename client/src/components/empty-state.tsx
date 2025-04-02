import { PlusCircle } from 'lucide-react';

interface EmptyStateProps {
  onAddNew: () => void;
}

export function EmptyState({ onAddNew }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <svg className="w-20 h-20 text-apple-gray mb-4 opacity-50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
      <h3 className="text-xl font-medium text-gray-900 mb-2">No AI tools found</h3>
      <p className="text-apple-gray text-center max-w-md mb-6">
        Your AI ecosystem is empty. Add your first AI tool to start building your collection.
      </p>
      <button 
        className="px-5 py-2.5 bg-apple-blue text-white rounded-lg flex items-center hover:bg-blue-600 transition-colors duration-200"
        onClick={onAddNew}
      >
        <PlusCircle className="w-5 h-5 mr-2" />
        Add your first AI tool
      </button>
    </div>
  );
}
