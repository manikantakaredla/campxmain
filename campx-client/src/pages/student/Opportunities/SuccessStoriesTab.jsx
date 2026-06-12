import React, { useState, useEffect } from 'react';
import { getStories } from '../../../services/successStoryService';
import toast from 'react-hot-toast';
import { Star } from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa';

const SuccessStoriesTab = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const { data } = await getStories();
        setStories(data);
      } catch (err) {
        toast.error('Failed to load success stories');
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Alumni Success Stories</h2>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-100 animate-pulse rounded-xl"></div>
          <div className="h-64 bg-gray-100 animate-pulse rounded-xl"></div>
        </div>
      ) : stories.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 flex flex-col items-center justify-center text-center">
          <div className="bg-yellow-50 p-4 rounded-full mb-4">
            <Star size={48} className="text-yellow-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Stories Published</h3>
          <p className="text-gray-500 max-w-md">Our alumni success stories will be published here soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map(story => (
            <div key={story._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
              {story.photo && (
                <img src={story.photo} alt={story.studentName} className="w-full h-48 object-cover" />
              )}
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{story.studentName}</h3>
                    <p className="text-blue-600 font-medium text-sm">{story.companyName} • {story.batch}</p>
                  </div>
                  {story.linkedin && (
                    <a href={story.linkedin} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700">
                      <FaLinkedin size={20} />
                    </a>
                  )}
                </div>
                
                {story.package && (
                  <span className="inline-block px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full mb-4 border border-green-100">
                    {story.package}
                  </span>
                )}
                
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-4 italic">"{story.story}"</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SuccessStoriesTab;
