import React, { useState } from 'react';
import { useStore } from '../services/store';
import { Compass, Users, MapPin, Calendar, Plus, Search, ArrowRight, Shield, CheckCircle2 } from 'lucide-react';

interface RoomsPageProps {
  onSelectRoom: (slug: string) => void;
}

export const RoomsPage: React.FC<RoomsPageProps> = ({ onSelectRoom }) => {
  const { rooms, isMemberOfRoom, activeUser } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const allCategories = ['all', 'Education Technology', 'Hardware & IoT', 'Impact Investment', 'Public Policy', 'Climate Solutions'];

  const filteredRooms = rooms.filter(room => {
    const matchesSearch =
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.organization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || room.categories.includes(selectedCategory);
    return matchesSearch && matchesCat;
  });

  return (
    <div id="rooms-directory-page" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Compass className="w-6 h-6 text-teal-700" />
            <span>NexusRooms</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Contextual networking spaces for conferences, leadership programs, and accelerators.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search rooms by name, city, organizer, or summit..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {allCategories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition ${
                selectedCategory === cat
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Room Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRooms.map(room => {
          const isMember = isMemberOfRoom(room.id);
          return (
            <div
              key={room.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-teal-400 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between"
            >
              <div className="p-5">
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                    {room.type}
                  </span>
                  {isMember && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      Joined
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">{room.name}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-2">
                  {room.shortDescription}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{room.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{room.memberCount} active participants</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">
                  By {room.organization}
                </span>
                <button
                  type="button"
                  onClick={() => onSelectRoom(room.slug)}
                  className="flex items-center gap-1 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs py-1.5 px-3.5 rounded-xl shadow-sm transition active:scale-95"
                >
                  <span>{isMember ? 'Enter Room' : 'Join & Match'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
