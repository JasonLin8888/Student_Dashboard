import { useState } from 'react';
import { Paperclip, CheckSquare, ArrowLeft } from 'lucide-react';
import { mockEmails } from '../data/mockData';
import { EmailMessage } from '../types';

export default function InboxPanel() {
  const [emails, setEmails] = useState<EmailMessage[]>(mockEmails);
  const [selected, setSelected] = useState<EmailMessage | null>(null);

  const markRead = (id: string) => {
    setEmails(emails.map(e => e.id === id ? { ...e, read: true } : e));
  };

  const handleSelect = (email: EmailMessage) => {
    setSelected(email);
    markRead(email.id);
  };

  const convertToTask = (email: EmailMessage) => {
    alert(`Task created from: "${email.subject}"`);
  };

  const unreadCount = emails.filter(e => !e.read).length;

  if (selected) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <button onClick={() => setSelected(null)} className="p-1 hover:bg-gray-100 rounded">
            <ArrowLeft className="w-4 h-4 text-gray-500" />
          </button>
          <span className="text-sm font-medium text-gray-700 flex-1 truncate">{selected.subject}</span>
          <button
            onClick={() => convertToTask(selected)}
            title="Convert to task"
            className="p-1 hover:bg-indigo-100 rounded text-indigo-600"
          >
            <CheckSquare className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <div className="mb-3">
            <p className="text-xs text-gray-500">From: {selected.from}</p>
            <p className="text-xs text-gray-500">Date: {selected.date}</p>
          </div>
          <h3 className="font-semibold text-gray-800 mb-3">{selected.subject}</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{selected.body}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Inbox</h2>
          {unreadCount > 0 && (
            <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      {/* Email list */}
      <div className="flex-1 overflow-y-auto">
        {emails.map(email => (
          <button
            key={email.id}
            onClick={() => handleSelect(email)}
            className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
              !email.read ? 'bg-indigo-50/40' : ''
            }`}
          >
            <div className="flex items-start gap-2">
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${email.read ? 'bg-transparent' : 'bg-indigo-500'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className={`text-xs truncate ${!email.read ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                    {email.from.split('<')[0].trim()}
                  </p>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {email.hasAttachment && <Paperclip className="w-3 h-3 text-gray-400" />}
                    <span className="text-xs text-gray-400">{email.date}</span>
                  </div>
                </div>
                <p className={`text-xs ${!email.read ? 'font-medium text-gray-800' : 'text-gray-600'} truncate`}>
                  {email.subject}
                </p>
                <p className="text-xs text-gray-400 truncate">{email.preview}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
